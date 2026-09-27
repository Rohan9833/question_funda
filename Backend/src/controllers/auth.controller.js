const User = require("../../models/User");
const StudentProfile = require("../../models/StudentProfile");
const TeacherProfile = require("../../models/TeacherProfile");
const Session = require("../../models/Session");
const {
  REFRESH_TOKEN_TTL_MS,
  hashPassword,
  verifyPassword,
  signAccessToken,
  createRefreshToken,
  hashRefreshToken,
} = require("../utils/auth");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (user, profile = null) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  phone: user.phone,
  isActive: user.isActive,
  isEmailVerified: user.isEmailVerified,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  profile,
});

const createTokens = async (user, req) => {
  const refreshToken = createRefreshToken();

  await Session.create({
    userId: user._id,
    refreshTokenHash: hashRefreshToken(refreshToken),
    device: req.body?.device || "",
    userAgent: req.get("user-agent") || "",
    ipAddress: req.ip || "",
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return {
    accessToken: signAccessToken({
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    }),
    refreshToken,
  };
};

const getProfile = async (user) => {
  if (user.role === "student") {
    return StudentProfile.findOne({ userId: user._id }).lean();
  }

  if (user.role === "teacher") {
    return TeacherProfile.findOne({ userId: user._id }).lean();
  }

  return null;
};

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone = "",
      profileImage = "",
      ...profileData
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "name, email, password and role are required",
      });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Registration is available for student or teacher accounts",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role,
      phone,
      profileImage,
    });

    try {
      if (role === "student") {
        if (!profileData.studentId) {
          throw new Error("studentId is required for student registration");
        }

        await StudentProfile.create({
          userId: user._id,
          ...profileData,
        });
      } else {
        if (!profileData.teacherId) {
          throw new Error("teacherId is required for teacher registration");
        }

        await TeacherProfile.create({
          userId: user._id,
          ...profileData,
        });
      }
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    const profile = await getProfile(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: publicUser(user, profile),
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, device = "" } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+passwordHash"
    );

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    req.body.device = device;
    const tokens = await createTokens(user, req);
    const profile = await getProfile(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: publicUser(user, profile),
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "refreshToken is required",
      });
    }

    const session = await Session.findOne({
      refreshTokenHash: hashRefreshToken(refreshToken),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).select("+refreshTokenHash");

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(session.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is unavailable",
      });
    }

    const newRefreshToken = createRefreshToken();
    session.refreshTokenHash = hashRefreshToken(newRefreshToken);
    session.lastUsedAt = new Date();
    session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await session.save();

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: signAccessToken({
          sub: user._id.toString(),
          role: user.role,
          email: user.email,
        }),
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await Session.updateOne(
        {
          userId: req.auth.sub,
          refreshTokenHash: hashRefreshToken(refreshToken),
          revokedAt: null,
        },
        { $set: { revokedAt: new Date() } }
      );
    } else {
      await Session.updateMany(
        { userId: req.auth.sub, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.sub);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is unavailable",
      });
    }

    const profile = await getProfile(user);

    return res.status(200).json({
      success: true,
      data: publicUser(user, profile),
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedUserFields = ["name", "phone", "profileImage"];
    const userUpdates = {};

    for (const field of allowedUserFields) {
      if (req.body[field] !== undefined) userUpdates[field] = req.body[field];
    }

    const user = await User.findById(req.auth.sub);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    Object.assign(user, userUpdates);
    await user.save();

    let profile;

    if (user.role === "student") {
      const allowed = [
        "dateOfBirth",
        "gender",
        "standard",
        "board",
        "schoolName",
        "academicYear",
      ];
      const updates = {};
      for (const field of allowed) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      }
      profile = await StudentProfile.findOneAndUpdate(
        { userId: user._id },
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();
    } else if (user.role === "teacher") {
      const allowed = [
        "qualification",
        "specialization",
        "experience",
        "institution",
        "designation",
        "subjects",
      ];
      const updates = {};
      for (const field of allowed) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      }
      profile = await TeacherProfile.findOneAndUpdate(
        { userId: user._id },
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: publicUser(user, profile),
    });
  } catch (error) {
    next(error);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    await Session.updateMany(
      { userId: req.auth.sub, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: "All sessions logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  me,
  updateProfile,
};

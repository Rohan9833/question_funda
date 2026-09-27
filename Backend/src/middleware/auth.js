const { verifyAccessToken } = require("../utils/auth");

const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    req.auth = verifyAccessToken(token);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid or expired access token",
    });
  }
};

module.exports = { requireAuth };

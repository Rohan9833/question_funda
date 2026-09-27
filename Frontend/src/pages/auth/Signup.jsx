import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Users, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { registerApi } from "../../api/auth.api";

export default function Signup() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    standard: "",
    board: "",
    schoolName: "",
    teacherId: "",
    qualification: "",
    specialization: "",
    institution: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm((x) => ({ ...x, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password)
      return setError("Name, email and password are required.");
    if (form.password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    const id = role === "student" ? form.studentId : form.teacherId;
    if (!id.trim())
      return setError(
        (role === "student" ? "Student" : "Teacher") + " ID is required.",
      );
    try {
      setSubmitting(true);
      const profile =
        role === "student"
          ? {
              studentId: form.studentId.trim(),
              standard: form.standard.trim(),
              board: form.board.trim(),
              schoolName: form.schoolName.trim(),
            }
          : {
              teacherId: form.teacherId.trim(),
              qualification: form.qualification.trim(),
              specialization: form.specialization.trim(),
              institution: form.institution.trim(),
            };
      await registerApi({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
        ...profile,
      });
      const user = await login(form.email.trim(), form.password);
      nav("/" + user.role + "/dashboard");
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  };
  const input = (k, label, placeholder, type = "text") => (
    <label>
      {label}
      <input
        type={type}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
  return (
    <div className="login-page">
      <section className="login-art">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles />
          </div>
          <strong>Question Funda</strong>
        </div>
        <div>
          <span className="pill">CREATE YOUR WORKSPACE</span>
          <h1>Start building, practicing and taking exams.</h1>
          <p>
            Create your Question Funda account and get your own workspace for
            questions, papers and exams.
          </p>
        </div>
      </section>
      <section className="login-panel signup-panel">
        <span className="eyebrow">New here?</span>
        <h2>Create your account</h2>
        <p>Choose your workspace and enter your account details.</p>
        <div className="login-role-picker">
          <button
            type="button"
            className={"role-login " + (role === "teacher" ? "selected" : "")}
            onClick={() => setRole("teacher")}
          >
            <Users />
            <span>
              <strong>Teacher</strong>
              <small>Manage questions and exams</small>
            </span>
          </button>
          <button
            type="button"
            className={"role-login " + (role === "student" ? "selected" : "")}
            onClick={() => setRole("student")}
          >
            <GraduationCap />
            <span>
              <strong>Student</strong>
              <small>Take exams and view results</small>
            </span>
          </button>
        </div>
        <form className="login-form signup-form" onSubmit={submit}>
          {input("name", "Full name", "Your full name")}
          {input("email", "Email", "you@example.com", "email")}
          <div className="signup-two-col">
            {input("password", "Password", "Minimum 8 characters", "password")}
            {input(
              "confirmPassword",
              "Confirm password",
              "Repeat password",
              "password",
            )}
          </div>
          {role === "student" ? (
            <div className="signup-section">
              <strong>Student details</strong>
              <div className="signup-two-col">
                {input("studentId", "Student ID", "e.g. STU001")}
                {input("standard", "Standard", "e.g. 12th")}
                {input("board", "Board", "e.g. CBSE")}
                {input("schoolName", "School name", "School name")}
              </div>
            </div>
          ) : (
            <div className="signup-section">
              <strong>Teacher details</strong>
              <div className="signup-two-col">
                {input("teacherId", "Teacher ID", "e.g. TCH001")}
                {input("qualification", "Qualification", "e.g. M.Sc.")}
                {input("specialization", "Specialization", "e.g. Mathematics")}
                {input("institution", "Institution", "Institution name")}
              </div>
            </div>
          )}
          {error && <div className="login-error">{error}</div>}
          <button
            className="btn primary login-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>
        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </section>
    </div>
  );
}

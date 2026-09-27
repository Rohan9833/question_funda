import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login, logout } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const enter = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email.trim(), password);

      if (user.role !== role) {
        setError(`This account is registered as a ${user.role}. Please select ${user.role}.`);
        await useAuth;
        return;
      }

      nav(`/${user.role}/dashboard`);
    } catch (loginError) {
      setError(loginError.message || "Unable to login.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-art">
        <div className="brand">
          <div className="brand-mark"><Sparkles /></div>
          <strong>Question Funda</strong>
        </div>
        <div>
          <span className="pill">QUESTION BANK → EXAM</span>
          <h1>One workspace for every question and every exam.</h1>
          <p>Import questions, build balanced papers and let students take exams online or with a physical answer sheet.</p>
        </div>
      </section>

      <section className="login-panel">
        <span className="eyebrow">Welcome back</span>
        <h2>Sign in to Question Funda</h2>
        <p>Choose your workspace and enter your account credentials.</p>

        <div className="login-role-picker">
          <button type="button" className={`role-login ${role === "teacher" ? "selected" : ""}`} onClick={() => setRole("teacher")}>
            <Users />
            <span><strong>Teacher</strong><small>Manage questions and exams</small></span>
            <ArrowRight />
          </button>
          <button type="button" className={`role-login ${role === "student" ? "selected" : ""}`} onClick={() => setRole("student")}>
            <GraduationCap />
            <span><strong>Student</strong><small>Take exams and view results</small></span>
            <ArrowRight />
          </button>
        </div>

        <form className="login-form" onSubmit={enter}>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" /></label>

          {error && <div className="login-error">{error}</div>}

          <button className="btn primary login-submit" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login, logout } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const enter = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Account ID / email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email.trim(), password);

      if (user.role === "admin") {
        nav("/principal/dashboard");
        return;
      }

      if (user.role === "teacher") {
        nav("/teacher/dashboard");
        return;
      }

      nav("/student/dashboard");
    } catch (loginError) {
      setError(loginError.message || "Unable to login.");
      await logout();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[1.15fr_.85fr]">
      <section className="hidden bg-[#111827] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-500">
            <Sparkles size={20} />
          </div>
          <div>
            <strong className="block font-[Manrope] text-base">Question Funda</strong>
            <span className="text-xs text-slate-400">Examination management platform</span>
          </div>
        </div>

        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-green-400">
            Principal access
          </span>
          <h1 className="mt-5 font-[Manrope] text-5xl font-extrabold leading-tight tracking-tight">
            One control center for the entire examination system.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
            Monitor teachers, students, exams, question papers, question banks and
            academic activity from one organized workspace.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <ShieldCheck size={16} className="text-green-400" />
          Secure role-based workspace
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-500 text-white">
                <Sparkles size={20} />
              </div>
              <div>
                <strong className="block font-[Manrope] text-base text-slate-900">
                  Question Funda
                </strong>
                <span className="text-xs text-slate-400">Examination workspace</span>
              </div>
            </div>
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-green-600">
            Welcome back
          </span>
          <h2 className="mt-2 font-[Manrope] text-3xl font-extrabold tracking-tight text-slate-900">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Use your account ID or email and password. Your workspace opens automatically.
          </p>

          <form className="mt-7 grid gap-4" onSubmit={enter}>
            <label className="text-xs font-bold text-slate-700">
              Account ID / Email
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter account ID or email"
                autoComplete="username"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
              />
            </label>

            <label className="text-xs font-bold text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
              />
            </label>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-xs font-extrabold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Continue"}
              {!submitting && <ArrowRight size={15} />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Need a new account?{" "}
            <Link className="font-bold text-green-600 hover:text-green-700" to="/signup">
              Create one
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

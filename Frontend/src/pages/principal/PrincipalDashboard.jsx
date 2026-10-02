import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Activity, ArrowUpRight, BookOpen, CheckCircle2, ClipboardCheck, GraduationCap, RefreshCw, Search, ShieldCheck, Users, FileText, Power, Clock3, X, Eye, CircleCheck, CircleX, CircleMinus } from "lucide-react";
import { principalApi } from "../../api/principal.api";

const navTitle = {
  dashboard: ["System Overview", "A live view of the Question Funda ecosystem."],
  teachers: ["Teachers", "Manage teacher accounts and view their academic contribution."],
  students: ["Students", "Monitor the complete student population and examination activity."],
  exams: ["All Exams", "Every draft, live and closed examination across the platform."],
  papers: ["Question Papers", "Every generated paper with ownership, size and status."],
  questions: ["Question Bank", "A central view of every question across all subjects."],
  analytics: ["System Analytics", "Institution-wide examination activity and performance."]
};

function Status({ children }) {
  const map = { Active: "bg-green-50 text-green-700", Live: "bg-green-50 text-green-700", Published: "bg-green-50 text-green-700", Closed: "bg-slate-100 text-slate-600", Completed: "bg-slate-100 text-slate-600", Scheduled: "bg-blue-50 text-blue-700", Draft: "bg-amber-50 text-amber-700", Inactive: "bg-red-50 text-red-600" };
  return <span className={"inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold " + (map[children] || "bg-slate-100 text-slate-600")}>{children}</span>;
}
function Difficulty({ value }) {
  const cls = value === "Easy" ? "bg-green-50 text-green-700" : value === "Hard" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700";
  return <span className={"rounded-full px-2.5 py-1 text-[9px] font-extrabold " + cls}>{value}</span>;
}
function SectionHeader({ title, description, count, onRefresh, refreshing }) {
  return <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="font-[Manrope] text-xl font-extrabold tracking-tight text-slate-900">{title}</h1><p className="mt-1 text-xs text-slate-500">{description}</p></div><div className="flex items-center gap-2">{count !== undefined && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500">{count} records</span>}{onRefresh && <button onClick={onRefresh} disabled={refreshing} className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600 hover:border-green-200 hover:text-green-700 disabled:opacity-50"><RefreshCw size={13} className={refreshing ? "animate-spin" : ""}/>Refresh</button>}</div></div>;
}
function DataTable({ headers, children, minWidth = "760px" }) { return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full border-collapse" style={{ minWidth }}><thead><tr className="border-b border-slate-100 bg-slate-50/80">{headers.map((h) => <th key={h} className="px-5 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div></div>; }
function Cell({ children, className = "" }) { return <td className={"px-5 py-4 text-xs text-slate-600 " + className}>{children}</td>; }
function Loading() { return <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-20 text-xs text-slate-400">Loading principal data...</div>; }
function ErrorBox({ message, onRetry }) { return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-xs text-red-700"><strong className="block">Unable to load this section</strong><span className="mt-1 block">{message}</span><button onClick={onRetry} className="mt-3 rounded-lg bg-white px-3 py-2 font-bold text-red-700 shadow-sm">Try again</button></div>; }
function SearchBox({ value, onChange, placeholder }) { return <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search size={14} className="text-slate-400"/><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-xs outline-none"/></label>; }
function MiniStat({ icon: Icon, label, value }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-green-50 text-green-600"><Icon size={16}/></div><div><span className="block text-[10px] text-slate-400">{label}</span><strong className="text-lg font-extrabold text-slate-900">{value}</strong></div></div></div>; }

export default function PrincipalDashboard() {
  const location = useLocation(); const navigate = useNavigate();
  const section = location.pathname.split("/").filter(Boolean)[1] || "dashboard";
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [error, setError] = useState("");
  const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [subject, setSubject] = useState(""); const [difficulty, setDifficulty] = useState("");
  const [examDetail, setExamDetail] = useState(null); const [paperDetail, setPaperDetail] = useState(null); const [attemptDetail, setAttemptDetail] = useState(null); const [detailLoading, setDetailLoading] = useState(false);
  const load = useCallback(async (refresh = false) => {
    try { setError(""); refresh ? setRefreshing(true) : setLoading(true);
      let response;
      if (section === "dashboard") response = await principalApi.overview();
      else if (section === "teachers") response = await principalApi.teachers({ search, page: 1, limit: 100 });
      else if (section === "students") response = await principalApi.students({ search, page: 1, limit: 100 });
      else if (section === "exams") response = await principalApi.exams({ search, status, page: 1, limit: 100 });
      else if (section === "papers") response = await principalApi.papers({ search, page: 1, limit: 100 });
      else if (section === "questions") response = await principalApi.questions({ search, subject, difficulty, page: 1, limit: 100 });
      else response = await principalApi.analytics();
      setData(response.data?.data || null);
    } catch (e) { setError(e.response?.data?.message || e.message || "Request failed."); } finally { setLoading(false); setRefreshing(false); }
  }, [section, search, status, subject, difficulty]);

  useEffect(() => { const timer = setTimeout(() => load(), 250); return () => clearTimeout(timer); }, [load]);
  useEffect(() => { setSearch(""); setStatus(""); setSubject(""); setDifficulty(""); }, [section]);

  const toggleStatus = async (user) => {
    try { await principalApi.setUserStatus(user.id, !user.isActive); await load(true); }
    catch (e) { setError(e.response?.data?.message || "Could not update account status."); }
  };

  const openExam = async (exam) => {
    try {
      setDetailLoading(true);
      setAttemptDetail(null);
      const response = await principalApi.examPerformance(exam.id);
      setExamDetail(response.data?.data || null);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not load exam performance.");
    } finally { setDetailLoading(false); }
  };

  const openExamAttempt = async (row) => {
    try {
      setDetailLoading(true);
      const response = await principalApi.examAttemptDetail(row.examId || examDetail?.exam?.id, row.attemptId);
      setAttemptDetail(response.data?.data || null);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not load student performance.");
    } finally { setDetailLoading(false); }
  };

  const openPaper = async (paper) => {
    try {
      setDetailLoading(true);
      const response = await principalApi.paperDetail(paper.id);
      setPaperDetail(response.data?.data || null);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not load question paper.");
    } finally { setDetailLoading(false); }
  };

  const updateExamStatus = async (exam, status) => {
    try {
      await principalApi.updateExamStatus(exam.id, status);
      await load(true);
      if (examDetail?.exam?.id === exam.id) {
        const response = await principalApi.examPerformance(exam.id);
        setExamDetail(response.data?.data || null);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not update exam status.");
    }
  };

  if (loading) return <Loading/>;
  if (error && !data) return <ErrorBox message={error} onRetry={() => load()}/>;
  const [title, description] = navTitle[section] || navTitle.dashboard;

  if (section === "teachers") return <Teachers data={data} search={search} setSearch={setSearch} toggleStatus={toggleStatus} load={() => load(true)} refreshing={refreshing} title={title} description={description}/>;
  if (section === "students") return <Students data={data} search={search} setSearch={setSearch} toggleStatus={toggleStatus} load={() => load(true)} refreshing={refreshing} title={title} description={description}/>;
  if (section === "exams") return <><Exams data={data} search={search} setSearch={setSearch} status={status} setStatus={setStatus} load={() => load(true)} refreshing={refreshing} title={title} description={description} onOpen={openExam} onActivate={updateExamStatus}/>{(examDetail || detailLoading) && <PrincipalExamModal data={examDetail} loading={detailLoading} attemptDetail={attemptDetail} onOpenAttempt={openExamAttempt} onCloseAttempt={() => setAttemptDetail(null)} onClose={() => { setExamDetail(null); setAttemptDetail(null); }} />}</>;
  if (section === "papers") return <><Papers data={data} search={search} setSearch={setSearch} load={() => load(true)} refreshing={refreshing} title={title} description={description} onOpen={openPaper}/>{(paperDetail || detailLoading) && <PrincipalPaperModal data={paperDetail} loading={detailLoading} onClose={() => setPaperDetail(null)} />}</>;
  if (section === "questions") return <Questions data={data} search={search} setSearch={setSearch} subject={subject} setSubject={setSubject} difficulty={difficulty} setDifficulty={setDifficulty} load={() => load(true)} refreshing={refreshing} title={title} description={description}/>;
  if (section === "analytics") return <Analytics data={data} load={() => load(true)} refreshing={refreshing} title={title} description={description}/>;
  return <Overview data={data} navigate={navigate} load={() => load(true)} refreshing={refreshing}/>;
}

function Toolbar({ children }) { return <div className="mb-4 flex flex-col gap-2 sm:flex-row">{children}</div>; }
function Teachers({ data, search, setSearch, toggleStatus, load, refreshing, title, description }) { const list=data?.teachers||[]; return <div><SectionHeader title={title} description={description} count={data?.pagination?.total||0} onRefresh={load} refreshing={refreshing}/><div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><MiniStat icon={Users} label="Total teachers" value={data?.summary?.totalTeachers||0}/><MiniStat icon={CheckCircle2} label="Active" value={data?.summary?.activeTeachers||0}/><MiniStat icon={FileText} label="Visible on this page" value={list.length}/></div><Toolbar><SearchBox value={search} onChange={setSearch} placeholder="Search teacher name or email..."/></Toolbar><DataTable headers={["Teacher","ID","Subject","Papers","Exams","Status","Action"]}>{list.map((t)=><tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"><Cell><strong className="block font-bold text-slate-800">{t.name}</strong><span className="text-[10px] text-slate-400">{t.email}</span></Cell><Cell className="font-mono text-[10px]">{t.teacherId}</Cell><Cell>{t.subject}</Cell><Cell>{t.papers}</Cell><Cell>{t.exams}</Cell><Cell><Status>{t.status}</Status></Cell><Cell><button onClick={()=>toggleStatus(t)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[9px] font-bold text-slate-500 hover:border-green-200 hover:text-green-700"><Power size={12}/>{t.isActive?"Deactivate":"Activate"}</button></Cell></tr>)}</DataTable>{!list.length&&<Empty text="No teachers found."/>}</div>; }
function Students({ data, search, setSearch, toggleStatus, load, refreshing, title, description }) { const list=data?.students||[]; return <div><SectionHeader title={title} description={description} count={data?.pagination?.total||0} onRefresh={load} refreshing={refreshing}/><div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><MiniStat icon={GraduationCap} label="Total students" value={data?.summary?.totalStudents||0}/><MiniStat icon={Users} label="Active" value={data?.summary?.activeStudents||0}/><MiniStat icon={ClipboardCheck} label="Exam attempts" value={data?.summary?.totalAttempts||0}/></div><Toolbar><SearchBox value={search} onChange={setSearch} placeholder="Search name, email or student ID..."/></Toolbar><DataTable headers={["Student","ID","Class","Exams","Average","Status","Action"]}>{list.map((s)=><tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"><Cell><strong className="block font-bold text-slate-800">{s.name}</strong><span className="text-[10px] text-slate-400">{s.email}</span></Cell><Cell className="font-mono text-[10px]">{s.studentId}</Cell><Cell>{s.className}</Cell><Cell>{s.exams}<span className="ml-1 text-[10px] text-slate-400">({s.attempts})</span></Cell><Cell className="font-bold text-slate-800">{s.average}%</Cell><Cell><Status>{s.status}</Status></Cell><Cell><button onClick={()=>toggleStatus(s)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[9px] font-bold text-slate-500 hover:border-green-200 hover:text-green-700"><Power size={12}/>{s.isActive?"Deactivate":"Activate"}</button></Cell></tr>)}</DataTable>{!list.length&&<Empty text="No students found."/>}</div>; }
function Exams({ data, search, setSearch, status, setStatus, load, refreshing, title, description, onOpen, onActivate }) { const list=data?.exams||[]; return <div><SectionHeader title={title} description={description} count={data?.pagination?.total||0} onRefresh={load} refreshing={refreshing}/><Toolbar><SearchBox value={search} onChange={setSearch} placeholder="Search exams..."/><select value={status} onChange={e=>setStatus(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 outline-none"><option value="">All statuses</option><option>Draft</option><option>Live</option><option>Closed</option></select></Toolbar><DataTable headers={["Exam","Teacher","Questions","Attempts","Date","Status"]}>{list.map(e=><tr key={e.id} className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50/60" onClick={()=>onOpen(e)}><Cell><strong className="block max-w-xs font-bold text-slate-800">{e.name}</strong><span className="text-[10px] text-slate-400">{e.id}</span></Cell><Cell>{e.teacher}</Cell><Cell>{e.questions}</Cell><Cell>{e.attempts}</Cell><Cell>{new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</Cell><Cell><div className="flex items-center gap-2"><Status>{e.status}</Status>{e.status==="Draft"&&<button type="button" onClick={(event)=>{event.stopPropagation();onActivate(e,"Live");}} className="rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-[9px] font-extrabold text-green-700">Activate</button>}<Eye size={13} className="text-slate-400"/></div></Cell></tr>)}</DataTable>{!list.length&&<Empty text="No exams found."/>}</div>; }
function Papers({ data, search, setSearch, load, refreshing, title, description, onOpen }) { const list=data?.papers||[]; return <div><SectionHeader title={title} description={description} count={data?.pagination?.total||0} onRefresh={load} refreshing={refreshing}/><Toolbar><SearchBox value={search} onChange={setSearch} placeholder="Search question papers..."/></Toolbar><DataTable headers={["Question paper","Teacher","Questions","Duration","Subject","Status"]}>{list.map(p=><tr key={p.id} className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50/60" onClick={()=>onOpen(p)}><Cell><strong className="block font-bold text-slate-800">{p.name}</strong><span className="text-[10px] text-slate-400">{p.id}</span></Cell><Cell>{p.teacher}</Cell><Cell>{p.questions}</Cell><Cell><Clock3 size={13} className="mr-1 inline"/> {p.duration} min</Cell><Cell>{p.subject}</Cell><Cell><Status>{p.status}</Status></Cell></tr>)}</DataTable>{!list.length&&<Empty text="No question papers found."/>}</div>; }
function Questions({ data, search, setSearch, subject, setSubject, difficulty, setDifficulty, load, refreshing, title, description }) { const list=data?.questions||[]; const subjects=data?.subjects||[]; return <div><SectionHeader title={title} description={description} count={data?.pagination?.total||0} onRefresh={load} refreshing={refreshing}/><Toolbar><SearchBox value={search} onChange={setSearch} placeholder="Search question, chapter or creator..."/><select value={subject} onChange={e=>setSubject(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 outline-none"><option value="">All subjects</option>{subjects.map(s=><option key={s}>{s}</option>)}</select><select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 outline-none"><option value="">All difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option></select></Toolbar><DataTable headers={["Question","Subject","Chapter","Difficulty","Created by"]} minWidth="900px">{list.map(q=><tr key={q.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"><Cell><strong className="block max-w-lg font-semibold leading-5 text-slate-800">{q.text}</strong><span className="mt-1 block text-[10px] text-slate-400">{(q.options||[]).map(o=>o.text||o).join(" · ")}</span></Cell><Cell>{q.subject}</Cell><Cell>{q.chapter}</Cell><Cell><Difficulty value={q.difficulty}/></Cell><Cell>{q.createdBy}</Cell></tr>)}</DataTable>{!list.length&&<Empty text="No questions found."/>}</div>; }
function Analytics({ data, load, refreshing, title, description }) { const activity=data?.activity||[]; const max=Math.max(...activity.map(x=>x.attempts),1); return <div><SectionHeader title={title} description={description} onRefresh={load} refreshing={refreshing}/><div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><MiniStat icon={ClipboardCheck} label="Total attempts" value={data?.totals?.attempts||0}/><MiniStat icon={Activity} label="Average score" value={(data?.totals?.averagePercent||0)+"%"}/><MiniStat icon={Clock3} label="Pending reviews" value={data?.totals?.pendingReviews||0}/></div><div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-sm font-extrabold text-slate-900">Exam activity</h2><p className="mt-1 text-[10px] text-slate-400">Attempts over the last 7 days</p></div><Activity size={17} className="text-green-600"/></div><div className="mt-8 flex h-56 items-end gap-3 border-b border-slate-100">{activity.map((x,i)=><div key={x.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end"><div title={x.attempts+" attempts"} className="w-full rounded-t-lg bg-green-500/80" style={{height: Math.max((x.attempts/max)*100, x.attempts?5:0)+"%"}}/></div><span className="text-[9px] text-slate-400">{x.label}</span></div>)}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-extrabold text-slate-900">Exam status</h2><p className="mt-1 text-[10px] text-slate-400">Current platform distribution</p><div className="mt-6 space-y-4">{Object.entries(data?.examStatuses||{}).map(([key,value])=><div key={key} className="flex items-center justify-between"><Status>{key}</Status><strong className="text-sm text-slate-800">{value}</strong></div>)}{!Object.keys(data?.examStatuses||{}).length&&<span className="text-xs text-slate-400">No exams yet.</span>}</div></section></div></div>; }
function Overview({ data, navigate, load, refreshing }) { const c=data?.counts||{}; return <div className="space-y-6"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-green-600">Principal control center</span><h1 className="mt-2 font-[Manrope] text-3xl font-extrabold tracking-tight text-slate-900">System Overview</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Live information across teachers, students, questions, papers and examinations.</p></div><div className="flex items-center gap-2"><button onClick={load} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600"><RefreshCw size={13} className={refreshing?"animate-spin":""}/>Refresh</button><span className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-[10px] font-bold text-green-700"><ShieldCheck size={14}/> Full system visibility</span></div></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-5"><MiniStat icon={Users} label="Teachers" value={c.teachers||0}/><MiniStat icon={GraduationCap} label="Students" value={c.students||0}/><MiniStat icon={BookOpen} label="Questions" value={c.questions||0}/><MiniStat icon={FileText} label="Question papers" value={c.papers||0}/><MiniStat icon={ClipboardCheck} label="Exams" value={c.exams||0}/></div><div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]"><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-extrabold text-slate-900">Recent examinations</h2><p className="mt-1 text-[10px] text-slate-400">Latest activity across the institution</p></div><button onClick={()=>navigate("/principal/exams")} className="flex items-center gap-1 text-[10px] font-bold text-green-600">View all <ArrowUpRight size={13}/></button></div>{(data?.recentExams||[]).map(e=><div key={e.id} className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500"><ClipboardCheck size={17}/></div><div className="min-w-0 flex-1"><strong className="block truncate text-xs font-bold text-slate-800">{e.name}</strong><span className="mt-1 block text-[10px] text-slate-400">{e.teacher} · {e.questions} questions · {e.attempts} attempts</span></div><Status>{e.status}</Status></div>)}{!(data?.recentExams||[]).length&&<Empty text="No examinations yet."/>}</section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-extrabold text-slate-900">System health</h2><p className="mt-1 text-[10px] text-slate-400">Current live account and exam indicators</p><div className="mt-5 space-y-4"><Health label="Active teachers" value={(data?.active?.teachers||0)+" / "+(c.teachers||0)} percent={c.teachers?Math.round((data.active.teachers/c.teachers)*100):0}/><Health label="Active students" value={(data?.active?.students||0)+" / "+(c.students||0)} percent={c.students?Math.round((data.active.students/c.students)*100):0}/><Health label="Published papers" value={data?.publishedPapers||0} percent={c.papers?Math.round((data.publishedPapers/c.papers)*100):0}/><Health label="Live exams" value={data?.liveExams||0} percent={c.exams?Math.round((data.liveExams/c.exams)*100):0}/></div></section></div><div className="grid grid-cols-1 gap-4 md:grid-cols-3"><QuickPanel icon={Users} title="Teachers" value={c.teachers||0} text="Manage teacher accounts and status." onClick={()=>navigate("/principal/teachers")}/><QuickPanel icon={GraduationCap} title="Students" value={c.students||0} text="Review the complete student population." onClick={()=>navigate("/principal/students")}/><QuickPanel icon={BookOpen} title="Question Bank" value={c.questions||0} text="Inspect every question across subjects." onClick={()=>navigate("/principal/questions")}/></div></div>; }
function Health({label,value,percent}){return <div><div className="mb-1.5 flex justify-between text-[10px]"><span className="font-semibold text-slate-600">{label}</span><strong className="text-slate-800">{value}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-green-500" style={{width:Math.min(percent,100)+"%"}}/></div></div>;}
function QuickPanel({icon:Icon,title,value,text,onClick}){return <button onClick={onClick} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"><div className="flex items-center justify-between"><div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 group-hover:bg-green-50 group-hover:text-green-600"><Icon size={17}/></div><ArrowUpRight size={15} className="text-slate-300 group-hover:text-green-600"/></div><strong className="mt-4 block text-xl text-slate-900">{title} · {value}</strong><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></button>;}
function Empty({text}){return <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-xs text-slate-400">{text}</div>;}

function PrincipalExamModal({ data, loading, attemptDetail, onOpenAttempt, onCloseAttempt, onClose }) {
  if (loading && !data) return <div className="modal-backdrop"><div className="modal"><div className="empty-state">Loading exam performance...</div></div></div>;
  const exam = data?.exam || {};
  const totals = data?.totals || {};
  const attempts = data?.attempts || [];
  return <div className="modal-backdrop" onClick={onClose}><section className="modal !max-w-6xl !max-h-[92vh] !overflow-hidden" onClick={(e)=>e.stopPropagation()}>
    <div className="modal-head"><div><span className="eyebrow">Exam performance</span><h2>{exam.name || "Exam"}</h2><p>{exam.status || "Draft"} · {exam.questions || 0} questions · {exam.duration || 0} minutes</p></div><button className="icon-btn" onClick={onClose} type="button"><X size={18}/></button></div>
    <div className="grid grid-cols-2 gap-3 border-y border-slate-100 bg-slate-50 p-4 sm:grid-cols-4"><div className="stat-card"><span>Attempts</span><strong>{totals.attempts || 0}</strong></div><div className="stat-card"><span>Correct</span><strong>{totals.correct || 0}</strong></div><div className="stat-card"><span>Wrong</span><strong>{totals.wrong || 0}</strong></div><div className="stat-card"><span>Missed</span><strong>{totals.missed || 0}</strong></div></div>
    <div className="max-h-[58vh] overflow-y-auto p-5"><div className="table-wrap"><table><thead><tr><th>Student</th><th>Score</th><th>Attempted</th><th>Correct</th><th>Wrong</th><th>Missed</th><th>Date</th></tr></thead><tbody>{attempts.length ? attempts.map((row)=><tr key={row.attemptId} className="cursor-pointer" onClick={()=>onOpenAttempt(row)}><td><strong>{row.student?.name || "Unknown"}</strong><span className="block muted">{row.student?.studentId || row.student?.email || "—"}</span></td><td><strong>{row.score}/{row.total}</strong><span className="block muted">{row.percent}%</span></td><td>{row.attempted}</td><td>{row.correct}</td><td>{row.wrong}</td><td>{row.missed}</td><td>{new Date(row.createdAt).toLocaleDateString("en-IN")}</td></tr>) : <tr><td colSpan="7">No students have attempted this exam yet.</td></tr>}</tbody></table></div></div>
    <div className="modal-footer"><button className="btn secondary" onClick={onClose}>Close</button></div>
    {attemptDetail && <PrincipalAttemptModal data={attemptDetail} onClose={onCloseAttempt}/>}
  </section></div>;
}

function PrincipalAttemptModal({ data, onClose }) {
  const counts = data.counts || {};
  return <div className="modal-backdrop" onClick={onClose}><section className="modal !max-w-5xl !max-h-[88vh] !overflow-hidden" onClick={(e)=>e.stopPropagation()}>
    <div className="modal-head"><div><span className="eyebrow">Student attempt</span><h2>{data.student?.name || "Student"}</h2><p>{data.student?.email || ""} · {data.attempt?.percent || 0}%</p></div><button className="icon-btn" onClick={onClose} type="button"><X size={18}/></button></div>
    <div className="grid grid-cols-2 gap-3 border-y border-slate-100 bg-slate-50 p-4 sm:grid-cols-4"><div className="stat-card"><span>Attempted</span><strong>{counts.attempted || 0}</strong></div><div className="stat-card"><span>Correct</span><strong>{counts.correct || 0}</strong></div><div className="stat-card"><span>Wrong</span><strong>{counts.wrong || 0}</strong></div><div className="stat-card"><span>Missed</span><strong>{counts.missed || 0}</strong></div></div>
    <div className="max-h-[52vh] overflow-y-auto p-5 space-y-3">{(data.questions || []).map((q)=><article key={q.questionId} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-extrabold text-slate-400">Q{q.number}</span><h3 className="mt-1 text-sm font-semibold leading-6 text-slate-800">{q.text}</h3></div><Status>{q.status==="correct"?"Correct":q.status==="wrong"?"Wrong":"Missed"}</Status></div><div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-3 text-xs"><span className="muted">Student answer</span><strong className="mt-1 block">{q.selectedAnswer == null ? "Left blank" : String.fromCharCode(65+q.selectedAnswer)+". "+(q.options[q.selectedAnswer]?.text || "")}</strong></div><div className="rounded-lg border border-green-100 bg-green-50 p-3 text-xs"><span className="text-green-600">Correct answer</span><strong className="mt-1 block text-green-800">{String.fromCharCode(65+q.correctAnswer)+". "+(q.options[q.correctAnswer]?.text || "")}</strong></div></div></article>)}</div>
    <div className="modal-footer"><button className="btn secondary" onClick={onClose}>Close review</button></div>
  </section></div>;
}

function PrincipalPaperModal({ data, loading, onClose }) {
  if (loading && !data) return <div className="modal-backdrop"><div className="modal"><div className="empty-state">Loading question paper...</div></div></div>;
  const paper = data?.paper || {};
  return <div className="modal-backdrop" onClick={onClose}><section className="modal !max-w-6xl !max-h-[92vh] !overflow-hidden" onClick={(e)=>e.stopPropagation()}>
    <div className="modal-head"><div><span className="eyebrow">Question paper</span><h2>{paper.name || "Question Paper"}</h2><p>{paper.subject || "Mixed"} · {paper.questions || 0} questions · {paper.duration || 0} minutes</p></div><button className="icon-btn" onClick={onClose} type="button"><X size={18}/></button></div>
    <div className="max-h-[72vh] overflow-y-auto p-5 space-y-3">{(data?.questions || []).map((q)=><article key={q._id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start gap-3"><span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-500">Q{q.number}</span><div className="min-w-0 flex-1"><h3 className="text-sm font-semibold leading-6 text-slate-800">{q.text}</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{(q.options || []).map((o)=><div key={o.key} className={o.key===q.correctAnswer?"rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800":"rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"}><span className="mr-2 font-extrabold">{o.key}.</span>{o.text}{o.key===q.correctAnswer&&<CheckCircle2 size={13} className="ml-2 inline text-green-600"/>}</div>)}</div></div></div></article>)}</div>
    <div className="modal-footer"><button className="btn secondary" onClick={onClose}>Close</button></div>
  </section></div>;
}

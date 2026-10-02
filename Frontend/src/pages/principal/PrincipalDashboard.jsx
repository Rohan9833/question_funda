import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Users,
  FileText,
  Clock3,
  AlertCircle,
} from "lucide-react";
import { useData } from "../../context/DataContext";

const teachers = [
  { id: "T-1042", name: "Dr. Anjali Mehta", email: "anjali.mehta@school.edu", subject: "Biology", papers: 14, exams: 8, status: "Active" },
  { id: "T-1043", name: "Prof. Rahul Shah", email: "rahul.shah@school.edu", subject: "Physics", papers: 9, exams: 6, status: "Active" },
  { id: "T-1044", name: "Dr. Neha Joshi", email: "neha.joshi@school.edu", subject: "Chemistry", papers: 11, exams: 7, status: "Active" },
  { id: "T-1045", name: "Prof. Amit Kulkarni", email: "amit.kulkarni@school.edu", subject: "Biology", papers: 7, exams: 4, status: "Active" },
  { id: "T-1046", name: "Ms. Priya Nair", email: "priya.nair@school.edu", subject: "Chemistry", papers: 5, exams: 3, status: "Inactive" },
];

const students = [
  { id: "S-22041", name: "Aarav Patil", email: "aarav@example.com", className: "12-A", exams: 12, average: "82%", status: "Active" },
  { id: "S-22042", name: "Isha Sharma", email: "isha@example.com", className: "12-A", exams: 15, average: "91%", status: "Active" },
  { id: "S-22043", name: "Vivaan Desai", email: "vivaan@example.com", className: "12-B", exams: 10, average: "76%", status: "Active" },
  { id: "S-22044", name: "Anaya Kapoor", email: "anaya@example.com", className: "12-B", exams: 14, average: "88%", status: "Active" },
  { id: "S-22045", name: "Reyansh Gupta", email: "reyansh@example.com", className: "12-C", exams: 8, average: "69%", status: "Inactive" },
];

const principalExams = [
  { id: "EX-301", name: "NEET Biology — Practice Test 05", teacher: "Dr. Anjali Mehta", questions: 152, attempts: 186, status: "Live", date: "02 Oct 2026" },
  { id: "EX-302", name: "Physics — Mechanics Assessment", teacher: "Prof. Rahul Shah", questions: 60, attempts: 142, status: "Completed", date: "01 Oct 2026" },
  { id: "EX-303", name: "Chemistry — Organic Basics", teacher: "Dr. Neha Joshi", questions: 75, attempts: 96, status: "Scheduled", date: "04 Oct 2026" },
  { id: "EX-304", name: "NEET Biology — Genetics Revision", teacher: "Prof. Amit Kulkarni", questions: 50, attempts: 74, status: "Draft", date: "—" },
];

const principalPapers = [
  { id: "QP-501", name: "NEET Biology — Full Mock 01", teacher: "Dr. Anjali Mehta", questions: 180, duration: "180 min", status: "Published" },
  { id: "QP-502", name: "Physics — Mechanics Test", teacher: "Prof. Rahul Shah", questions: 45, duration: "60 min", status: "Published" },
  { id: "QP-503", name: "Chemistry — Organic Basics", teacher: "Dr. Neha Joshi", questions: 60, duration: "75 min", status: "Draft" },
  { id: "QP-504", name: "Biology — Genetics Revision", teacher: "Prof. Amit Kulkarni", questions: 50, duration: "45 min", status: "Published" },
];

const principalQuestions = [
  { id: "Q-1001", subject: "Biology", chapter: "Cell", difficulty: "Easy", text: "Which organelle is known as the powerhouse of the cell?", teacher: "Dr. Anjali Mehta" },
  { id: "Q-1002", subject: "Physics", chapter: "Current Electricity", difficulty: "Easy", text: "The SI unit of electric current is:", teacher: "Prof. Rahul Shah" },
  { id: "Q-1003", subject: "Biology", chapter: "Genetics", difficulty: "Medium", text: "Which bond holds the two strands of DNA together?", teacher: "Prof. Amit Kulkarni" },
  { id: "Q-1004", subject: "Chemistry", chapter: "Organic Chemistry", difficulty: "Hard", text: "Which reaction is commonly used to prepare alkenes?", teacher: "Dr. Neha Joshi" },
];

const navTitle = {
  dashboard: ["System Overview", "A complete view of the Question Funda ecosystem."],
  teachers: ["Teachers", "Manage every teacher account, activity and academic contribution."],
  students: ["Students", "Monitor the complete student population and examination activity."],
  exams: ["All Exams", "Every scheduled, live, completed and draft examination."],
  papers: ["Question Papers", "Every generated paper with ownership, size and status."],
  questions: ["Question Bank", "A central view of every question across all subjects."],
  analytics: ["System Analytics", "High-level academic activity and platform health."],
};

function Status({ children }) {
  const map = {
    Active: "bg-green-50 text-green-700",
    Live: "bg-green-50 text-green-700",
    Published: "bg-green-50 text-green-700",
    Completed: "bg-slate-100 text-slate-600",
    Scheduled: "bg-blue-50 text-blue-700",
    Draft: "bg-amber-50 text-amber-700",
    Inactive: "bg-red-50 text-red-600",
  };

  return (
    <span className={"inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold " + (map[children] || "bg-slate-100 text-slate-600")}>
      {children}
    </span>
  );
}

function SectionHeader({ title, description, count }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-[Manrope] text-lg font-extrabold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      {count !== undefined && (
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500">
          {count} records
        </span>
      )}
    </div>
  );
}

function DataTable({ headers, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {headers.map((header) => (
                <th key={header} className="px-5 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ children }) {
  return <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">{children}</tr>;
}

function Cell({ children, className = "" }) {
  return <td className={"px-5 py-4 text-xs text-slate-600 " + className}>{children}</td>;
}

export default function PrincipalDashboard() {
  const location = useLocation();
  const { questions, papers, exams } = useData();

  const section = location.pathname.split("/").filter(Boolean)[1] || "dashboard";
  const [title, description] = navTitle[section] || navTitle.dashboard;

  const totals = useMemo(() => ({
    teachers: teachers.length,
    students: students.length,
    questions: Math.max(principalQuestions.length, questions.length),
    papers: Math.max(principalPapers.length, papers.length),
    exams: Math.max(principalExams.length, exams.length),
  }), [questions.length, papers.length, exams.length]);

  if (section === "teachers") {
    return (
      <div>
        <SectionHeader title={title} description={description} count={teachers.length} />
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MiniStat icon={Users} label="Total teachers" value="5" />
          <MiniStat icon={CheckCircle2} label="Active" value="4" />
          <MiniStat icon={FileText} label="Question papers" value="46" />
        </div>
        <DataTable headers={["Teacher", "ID", "Subject", "Papers", "Exams", "Status", ""]}>
          {teachers.map((teacher) => (
            <Row key={teacher.id}>
              <Cell><strong className="block font-bold text-slate-800">{teacher.name}</strong><span className="text-[10px] text-slate-400">{teacher.email}</span></Cell>
              <Cell className="font-mono text-[10px]">{teacher.id}</Cell>
              <Cell>{teacher.subject}</Cell>
              <Cell>{teacher.papers}</Cell>
              <Cell>{teacher.exams}</Cell>
              <Cell><Status>{teacher.status}</Status></Cell>
              <Cell><button className="text-slate-400 hover:text-slate-700"><MoreHorizontal size={17} /></button></Cell>
            </Row>
          ))}
        </DataTable>
      </div>
    );
  }

  if (section === "students") {
    return (
      <div>
        <SectionHeader title={title} description={description} count={students.length} />
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MiniStat icon={GraduationCap} label="Total students" value="1,248" />
          <MiniStat icon={Activity} label="Active this week" value="986" />
          <MiniStat icon={ClipboardCheck} label="Exam attempts" value="8,642" />
        </div>
        <DataTable headers={["Student", "ID", "Class", "Exams", "Average", "Status", ""]}>
          {students.map((student) => (
            <Row key={student.id}>
              <Cell><strong className="block font-bold text-slate-800">{student.name}</strong><span className="text-[10px] text-slate-400">{student.email}</span></Cell>
              <Cell className="font-mono text-[10px]">{student.id}</Cell>
              <Cell>{student.className}</Cell>
              <Cell>{student.exams}</Cell>
              <Cell className="font-bold text-slate-800">{student.average}</Cell>
              <Cell><Status>{student.status}</Status></Cell>
              <Cell><button className="text-slate-400 hover:text-slate-700"><MoreHorizontal size={17} /></button></Cell>
            </Row>
          ))}
        </DataTable>
      </div>
    );
  }

  if (section === "exams") {
    return (
      <div>
        <SectionHeader title={title} description={description} count={principalExams.length} />
        <DataTable headers={["Exam", "Teacher", "Questions", "Attempts", "Date", "Status"]}>
          {principalExams.map((exam) => (
            <Row key={exam.id}>
              <Cell><strong className="block max-w-xs font-bold text-slate-800">{exam.name}</strong><span className="text-[10px] text-slate-400">{exam.id}</span></Cell>
              <Cell>{exam.teacher}</Cell><Cell>{exam.questions}</Cell><Cell>{exam.attempts}</Cell><Cell>{exam.date}</Cell><Cell><Status>{exam.status}</Status></Cell>
            </Row>
          ))}
        </DataTable>
      </div>
    );
  }

  if (section === "papers") {
    return (
      <div>
        <SectionHeader title={title} description={description} count={principalPapers.length} />
        <DataTable headers={["Question paper", "Teacher", "Questions", "Duration", "Status", ""]}>
          {principalPapers.map((paper) => (
            <Row key={paper.id}>
              <Cell><strong className="block font-bold text-slate-800">{paper.name}</strong><span className="text-[10px] text-slate-400">{paper.id}</span></Cell>
              <Cell>{paper.teacher}</Cell><Cell>{paper.questions}</Cell><Cell>{paper.duration}</Cell><Cell><Status>{paper.status}</Status></Cell><Cell><button className="text-slate-400 hover:text-slate-700"><MoreHorizontal size={17} /></button></Cell>
            </Row>
          ))}
        </DataTable>
      </div>
    );
  }

  if (section === "questions") {
    return (
      <div>
        <SectionHeader title={title} description={description} count={principalQuestions.length} />
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
            <Search size={15} className="text-slate-400" />
            <input className="w-full bg-transparent text-xs outline-none" placeholder="Search every question..." />
          </div>
          <button className="rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600">All subjects</button>
          <button className="rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600">All difficulty</button>
        </div>
        <DataTable headers={["Question", "Subject", "Chapter", "Difficulty", "Created by"]}>
          {principalQuestions.map((question) => (
            <Row key={question.id}>
              <Cell><strong className="block max-w-lg font-semibold leading-5 text-slate-800">{question.text}</strong><span className="font-mono text-[9px] text-slate-400">{question.id}</span></Cell>
              <Cell>{question.subject}</Cell><Cell>{question.chapter}</Cell><Cell><Difficulty value={question.difficulty} /></Cell><Cell>{question.teacher}</Cell>
            </Row>
          ))}
        </DataTable>
      </div>
    );
  }

  if (section === "analytics") {
    return <Analytics />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-green-600">Principal control center</span>
          <h1 className="mt-2 font-[Manrope] text-3xl font-extrabold tracking-tight text-slate-900">System Overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Everything happening across teachers, students, questions, papers and examinations in one place.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-[10px] font-bold text-green-700"><ShieldCheck size={14} /> Full system visibility</div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <OverviewStat icon={Users} label="Teachers" value="5" detail="4 active" />
        <OverviewStat icon={GraduationCap} label="Students" value="1,248" detail="986 active" />
        <OverviewStat icon={BookOpen} label="Questions" value={totals.questions.toLocaleString()} detail="Across all subjects" />
        <OverviewStat icon={FileText} label="Question papers" value={totals.papers} detail="46 published" />
        <OverviewStat icon={ClipboardCheck} label="Exams" value={totals.exams} detail="1 live now" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h2 className="font-[Manrope] text-sm font-extrabold text-slate-900">Recent examinations</h2><p className="mt-1 text-[10px] text-slate-400">Latest activity across the institution</p></div>
            <a href="/principal/exams" className="flex items-center gap-1 text-[10px] font-bold text-green-600">View all <ArrowUpRight size={13} /></a>
          </div>
          <div>
            {principalExams.slice(0, 4).map((exam) => (
              <div key={exam.id} className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500"><ClipboardCheck size={17} /></div>
                <div className="min-w-0 flex-1"><strong className="block truncate text-xs font-bold text-slate-800">{exam.name}</strong><span className="mt-1 block text-[10px] text-slate-400">{exam.teacher} · {exam.questions} questions · {exam.attempts} attempts</span></div>
                <Status>{exam.status}</Status>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-[Manrope] text-sm font-extrabold text-slate-900">System health</h2>
          <p className="mt-1 text-[10px] text-slate-400">Operational snapshot</p>
          <div className="mt-5 space-y-4">
            <Health label="Teacher accounts" value="4 / 5 active" percent={80} />
            <Health label="Published papers" value="46" percent={92} />
            <Health label="Exam completion" value="84%" percent={84} />
            <Health label="Question coverage" value="94%" percent={94} />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <QuickPanel icon={Users} title="Teachers" value="5" text="Manage teacher accounts and academic activity." href="/principal/teachers" />
        <QuickPanel icon={GraduationCap} title="Students" value="1,248" text="Review the complete student population." href="/principal/students" />
        <QuickPanel icon={BookOpen} title="Question Bank" value={totals.questions.toLocaleString()} text="Inspect questions across every subject." href="/principal/questions" />
      </div>
    </div>
  );
}

function OverviewStat({ icon: Icon, label, value, detail }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 grid h-8 w-8 place-items-center rounded-lg bg-green-50 text-green-600"><Icon size={16} /></div><span className="block text-[10px] font-semibold text-slate-400">{label}</span><strong className="mt-1 block font-[Manrope] text-2xl font-extrabold text-slate-900">{value}</strong><small className="mt-1 block text-[9px] text-slate-400">{detail}</small></div>;
}

function MiniStat({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-green-50 text-green-600"><Icon size={16} /></div><div><span className="block text-[10px] text-slate-400">{label}</span><strong className="text-lg font-extrabold text-slate-900">{value}</strong></div></div></div>;
}

function Difficulty({ value }) {
  const cls = value === "Easy" ? "bg-green-50 text-green-700" : value === "Hard" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700";
  return <span className={"rounded-full px-2.5 py-1 text-[9px] font-extrabold " + cls}>{value}</span>;
}

function Health({ label, value, percent }) {
  return <div><div className="mb-1.5 flex justify-between text-[10px]"><span className="font-semibold text-slate-600">{label}</span><strong className="text-slate-800">{value}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-green-500" style={{ width: percent + "%" }} /></div></div>;
}

function QuickPanel({ icon: Icon, title, value, text, href }) {
  return <a href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"><div className="flex items-center justify-between"><div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 group-hover:bg-green-50 group-hover:text-green-600"><Icon size={17} /></div><ArrowUpRight size={15} className="text-slate-300 group-hover:text-green-600" /></div><strong className="mt-4 block font-[Manrope] text-xl text-slate-900">{title} · {value}</strong><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></a>;
}

function Analytics() {
  const bars = [54, 68, 62, 82, 74, 91, 84];
  return <div><SectionHeader title="System Analytics" description="Institution-wide examination activity and engagement." /><div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"><div className="flex items-center justify-between"><div><h2 className="font-[Manrope] text-sm font-extrabold text-slate-900">Exam activity</h2><p className="mt-1 text-[10px] text-slate-400">Attempts over the last 7 days</p></div><Activity size={18} className="text-green-600" /></div><div className="mt-7 flex h-52 items-end justify-between gap-3 border-b border-slate-100 pb-0">{bars.map((height, index) => <div key={index} className="flex h-full flex-1 items-end"><div className="w-full rounded-t-lg bg-green-500/80" style={{ height: height + "%" }} /></div>)}</div><div className="mt-3 flex justify-between text-[9px] text-slate-400">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => <span key={day}>{day}</span>)}</div></div><div className="space-y-3"><MiniStat icon={ClipboardCheck} label="Total attempts" value="8,642" /><MiniStat icon={Clock3} label="Avg. completion" value="42 min" /><MiniStat icon={AlertCircle} label="Pending reviews" value="18" /></div></div></div>;
}

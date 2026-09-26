import { useState } from "react";
import {
  BarChart3, BookOpen, ChevronDown, ChevronLeft, ChevronRight, Clock3,
  FileSpreadsheet, FileText, GraduationCap, LayoutDashboard, LogOut,
  Menu, Plus, Search, Settings, Sparkles, Users, X, CheckCircle2,
  CircleHelp, ClipboardCheck, UploadCloud, SlidersHorizontal
} from "lucide-react";

const questions = [
  { id: 1, text: "Which organelle is known as the powerhouse of the cell?", subject: "Biology", chapter: "Cell", difficulty: "Easy", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"], answer: 1 },
  { id: 2, text: "The SI unit of electric current is:", subject: "Physics", chapter: "Current Electricity", difficulty: "Easy", options: ["Volt", "Watt", "Ampere", "Ohm"], answer: 2 },
  { id: 3, text: "Which bond holds the two strands of DNA together?", subject: "Biology", chapter: "Genetics", difficulty: "Medium", options: ["Ionic bond", "Peptide bond", "Hydrogen bond", "Ester bond"], answer: 2 },
  { id: 4, text: "A body moving with uniform velocity has:", subject: "Physics", chapter: "Motion", difficulty: "Medium", options: ["Constant acceleration", "Zero acceleration", "Increasing acceleration", "Variable acceleration"], answer: 1 },
  { id: 5, text: "The pH of a neutral solution at 25°C is:", subject: "Chemistry", chapter: "Solutions", difficulty: "Easy", options: ["0", "5", "7", "14"], answer: 2 },
  { id: 6, text: "Which of the following is a characteristic of enzymes?", subject: "Biology", chapter: "Biomolecules", difficulty: "Hard", options: ["They are consumed in reactions", "They lower activation energy", "They increase activation energy", "They change equilibrium"], answer: 1 }
];

function App() {
  const [role, setRole] = useState("teacher");
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [examMode, setExamMode] = useState(null);
  const [studentQuestion, setStudentQuestion] = useState(0);

  const teacherNav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["questions", "Question Bank", BookOpen],
    ["papers", "Question Papers", FileText],
    ["exams", "Exams", ClipboardCheck],
    ["students", "Students", Users],
    ["analytics", "Analytics", BarChart3]
  ];

  const studentNav = [
    ["dashboard", "My Dashboard", LayoutDashboard],
    ["available", "Available Exams", GraduationCap],
    ["results", "My Results", BarChart3]
  ];

  const nav = role === "teacher" ? teacherNav : studentNav;

  const navigate = (next) => {
    setPage(next);
    setExamMode(null);
  };

  if (examMode) {
    return <ExamView mode={examMode} question={questions[studentQuestion]} index={studentQuestion}
      onPrev={() => setStudentQuestion(Math.max(0, studentQuestion - 1))}
      onNext={() => setStudentQuestion(Math.min(questions.length - 1, studentQuestion + 1))}
      onExit={() => setExamMode(null)} />;
  }

  return (
    <div className="app-shell">
      <aside className={sidebarOpen ? "sidebar" : "sidebar collapsed"}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={19} /></div>
          {sidebarOpen && <div><strong>Question Funda</strong><span>Exam workspace</span></div>}
        </div>

        <div className="role-switch">
          <button className={role === "teacher" ? "active" : ""} onClick={() => { setRole("teacher"); navigate("dashboard"); }}>
            <Users size={16} /> {sidebarOpen && "Teacher"}
          </button>
          <button className={role === "student" ? "active" : ""} onClick={() => { setRole("student"); navigate("dashboard"); }}>
            <GraduationCap size={16} /> {sidebarOpen && "Student"}
          </button>
        </div>

        <nav>
          <div className="nav-label">{sidebarOpen && "Workspace"}</div>
          {nav.map(([key, label, Icon]) => (
            <button key={key} className={page === key ? "nav-item active" : "nav-item"} onClick={() => navigate(key)}>
              <Icon size={18} /> {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item"><Settings size={18} /> {sidebarOpen && <span>Settings</span>}</button>
          <button className="profile-mini">
            <div className="avatar">{role === "teacher" ? "RP" : "AK"}</div>
            {sidebarOpen && <div><strong>{role === "teacher" ? "Rahul Professor" : "Aarav Kumar"}</strong><span>{role === "teacher" ? "Teacher" : "Student"}</span></div>}
            {sidebarOpen && <ChevronDown size={15} />}
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>{role === "teacher" ? "Teacher" : "Student"}</span><b>/</b><strong>{pageTitle(page, role)}</strong></div>
          <div className="top-actions">
            <button className="icon-btn"><CircleHelp size={19} /></button>
            <div className="top-avatar">{role === "teacher" ? "RP" : "AK"}</div>
          </div>
        </header>

        <div className="content">
          {page === "dashboard" && <Dashboard role={role} onUpload={() => setShowUpload(true)} onGenerate={() => setShowGenerator(true)} navigate={navigate} />}
          {page === "questions" && <QuestionBank onUpload={() => setShowUpload(true)} />}
          {page === "papers" && <Papers onGenerate={() => setShowGenerator(true)} />}
          {page === "exams" && <Exams />}
          {page === "students" && <Students />}
          {page === "analytics" && <Analytics />}
          {page === "available" && <AvailableExams onStart={(mode) => { setStudentQuestion(0); setExamMode(mode); }} />}
          {page === "results" && <StudentResults />}
        </div>
      </main>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {showGenerator && <GeneratorModal onClose={() => setShowGenerator(false)} />}
    </div>
  );
}

function pageTitle(page, role) {
  const titles = { dashboard: role === "teacher" ? "Dashboard" : "My Dashboard", questions: "Question Bank", papers: "Question Papers", exams: "Exams", students: "Students", analytics: "Analytics", available: "Available Exams", results: "My Results" };
  return titles[page] || "Dashboard";
}

function Dashboard({ role, onUpload, onGenerate, navigate }) {
  if (role === "student") return <StudentDashboard onStart={() => navigate("available")} />;
  return (
    <>
      <div className="page-head">
        <div><div className="eyebrow">Good morning, Rahul</div><h1>Build better exams, faster.</h1><p>Manage your question bank and create polished NEET papers from one workspace.</p></div>
        <div className="head-actions"><button className="btn secondary" onClick={onUpload}><UploadCloud size={17}/> Import Excel</button><button className="btn primary" onClick={onGenerate}><Plus size={17}/> Generate Paper</button></div>
      </div>

      <section className="stat-grid">
        <Stat icon={BookOpen} label="Question Bank" value="1,248" note="+86 this month" />
        <Stat icon={FileText} label="Question Papers" value="24" note="6 drafts" />
        <Stat icon={ClipboardCheck} label="Active Exams" value="8" note="312 students" />
        <Stat icon={BarChart3} label="Avg. Score" value="72.4%" note="+4.8% this month" />
      </section>

      <div className="dashboard-grid">
        <section className="panel large">
          <PanelHeader title="Recent question papers" action="View all" onClick={() => navigate("papers")} />
          <div className="table-wrap"><table><thead><tr><th>Paper</th><th>Questions</th><th>Mode</th><th>Status</th><th>Updated</th></tr></thead><tbody>
            {[
              ["NEET Biology — Full Mock 01","180","Online + Paper","Published","Today"],
              ["Physics — Mechanics Test","45","Online","Published","Yesterday"],
              ["Chemistry — Organic Basics","60","Paper","Draft","2 days ago"],
              ["NEET Mixed Practice 04","90","Online","Published","3 days ago"]
            ].map((r,i)=><tr key={i}><td><div className="table-title"><div className="doc-icon"><FileText size={16}/></div><div><strong>{r[0]}</strong><span>NEET • 2026</span></div></div></td><td>{r[1]}</td><td>{r[2]}</td><td><span className={r[3]==="Published"?"status green":"status amber"}>{r[3]}</span></td><td className="muted">{r[4]}</td></tr>)}
          </tbody></table></div>
        </section>

        <section className="panel">
          <PanelHeader title="Question bank" />
          <div className="subject-row"><span><i className="dot bio"/>Biology</span><strong>486</strong></div>
          <div className="progress"><span style={{width:"39%"}}/></div>
          <div className="subject-row"><span><i className="dot phys"/>Physics</span><strong>402</strong></div>
          <div className="progress"><span style={{width:"32%"}}/></div>
          <div className="subject-row"><span><i className="dot chem"/>Chemistry</span><strong>360</strong></div>
          <div className="progress"><span style={{width:"29%"}}/></div>
          <button className="text-btn" onClick={() => navigate("questions")}>Manage question bank <ChevronRight size={15}/></button>
        </section>
      </div>

      <section className="quick-section">
        <div className="section-title"><div><h2>Quick actions</h2><p>Start your next task in one click.</p></div></div>
        <div className="quick-grid">
          <Quick icon={FileSpreadsheet} title="Import questions" text="Upload an Excel sheet and map columns." onClick={onUpload}/>
          <Quick icon={Sparkles} title="Generate paper" text="Create a balanced paper from your bank." onClick={onGenerate}/>
          <Quick icon={ClipboardCheck} title="Publish an exam" text="Turn a paper into a student-ready exam." onClick={() => navigate("exams")}/>
        </div>
      </section>
    </>
  );
}

function StudentDashboard({onStart}) {
  return <>
    <div className="page-head"><div><div className="eyebrow">Welcome back, Aarav</div><h1>Your next exam is ready.</h1><p>Continue an active test or review your previous performance.</p></div><button className="btn primary" onClick={onStart}><GraduationCap size={17}/> View exams</button></div>
    <div className="student-hero"><div><span className="pill light">UPCOMING EXAM</span><h2>NEET Biology — Full Mock 01</h2><p>180 questions · 720 marks · 180 minutes</p><div className="hero-meta"><span><Clock3 size={15}/> Starts today at 7:00 PM</span><span><Users size={15}/> 42 students enrolled</span></div></div><div className="hero-score"><span>Previous mock</span><strong>648<span>/720</span></strong><em>+32 marks</em></div></div>
    <div className="stat-grid student-stats"><Stat icon={ClipboardCheck} label="Exams completed" value="12" note="2 this week"/><Stat icon={BarChart3} label="Average score" value="82.6%" note="+6.2% improvement"/><Stat icon={Clock3} label="Time practiced" value="18h" note="This month"/><Stat icon={BookOpen} label="Questions solved" value="1,042" note="87% accuracy"/></div>
  </>;
}

function Stat({icon:Icon,label,value,note}) { return <div className="stat-card"><div className="stat-icon"><Icon size={18}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>; }
function Quick({icon:Icon,title,text,onClick}) { return <button className="quick-card" onClick={onClick}><div className="quick-icon"><Icon size={19}/></div><div><strong>{title}</strong><p>{text}</p></div><ChevronRight size={17}/></button>; }
function PanelHeader({title,action,onClick}) { return <div className="panel-head"><h2>{title}</h2>{action&&<button className="text-btn" onClick={onClick}>{action}<ChevronRight size={15}/></button>}</div>; }

function QuestionBank({onUpload}) {
  const [search,setSearch]=useState("");
  const filtered=questions.filter(q=>q.text.toLowerCase().includes(search.toLowerCase())||q.chapter.toLowerCase().includes(search.toLowerCase()));
  return <><div className="page-head"><div><div className="eyebrow">1,248 questions</div><h1>Question Bank</h1><p>Your centralized library for building every future paper.</p></div><button className="btn primary" onClick={onUpload}><UploadCloud size={17}/> Import Excel</button></div>
    <div className="filter-bar"><div className="search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions, chapters..." /></div><button className="filter-btn"><SlidersHorizontal size={16}/> Filters</button><select><option>All subjects</option><option>Biology</option><option>Physics</option><option>Chemistry</option></select><select><option>All difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
    <div className="panel"><div className="table-wrap"><table><thead><tr><th>#</th><th>Question</th><th>Subject</th><th>Chapter</th><th>Difficulty</th><th>Answer</th></tr></thead><tbody>{filtered.map(q=><tr key={q.id}><td className="muted">Q{q.id}</td><td><strong className="question-cell">{q.text}</strong><span className="question-options">{q.options.map((o,i)=><span key={i}>{String.fromCharCode(65+i)}. {o}</span>)}</span></td><td>{q.subject}</td><td>{q.chapter}</td><td><span className={"difficulty "+q.difficulty.toLowerCase()}>{q.difficulty}</span></td><td><span className="answer-badge">{String.fromCharCode(65+q.answer)}</span></td></tr>)}</tbody></table></div></div>
  </>;
}

function Papers({onGenerate}) {
  return <><div className="page-head"><div><div className="eyebrow">24 papers</div><h1>Question Papers</h1><p>Create, review and publish exam-ready papers.</p></div><button className="btn primary" onClick={onGenerate}><Plus size={17}/> Generate paper</button></div>
    <div className="paper-grid">{["NEET Biology — Full Mock 01","Physics — Mechanics Test","Chemistry — Organic Basics","NEET Mixed Practice 04","Biology — Genetics Drill","Physics — Electrostatics"].map((name,i)=><div className="paper-card" key={name}><div className="paper-top"><div className="doc-icon big"><FileText size={20}/></div><span className={i===2?"status amber":"status green"}>{i===2?"Draft":"Published"}</span></div><h3>{name}</h3><p>NEET 2026 · {i%2?45:180} questions</p><div className="paper-bottom"><span><Clock3 size={14}/> {i%2?45:180} min</span><button className="icon-btn"><ChevronRight size={17}/></button></div></div>)}</div>
  </>;
}

function Exams() {
  return <><div className="page-head"><div><div className="eyebrow">8 active exams</div><h1>Exams</h1><p>Control what students can access and track participation.</p></div><button className="btn primary"><Plus size={17}/> New exam</button></div>
  <div className="panel"><div className="table-wrap"><table><thead><tr><th>Exam</th><th>Paper</th><th>Modes</th><th>Students</th><th>Status</th></tr></thead><tbody>{["NEET Biology — Full Mock 01","Physics — Mechanics Test","Chemistry — Organic Basics","NEET Mixed Practice 04"].map((x,i)=><tr key={x}><td><strong>{x}</strong><span className="muted block">Created {i+1} days ago</span></td><td>Paper #{1024+i}</td><td><span className="mode-tag">Online</span> <span className="mode-tag">Paper</span></td><td>{42+i*18}</td><td><span className="status green">Live</span></td></tr>)}</tbody></table></div></div></>;
}

function Students() { return <><div className="page-head"><div><div className="eyebrow">312 students</div><h1>Students</h1><p>See enrollment and exam participation.</p></div><button className="btn secondary"><Users size={17}/> Manage students</button></div><div className="student-grid">{["Aarav Kumar","Priya Shah","Rahul Mehta","Ishita Jain","Kabir Patel","Ananya Singh"].map((n,i)=><div className="student-card" key={n}><div className="avatar large">{n.split(" ").map(x=>x[0]).join("")}</div><div><strong>{n}</strong><span>{i%2?"12 exams completed":"8 exams completed"}</span></div><b>{82-i*3}%</b></div>)}</div></>; }
function Analytics() { return <><div className="page-head"><div><div className="eyebrow">Last 30 days</div><h1>Analytics</h1><p>Understand exam performance and question quality.</p></div><button className="filter-btn">Last 30 days <ChevronDown size={15}/></button></div><div className="stat-grid"><Stat icon={Users} label="Attempts" value="1,284" note="+18.4% vs last month"/><Stat icon={BarChart3} label="Average score" value="72.4%" note="+4.8%"/><Stat icon={Clock3} label="Avg. completion" value="84%" note="+3.1%"/><Stat icon={CircleHelp} label="Questions flagged" value="23" note="Needs review"/></div><div className="panel chart-panel"><PanelHeader title="Average score by subject"/><div className="fake-chart">{[64,78,71,88,76,82,91].map((h,i)=><div className="bar-col" key={i}><div className="bar" style={{height:h+"%"}}/><span>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</span></div>)}</div></div></>; }

function AvailableExams({onStart}) { return <><div className="page-head"><div><div className="eyebrow">3 exams available</div><h1>Available Exams</h1><p>Choose an exam and select how you want to attempt it.</p></div></div><div className="exam-list">{["NEET Biology — Full Mock 01","Physics — Mechanics Test","Chemistry — Organic Basics"].map((x,i)=><div className="exam-card" key={x}><div className="exam-number">0{i+1}</div><div className="exam-info"><span className="pill">NEET 2026</span><h2>{x}</h2><p>{i?45:180} questions · {i?60:180} minutes · {i?180:720} marks</p><div className="exam-details"><span><BookOpen size={14}/> {i+2} sections</span><span><Clock3 size={14}/> No negative marking preview</span></div></div><div className="exam-start"><button className="btn primary" onClick={()=>onStart("online")}>Start online</button><button className="btn ghost" onClick={()=>onStart("paper")}>View paper mode</button></div></div>)}</div></>; }

function StudentResults() { return <><div className="page-head"><div><div className="eyebrow">12 completed</div><h1>My Results</h1><p>Track your progress across every practice exam.</p></div></div><div className="result-grid">{[["NEET Biology — Full Mock 01","648","720","90%"],["Physics — Mechanics Test","156","180","86.7%"],["Chemistry — Organic Basics","142","180","78.9%"],["NEET Mixed Practice 03","608","720","84.4%"]].map(r=><div className="result-card" key={r[0]}><span className="pill">Completed</span><h3>{r[0]}</h3><div><strong>{r[1]}</strong><span> / {r[2]}</span></div><em>{r[3]}</em><div className="result-line"><span style={{width:r[3]}}/></div></div>)}</div></>; }

function UploadModal({onClose}) {
  const [step,setStep]=useState(1);
  return <Modal title={step===1?"Import question bank":"Map Excel columns"} onClose={onClose} wide>
    {step===1?<><div className="dropzone"><div className="upload-icon"><FileSpreadsheet size={27}/></div><h3>Drop your Excel file here</h3><p>or click to browse · .xlsx, .xls · up to 10 MB</p><button className="btn secondary">Choose file</button></div><div className="info-box"><CircleHelp size={17}/><span>We'll read your headers first. You can map them to Question, options, answer, subject and other fields before importing.</span></div><div className="modal-footer"><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" onClick={()=>setStep(2)}>Continue to mapping <ChevronRight size={16}/></button></div></>:<><div className="mapping-head"><div><strong>neet_demo_questions.xlsx</strong><span>1,000 rows detected</span></div><span className="status green">Ready to map</span></div><div className="mapping-list">{[["Question Text","Question"],["Option A","Option A"],["Option B","Option B"],["Option C","Option C"],["Option D","Option D"],["Correct Answer","Correct Answer"],["Subject Name","Subject"],["Chapter Name","Chapter"],["Level","Difficulty"]].map(([a,b])=><div className="mapping-row" key={a}><span>{a}</span><ChevronRight size={16}/><select defaultValue={b}><option>{b}</option><option>Ignore column</option></select></div>)}</div><div className="modal-footer"><button className="btn ghost" onClick={()=>setStep(1)}>Back</button><button className="btn primary" onClick={onClose}>Import 1,000 questions</button></div></>}
  </Modal>;
}

function GeneratorModal({onClose}) {
  const [count,setCount]=useState(50);
  return <Modal title="Generate question paper" onClose={onClose} wide><div className="generator-layout"><div><label>Paper name<input defaultValue="NEET Biology — Practice Test 05"/></label><label>Subject<select><option>Biology</option><option>Physics</option><option>Chemistry</option><option>Mixed</option></select></label><label>Questions<input type="number" value={count} onChange={e=>setCount(e.target.value)}/></label><label>Duration (minutes)<input type="number" defaultValue="60"/></label></div><div><div className="section-label">Difficulty distribution</div><div className="distribution"><div><span>Easy</span><b>40%</b><input type="range" defaultValue="40"/></div><div><span>Medium</span><b>40%</b><input type="range" defaultValue="40"/></div><div><span>Hard</span><b>20%</b><input type="range" defaultValue="20"/></div></div><div className="section-label">Chapters</div><div className="check-grid">{["Cell","Genetics","Human Physiology","Ecology","Biomolecules","Plant Physiology"].map(x=><label className="check" key={x}><input type="checkbox" defaultChecked/>{x}</label>)}</div></div></div><div className="generator-summary"><Sparkles size={17}/><span>We'll select <strong>{count} questions</strong> from your bank while keeping the selected difficulty and chapter balance.</span></div><div className="modal-footer"><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" onClick={onClose}><Sparkles size={16}/> Generate paper</button></div></Modal>;
}

function Modal({title,onClose,children,wide}) { return <div className="modal-backdrop"><div className={wide?"modal wide":"modal"}><div className="modal-head"><div><h2>{title}</h2><p>Question Funda workspace</p></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div>{children}</div></div>; }

function ExamView({mode,question,index,onPrev,onNext,onExit}) {
  const [selected,setSelected]=useState(null);
  return <div className="exam-shell"><header className="exam-top"><div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><strong>Question Funda</strong></div><div className="exam-title"><span>{mode==="online"?"ONLINE EXAM":"PAPER MODE"}</span><strong>NEET Biology — Full Mock 01</strong></div><div className="exam-time"><Clock3 size={17}/><strong>02:41:36</strong><button className="btn ghost" onClick={onExit}>Exit</button></div></header><div className="exam-body"><aside className="question-nav"><h3>Question palette</h3><p>{mode==="online"?"Select an answer for each question.":"View each question and record your answer on the physical sheet."}</p><div className="palette">{Array.from({length:18},(_,i)=><button className={i===index?"current":i<index?"done":""} onClick={()=>{}} key={i}>{i+1}</button>)}</div><div className="legend"><span><i className="current-dot"/>Current</span><span><i className="done-dot"/>Answered</span><span><i className="empty-dot"/>Not visited</span></div></aside><section className="exam-question"><div className="question-meta"><span>Question {index+1} of 180</span><span>{question.subject} · {question.chapter}</span></div><div className="question-card"><div className="q-number">Q{index+1}</div><h1>{question.text}</h1><div className="options">{question.options.map((o,i)=><button disabled={mode==="paper"} className={selected===i?"option selected":"option"} onClick={()=>setSelected(i)} key={o}><span>{String.fromCharCode(65+i)}</span>{o}{selected===i&&<CheckCircle2 size={19}/>}</button>)}</div>{mode==="paper"&&<div className="paper-notice"><FileText size={18}/><div><strong>Paper mode</strong><span>Write your answer on the physical answer sheet. Options are intentionally not selectable.</span></div></div>}</div><div className="exam-nav"><button className="btn ghost" onClick={onPrev} disabled={index===0}><ChevronLeft size={17}/> Previous</button>{mode==="online"&&<button className="btn ghost">Mark for review</button>}<button className="btn primary" onClick={onNext}>{index===questions.length-1?"Finish":"Next"} <ChevronRight size={17}/></button></div></section></div></div>;
}

export default App;

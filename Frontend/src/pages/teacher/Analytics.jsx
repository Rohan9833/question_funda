import { useEffect, useState } from "react";
import { BarChart3, Users, CheckCircle2, RefreshCw, Target } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import { teacherApi } from "../../api/teacher.api";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = async (refresh = false) => {
    try {
      setError("");
      refresh ? setRefreshing(true) : setLoading(true);
      const response = await teacherApi.analytics();
      setData(response.data?.data || null);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not load analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="empty-state">Loading analytics...</div>;
  if (error || !data) return <div className="empty-state"><strong>Unable to load analytics</strong><span>{error || "No analytics data available."}</span><button className="btn secondary" onClick={() => load()}>Try again</button></div>;

  const totals = data.totals || {};
  const activity = data.activity || [];
  const max = Math.max(...activity.map((item) => item.attempts), 1);

  return (
    <>
      <PageHeader
        eyebrow="Last 30 days"
        title="Analytics"
        description="Real examination activity and student performance from your submitted attempts."
        actions={<Button variant="secondary" onClick={() => load(true)} disabled={refreshing}><RefreshCw className={refreshing ? "spin" : ""}/>Refresh</Button>}
      />
      <div className="stat-grid">
        <StatCard icon={Users} label="Attempts" value={totals.attempts || 0} note={(totals.students || 0) + " unique students"} />
        <StatCard icon={BarChart3} label="Average score" value={(totals.averagePercent || 0) + "%"} note="Across all submitted attempts" />
        <StatCard icon={Target} label="Accuracy" value={(totals.accuracy || 0) + "%"} note={(totals.questionsAnswered || 0) + " answered questions"} />
      </div>
      <div className="panel chart">
        <div className="panel-head"><div><h2>Exam attempts by day</h2><span className="muted">Last 30 days</span></div><CheckCircle2 size={18}/></div>
        <div className="bars">
          {activity.map((item) => (
            <i key={item.date} title={item.label + ": " + item.attempts + " attempts"} style={{ height: Math.max((item.attempts / max) * 100, item.attempts ? 5 : 0) + "%" }} />
          ))}
        </div>
      </div>
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const COLORS = {
  Present: "#22c55e",
  "Half Day": "#facc15",
  Absent: "#ef4444"
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [range, setRange] = useState("7"); // 7 | 30 | all
  const [dark, setDark] = useState(
    localStorage.getItem("dashboard-dark") === "true"
  );

  const idToken = localStorage.getItem("idToken");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
  if (!idToken) return;

  fetch(
    "https://mrm1jocp20.execute-api.us-east-1.amazonaws.com/dev/attendance/summary",
    {
      headers: {
        Authorization: idToken, // ✅ FIX — NO Bearer
        "Content-Type": "application/json"
      }
    }
  )
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed");
      }
      return res.json();
    })
    .then(setSummary)
    .catch((err) => {
      console.error(err);
      setError("Failed to load dashboard data");
    })
    .finally(() => setLoading(false));
}, [idToken]);

  /* ================= DARK MODE ================= */
  useEffect(() => {
    localStorage.setItem("dashboard-dark", dark);
  }, [dark]);

  /* ================= FILTERED BAR DATA ================= */
  const barData = useMemo(() => {
    if (!summary?.barData) return [];

    if (range === "all") return summary.barData;

    const days = Number(range);
    return summary.barData.slice(-days);
  }, [summary, range]);

  /* ================= TREND LOGIC ================= */
  const trend = useMemo(() => {
    if (!summary?.barData || summary.barData.length < 2) return null;

    const last = summary.barData.at(-1)?.hours || 0;
    const prev = summary.barData.at(-2)?.hours || 0;

    if (prev === 0) return null;

    const diff = (((last - prev) / prev) * 100).toFixed(1);
    return {
      up: diff > 0,
      value: Math.abs(diff)
    };
  }, [summary]);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className={`${dark ? "bg-slate-900 text-slate-100" : "bg-slate-50"} p-6`}>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={() => setDark(!dark)}
          className="px-4 py-2 rounded-lg text-sm bg-slate-200 dark:bg-slate-700"
        >
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* KPI CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Present Days" value={summary.presentDays} accent="green" />
        <StatCard label="Half Days" value={summary.halfDays} accent="yellow" />
        <StatCard label="Absent Days" value={summary.absentDays} accent="red" />

        <div className="relative">
          <StatCard
            label="Avg Daily Hours"
            value={`${summary.avgDailyHours}h`}
            accent="blue"
          />
          {trend && (
            <span
              className={`absolute top-4 right-4 text-sm font-semibold ${
                trend.up ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend.up ? "▲" : "▼"} {trend.value}%
            </span>
          )}
        </div>
      </section>

      {/* RANGE FILTER */}
      <div className="flex gap-2 mb-4">
        {["7", "30", "all"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-2 rounded-lg text-sm ${
              range === r
                ? "bg-blue-600 text-white"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            {r === "all" ? "All" : `Last ${r} days`}
          </button>
        ))}
      </div>

      {/* CHARTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* DONUT */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow">
          <h2 className="font-semibold mb-4">Attendance Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={summary.pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
              >
                {summary.pieData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>

              <text x="50%" y="50%" textAnchor="middle">
                <tspan className="fill-slate-500 text-sm" x="50%" dy="-4">
                  Working Days
                </tspan>
                <tspan
                  className="fill-slate-900 dark:fill-white text-xl font-bold"
                  x="50%"
                  dy="22"
                >
                  {summary.presentDays + summary.halfDays + summary.absentDays}
                </tspan>
              </text>

              <Tooltip content={<PieTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow">
          <h2 className="font-semibold mb-1">Daily Working Hours</h2>
          <p className="text-sm text-slate-500 mb-3">Productivity trend</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="hours"
                fill="#3b82f6"
                radius={[10, 10, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, accent }) {
  const styles = {
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700"
  };

  return (
    <div
      className={`rounded-2xl p-5 ${styles[accent]}
      shadow-sm transition-all duration-300
      hover:shadow-lg hover:-translate-y-1`}
    >
      <p className="text-sm opacity-70">{label}</p>
      <h2 className="text-4xl font-bold mt-2">{value}</h2>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white px-4 py-2 rounded-xl shadow text-sm">
      <p className="font-semibold">{payload[0].name}</p>
      <p className="text-slate-500">{payload[0].value} days</p>
    </div>
  );
}

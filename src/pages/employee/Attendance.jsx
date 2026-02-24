import { useEffect, useState } from "react";
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  startBreak,
  endBreak,
  getAttendanceHistory
} from "../../services/attendanceService";

/* ======================
   AUTH ERROR HANDLER
====================== */
function handleAuthError(e, setError) {
  if (
    e?.status === 401 ||
    e?.message?.toLowerCase().includes("unauthorized")
  ) {
    setError("Session expired. Please login again.");
    localStorage.clear();
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
    return true;
  }
  return false;
}

/* ======================
   HELPERS
====================== */

function formatTime(iso) {
  return iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "—";
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function formatShift(shift) {
  if (!shift) return "No shift assigned";
  return `${shift.name} (${shift.startTime} - ${shift.endTime})`;
}

function calculateNetHours(a) {
  if (!a?.checkIn || !a?.checkOut) return "—";
  const start = new Date(a.checkIn).getTime();
  const end = new Date(a.checkOut).getTime();
  const breakMs = (a.totalBreakMinutes || 0) * 60000;
  return formatDuration(end - start - breakMs);
}

function calculateRowNetHours(item) {
  if (!item.checkIn || !item.checkOut) return "—";
  const start = new Date(item.checkIn).getTime();
  const end = new Date(item.checkOut).getTime();
  const breakMs = (item.totalBreakMinutes || 0) * 60000;
  return formatDuration(end - start - breakMs);
}

/* ======================
   COMPONENT
====================== */

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [state, setState] = useState("NOT_CHECKED_IN");
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  /* 🔥 UPDATED STATE LOGIC */
  function deriveState(a) {
    if (!a?.checkedIn) return "NOT_CHECKED_IN";
    if (a.checkedOut) return "CHECKED_OUT";
    if (a.isOnBreak) return "ON_BREAK";
    return "WORKING";
  }

  async function loadToday() {
    const data = await getTodayAttendance();
    setAttendance(data);
    setState(deriveState(data));
  }

  async function loadHistory() {
    const data = await getAttendanceHistory();
    const items = Array.isArray(data?.items) ? data.items : data || [];
    const sorted = items.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setHistory(sorted);
  }

  useEffect(() => {
    async function init() {
      try {
        await loadToday();
        await loadHistory();
      } catch (e) {
        if (!handleAuthError(e, setError)) {
          setError(e.message || "Failed to load attendance");
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return <p className="p-6">Loading attendance...</p>;
  }

  /* LIVE TIMER */
  let workingMs = 0;

  if (attendance?.checkIn && !attendance?.checkOut) {
    const checkInMs = new Date(attendance.checkIn).getTime();
    const usedBreakMs = (attendance.totalBreakMinutes || 0) * 60000;

    if (attendance.currentBreakStart) {
      const breakStart = new Date(attendance.currentBreakStart).getTime();
      workingMs = breakStart - checkInMs - usedBreakMs;
    } else {
      workingMs = now - checkInMs - usedBreakMs;
    }
  }

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}
      <div className="flex justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-semibold">Attendance</h2>
          <p className="text-sm text-gray-500">
            {formatDate(attendance?.date || new Date())}
          </p>
        </div>
        <span className="text-sm text-gray-500">Employee View</span>
      </div>

      {error && <p className="text-red-600 text-sm">⚠ {error}</p>}

      <div className="grid md:grid-cols-2 gap-4">

        {/* STATUS CARD */}
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Current Status</p>

          <p className="font-semibold text-lg mb-2">
            {state === "CHECKED_OUT"
              ? "✅ Checked Out"
              : state === "ON_BREAK"
              ? "🟡 On Break"
              : state === "WORKING"
              ? "🟢 Working"
              : "—"}
          </p>

          <p>Check In: {formatTime(attendance?.checkIn)}</p>
          <p>Total Break: {attendance?.totalBreakMinutes || 0} mins</p>

          {state === "WORKING" && (
            <p className="mt-2 font-medium">
              ⏱ {formatDuration(workingMs)}
            </p>
          )}
        </div>

        {/* TODAY SUMMARY */}
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Today Summary</p>

          <p className="mt-2 text-sm text-gray-700">
            Shift: {formatShift(attendance?.shift)}
          </p>

          <p className="mt-2">
            Status:{" "}
            {attendance?.status === "LATE" ? (
              <span className="text-red-600 font-semibold">
                ⚠ Late ({attendance?.lateMinutes || 0} mins)
              </span>
            ) : attendance?.status === "PRESENT" ? (
              <span className="text-green-600 font-semibold">
                ✅ Present
              </span>
            ) : attendance?.status === "HALF_DAY" ? (
              <span className="text-yellow-600 font-semibold">
                Half Day
              </span>
            ) : (
              <span className="text-gray-500">Absent</span>
            )}
          </p>

          {attendance?.earlyExitMinutes > 0 && (
            <p className="text-red-600 font-semibold mt-2">
              ⚠ Early Exit ({attendance.earlyExitMinutes} mins)
            </p>
          )}

          <p className="mt-2">Net Hours: {calculateNetHours(attendance)}</p>
        </div>
      </div>

      {/* 🔥 ACTION BUTTONS RESTORED */}
      <div className="bg-white p-6 rounded-xl shadow flex gap-3 flex-wrap">

        {state === "NOT_CHECKED_IN" && (
          <button
            onClick={async () => {
              await checkIn();
              await loadToday();
              await loadHistory();
            }}
            className="px-6 py-3 rounded text-white bg-green-600"
          >
            Check In
          </button>
        )}

        {state === "WORKING" && (
          <>
            <button
              onClick={async () => {
                await startBreak();
                await loadToday();
              }}
              className="px-6 py-3 rounded text-white bg-yellow-500"
            >
              Start Break
            </button>

            <button
              onClick={async () => {
                await checkOut();
                await loadToday();
                await loadHistory();
              }}
              className="px-6 py-3 rounded text-white bg-red-600"
            >
              Check Out
            </button>
          </>
        )}

        {state === "ON_BREAK" && (
          <>
            <button
              onClick={async () => {
                await endBreak();
                await loadToday();
              }}
              className="px-6 py-3 rounded text-white bg-blue-600"
            >
              End Break
            </button>

            <button
              onClick={async () => {
                await checkOut();
                await loadToday();
                await loadHistory();
              }}
              className="px-6 py-3 rounded text-white bg-red-600"
            >
              Check Out
            </button>
          </>
        )}
      </div>

      {/* HISTORY */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">
          Attendance History
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Check In</th>
                <th className="py-2 text-left">Break</th>
                <th className="py-2 text-left">Check Out</th>
                <th className="py-2 text-left">Net Hours</th>
                <th className="py-2 text-left">Late (mins)</th>
                <th className="py-2 text-left">Early Exit (mins)</th>
                <th className="py-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr key={item.attendanceId} className="border-b">
                  <td className="py-2">{formatDate(item.date)}</td>
                  <td className="py-2">{formatTime(item.checkIn)}</td>
                  <td className="py-2">{item.totalBreakMinutes || 0}</td>
                  <td className="py-2">{formatTime(item.checkOut)}</td>
                  <td className="py-2 font-medium">
                    {calculateRowNetHours(item)}
                  </td>
                  <td className="py-2">{item.lateMinutes || 0}</td>
                  <td className="py-2">
                    {item.earlyExitMinutes > 0
                      ? `${item.earlyExitMinutes} mins`
                      : "—"}
                  </td>
                  <td className="py-2">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
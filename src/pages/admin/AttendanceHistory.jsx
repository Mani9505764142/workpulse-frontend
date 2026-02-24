import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getAdminAttendanceHistory } from "../../utils/adminAttendanceApi";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminAttendanceHistory() {
  const { userId } = useParams();

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await getAdminAttendanceHistory(userId);
        if (active) {
          setHistory(res.items || []);
        }
      } catch (err) {
        console.error(err);
        if (active) setError("Failed to load attendance history");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  // ✅ Optimized filtering
  const filteredHistory = useMemo(() => {
    const q = search.toLowerCase();

    return history.filter((item) => {
      return (
        item.date?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q)
      );
    });
  }, [history, search]);

  // ✅ CSV DOWNLOAD
  const downloadCSV = () => {
    if (!filteredHistory.length) return;

    const headers = [
      "Date",
      "Check In",
      "Check Out",
      "Break (mins)",
      "Net Hours",
      "Status"
    ];

    const rows = filteredHistory.map((row) => [
      row.date,
      row.checkIn
        ? new Date(row.checkIn).toLocaleTimeString()
        : "-",
      row.checkOut
        ? new Date(row.checkOut).toLocaleTimeString()
        : "-",
      row.totalBreakMinutes ?? 0,
      row.netHours ?? "-",
      row.status
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `attendance-report-${userId}.csv`;
    link.click();
  };

  // ✅ PDF DOWNLOAD
  const downloadPDF = () => {
    if (!filteredHistory.length) return;

    const doc = new jsPDF();

    doc.text("Attendance Report", 14, 15);

    const tableData = filteredHistory.map((row) => [
      row.date,
      row.checkIn
        ? new Date(row.checkIn).toLocaleTimeString()
        : "-",
      row.checkOut
        ? new Date(row.checkOut).toLocaleTimeString()
        : "-",
      row.totalBreakMinutes ?? 0,
      row.netHours ?? "-",
      row.status
    ]);

    autoTable(doc, {
      head: [["Date", "In", "Out", "Break", "Net", "Status"]],
      body: tableData,
      startY: 20
    });

    doc.save(`attendance-report-${userId}.pdf`);
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        Attendance History
      </h1>

      {/* 🔥 TOOLBAR */}
      <div className="mb-4 flex justify-between items-center">
        
        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search by date or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-72
            px-4
            py-2
            border
            rounded-lg
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />

        {/* EXPORT BUTTONS */}
        <div className="flex gap-2">
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Download CSV
          </button>

          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">In</th>
              <th className="p-3 text-left">Out</th>
              <th className="p-3 text-left">Break</th>
              <th className="p-3 text-left">Net</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredHistory.map((row) => (
              <tr key={row.attendanceId} className="border-t">
                <td className="p-3">{row.date}</td>

                <td className="p-3">
                  {row.checkIn
                    ? new Date(row.checkIn).toLocaleTimeString()
                    : "—"}
                </td>

                <td className="p-3">
                  {row.checkOut
                    ? new Date(row.checkOut).toLocaleTimeString()
                    : "—"}
                </td>

                <td className="p-3">
                  {row.totalBreakMinutes ?? 0}m
                </td>

                <td className="p-3">
                  {row.netHours ?? "—"}
                </td>

                <td className="p-3 font-medium">
                  {row.status}
                </td>
              </tr>
            ))}

            {filteredHistory.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-center text-gray-500"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

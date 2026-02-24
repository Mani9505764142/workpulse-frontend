import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();

  /* 🔐 AUTH REDIRECT (ROLE AWARE – FIXED) */
  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("role");

    if (isAuth === "true") {
      if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/app/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  /* 🔐 Cognito login */
  const handleLogin = () => {
    localStorage.clear();

    const COGNITO_DOMAIN =
      "https://us-east-1xklaetj5h.auth.us-east-1.amazoncognito.com";

    const CLIENT_ID = "rcqt06dpk77uds93d8pontkjm";
    const REDIRECT_URI =
  window.location.origin + "/auth/callback";

    const loginUrl =
      `${COGNITO_DOMAIN}/login?` +
      `response_type=code&` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=openid+email+profile&` +
      `prompt=login`;

    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* ======== DEVICE NOTICE BANNER ======== */}
      <div className="w-full bg-blue-600 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee py-2 text-sm text-white font-medium">
          This application is optimized for Laptop, Desktop & Tablets. 
          Mobile-friendly version will be available soon.
        </div>
      </div>

      {/* ================= HERO ================= */}
      <section className="min-h-[80vh] flex flex-col justify-center items-center text-center px-6">
        <div className="text-4xl font-bold mb-4 text-blue-600">
          WorkPulse
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold mb-4 max-w-3xl">
          Smarter Attendance. Clearer Insights. Better Teams.
        </h1>

        <p className="text-slate-600 max-w-xl mb-8">
          WorkPulse helps organizations track attendance, analyze productivity,
          and empower employees with transparent, data-driven insights.
        </p>

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl
                     font-medium hover:bg-blue-700 transition"
        >
          Login to WorkPulse
        </button>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold mb-4">About WorkPulse</h2>
        <p className="text-slate-600 leading-relaxed max-w-3xl">
          WorkPulse is a modern workforce management platform designed to
          simplify attendance tracking and convert daily work activity into
          meaningful insights for both employees and organizations.
        </p>
      </section>

      {/* ================= MISSION ================= */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed max-w-3xl">
            Our mission is to eliminate confusion in attendance systems and
            replace it with clarity, accuracy, and trust.
          </p>
        </div>
      </section>

      {/* ================= WHY ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold mb-10">Why WorkPulse?</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Feature
            title="Accurate Tracking"
            desc="Eliminate manual errors with reliable attendance records."
          />
          <Feature
            title="Real-Time Insights"
            desc="Visual dashboards that help teams understand productivity."
          />
          <Feature
            title="Secure by Design"
            desc="Built on AWS with enterprise-grade authentication."
          />
          <Feature
            title="Employee Friendly"
            desc="Simple UI designed for daily use without friction."
          />
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-white text-center py-6">
        <p className="text-sm opacity-80">
          WorkPulse © 2026 · Built for modern teams
        </p>
      </footer>
    </div>
  );
}

/* ================= FEATURE CARD ================= */
function Feature({ title, desc }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{desc}</p>
    </div>
  );
}
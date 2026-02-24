import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleAuth = async () => {
      // 🔥 ALWAYS start clean (prevents multi-user bugs)
      localStorage.clear();

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        navigate("/", { replace: true });
        return;
      }

      try {
        // 1️⃣ Exchange auth code → tokens
        const tokenRes = await fetch(
          "https://nhdo400jr3.execute-api.us-east-1.amazonaws.com/dev/auth/callback",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code })
          }
        );

        if (!tokenRes.ok) {
          throw new Error("Token exchange failed");
        }

        const tokens = await tokenRes.json();

        localStorage.setItem("idToken", tokens.id_token);
        localStorage.setItem("accessToken", tokens.access_token);
        localStorage.setItem("isAuthenticated", "true");

        // 2️⃣ Fetch profile (RAW token, NO Bearer)
        const profileRes = await fetch(
          "https://mrm1jocp20.execute-api.us-east-1.amazonaws.com/dev/profile",
          {
            headers: {
              Authorization: tokens.id_token
            }
          }
        );

        if (!profileRes.ok) {
          throw new Error("Profile fetch failed");
        }

        const profile = await profileRes.json();
        localStorage.setItem("role", profile.role);

        // 3️⃣ Redirect ONCE (fresh role only)
        navigate(
          profile.role === "ADMIN"
            ? "/admin/dashboard"
            : "/app/dashboard",
          { replace: true }
        );
      } catch (err) {
        console.error("AuthCallback error:", err);
        localStorage.clear();
        navigate("/", { replace: true });
      }
    };

    handleAuth();
  }, [navigate]);

  return <p>Signing you in…</p>;
}

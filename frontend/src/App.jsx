import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { WeekPlanner } from "./pages/WeekPlanner";
import { Tasks } from "./pages/Tasks";
import { UserPanel } from "./pages/UserPanel";

const API = "http://localhost/Planit-Todo-App/backend/api";

export default function App() {
  const [user, setUser] = useState(null);

  // ✅ Centralized auto-login for Daria
  useEffect(() => {
    async function autoLoginUser() {
      try {
        console.log("🔍 Checking for hardcoded user: Daria");
        const res = await fetch(`${API}/getUserByEmail.php?email=daria.sk135@gmail.com`);
        const data = await res.json();
        console.log("📡 Response:", data);

        if (data.success && data.user) {
          const dbUser = data.user;

          if (dbUser.is_logged_in === 0) {
            console.log("🔄 Daria is logged out, logging in automatically...");
            const loginRes = await fetch(`${API}/login.php`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: dbUser.email }),
              credentials: "include",
            });
            const loginData = await loginRes.json();
            console.log("🧾 Login API response:", loginData);
          }

          // ✅ Sync local state + localStorage
          dbUser.is_logged_in = 1;
          setUser(dbUser);
          localStorage.setItem("loggedinUser", JSON.stringify(dbUser));
          console.log("✅ Auto-login successful for Daria");
        } else {
          console.warn("⚠️ Could not find Daria in DB.");
        }
      } catch (err) {
        console.error("💥 Auto-login failed:", err);
      }
    }

    autoLoginUser();
  }, []);

  // ✅ Centralized logout (called from Header)
  const handleLogout = async () => {
    if (!user) return;
    try {
      console.log("🔄 Logging out user:", user.email);
      const res = await fetch(`${API}/updateUserStatus.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, is_logged_in: 0 }),
      });
      const text = await res.text();
      console.log("🧾 Logout response:", text);
    } catch (err) {
      console.error("💥 Logout failed:", err);
    }

    localStorage.removeItem("loggedinUser");
    setUser(null);
  };

  return (
    <Router>
      {/* ✅ Pass both user + logout handler to Header */}
      <Header user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<WeekPlanner />} />
        <Route path="/tasks" element={<Tasks />} />
        {user && <Route path="/user" element={<UserPanel />} />}
      </Routes>
    </Router>
  );
}

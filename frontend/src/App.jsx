import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { WeekPlanner } from "./pages/WeekPlanner";
import { Tasks } from "./pages/Tasks";
import { UserPanel } from "./pages/UserPanel";

const API = "http://localhost/Planit-Todo-App/backend/api";

export default function App() {
  const [user, setUser] = useState(null);

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
            await fetch(`${API}/login.php`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: dbUser.email }),
              credentials: "include",
            });
          }

          setUser(dbUser);
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

  return (
    <Router>
      <Header user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<WeekPlanner />} />
        <Route path="/tasks" element={<Tasks />} />
        {user && <Route path="/user" element={<UserPanel />} />}
      </Routes>
    </Router>
  );
}

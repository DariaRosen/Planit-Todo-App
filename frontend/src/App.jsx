import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Header } from "./components/Header"
import { WeekPlanner } from "./pages/WeekPlanner"
import { Tasks } from "./pages/Tasks"
import { UserPanel } from "./pages/UserPanel"
import { UserAuth } from "./pages/UserAuth"

const API = "http://localhost/Planit-Todo-App/backend/api"

export default function App() {
  const [user, setUser] = useState(null)

  // ✅ Restore saved user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("loggedinUser")
    if (stored) {
      setUser(JSON.parse(stored))
    } else {
      autoLoginDaria()
    }
  }, [])

  // ✅ Auto-login logic for Daria (runs once if no local user)
  async function autoLoginDaria() {
    try {
      console.log("🔍 Checking for hardcoded user: Daria")
      const res = await fetch(`${API}/getUserByEmail.php?email=daria.sk135@gmail.com`)
      const data = await res.json()
      console.log("📡 Response:", data)

      if (data.success && data.user) {
        const dbUser = data.user

        if (dbUser.is_logged_in === 0) {
          console.log("🔄 Daria is logged out, logging in automatically...")
          await fetch(`${API}/login.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: dbUser.email }),
            credentials: "include",
          })
        }

        dbUser.is_logged_in = 1
        setUser(dbUser)
        localStorage.setItem("loggedinUser", JSON.stringify(dbUser))
        console.log("✅ Auto-login successful for Daria")
      } else {
        console.warn("⚠️ Daria not found in DB.")
      }
    } catch (err) {
      console.error("💥 Auto-login failed:", err)
    }
  }

  // ✅ Global logout handler
  const handleLogout = async () => {
    if (!user) return
    try {
      console.log("🔄 Logging out user:", user.email)
      await fetch(`${API}/updateUserStatus.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, is_logged_in: 0 }),
      })
    } catch (err) {
      console.error("Logout failed:", err)
    }
    localStorage.removeItem("loggedinUser")
    setUser(null)
  }

  return (
    <Router>
      <Header user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<WeekPlanner />} />
        <Route path="/tasks" element={<Tasks />} />
        {!user ? (
          <Route path="/user" element={<UserAuth setUser={setUser} />} />
        ) : (
          <Route
            path="/user"
            element={<UserPanel user={user} setUser={setUser} />}
          />
        )}
      </Routes>
    </Router>
  )
}

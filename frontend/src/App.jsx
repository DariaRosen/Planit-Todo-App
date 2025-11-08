import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Header } from "./components/Header"
import { WeekPlanner } from "./pages/WeekPlanner"
import { Tasks } from "./pages/Tasks"
import { UserPanel } from "./pages/UserPanel"
import { UserAuth } from "./pages/UserAuth"

const API = "http://localhost:4000/api"

export default function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initUser() {
      try {
        const stored = localStorage.getItem("loggedinUser")

        if (stored) {
          console.log("📦 Found user in localStorage.")
          setUser(JSON.parse(stored))
        } else {
          console.log("🔍 No local user, running auto-login for Daria...")
          await autoLoginDaria()
        }
      } catch (err) {
        console.error("💥 Error initializing user:", err)
      } finally {
        // ✅ Ensure we mark loading as done after either case
        setIsLoading(false)
      }
    }

    initUser()
  }, [])

async function autoLoginDaria() {
  try {
    const res = await fetch(`${API}/users/email/daria.sk135@gmail.com`)
    const data = await res.json()
    console.log("📡 Auto-login check response:", data)

    if (data.success && data.user) {
      const dbUser = data.user

      // ✅ (Optional) Mark logged in if needed
      if (!dbUser.is_logged_in) {
        await fetch(`${API}/users/${dbUser._id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_logged_in: true }),
        })
      }

      dbUser.is_logged_in = true
      localStorage.setItem("loggedinUser", JSON.stringify(dbUser))
      setUser(dbUser)
      console.log("✅ Auto-login successful for Daria")
    } else {
      console.warn("⚠️ Daria not found in DB.")
    }
  } catch (err) {
    console.error("💥 Auto-login failed:", err)
  }
}


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

  // ✅ Prevent premature rendering
  if (isLoading) {
    return (
      <div className="loading-screen">
        <h2><img src="/256px-Planet.svg.png" alt="Planit" /> Planit</h2>
        <p>Loading your profile...</p>
      </div>
    )
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

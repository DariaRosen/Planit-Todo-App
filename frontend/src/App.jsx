import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { PlanitLayout } from "./layouts/PlanitLayout"
import { WeekPlanner } from "./pages/WeekPlanner"
import { Tasks } from "./pages/Tasks"
import { UserPanel } from "./components/UserPanel"
import { useEffect } from "react"

const API = "http://localhost/Planit-Todo-App/backend/api"

export function App() {
  useEffect(() => {
    const HARD_CODED_USER = {
      name: "Daria",
      email: "daria.sk135@gmail.com",
    }

    const autoLoginUser = async () => {
      try {
        // 1️⃣ Try to get this user directly by email
        const res = await fetch(`${API}/getUserByEmail.php?email=${encodeURIComponent(HARD_CODED_USER.email)}`)
        const user = await res.json()

        if (!user || !user.id) {
          console.warn("Hardcoded user not found in DB.")
          return
        }

        // 2️⃣ If user is logged out, mark as logged in
        if (!user.is_logged_in) {
          await fetch(`${API}/updateUserStatus.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id, is_logged_in: 1 }),
          })
        }

        // 3️⃣ Save to localStorage for frontend state
        const loggedUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          is_main_user: user.is_main_user,
          avatar_url:
            user.avatar_url ||
            `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(user.name || "Guest")}`,
          is_logged_in: 1,
        }

        localStorage.setItem("loggedinUser", JSON.stringify(loggedUser))
      } catch (err) {
        console.error("Auto login check failed:", err)
      }
    }

    autoLoginUser()
  }, [])

  return (
    <Router>
      <Routes>
        <Route element={<PlanitLayout />}>
          <Route path="/" element={<WeekPlanner />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/user" element={<UserPanel />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

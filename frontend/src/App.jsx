import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { PlanitLayout } from "./layouts/PlanitLayout"
import { WeekPlanner } from "./pages/WeekPlanner"
import { Tasks } from "./pages/Tasks"
import { UserPanel } from "./components/UserPanel"

const API = "http://localhost/Planit-Todo-App/backend/api"

export function App() {
  useEffect(() => {
    const email = "daria.sk135@gmail.com"

    async function autoLoginUser() {
      try {
        console.log("🔍 Checking for hardcoded user…")

        const res = await fetch(`${API}/getUserByEmail.php?email=${encodeURIComponent(email)}`)
        console.log("📡 Response status:", res.status)

        const text = await res.text()
        console.log("🧾 Raw response text:", text)

        const data = JSON.parse(text)
        console.log("✅ Parsed data:", data)

        if (data.success && data.user) {
          console.log("🎉 Found user in DB:", data.user)

          const user = data.user

          // If user is logged out in DB, log them in automatically
          if (user.is_logged_in === 0) {
            console.log("🔄 User is logged out — updating to logged in…")

            await fetch(`${API}/updateUserStatus.php`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: user.id, is_logged_in: 1 }),
            })

            console.log("✅ User marked as logged in in DB")
            user.is_logged_in = 1
          }

          // Store locally for the session
          localStorage.setItem("loggedinUser", JSON.stringify(user))
        } else {
          console.warn("⚠️ Hardcoded user not found in DB or invalid response:", data)
        }
      } catch (err) {
        console.error("💥 Auto login check failed:", err)
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

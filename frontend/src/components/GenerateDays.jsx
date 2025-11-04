// ✅ src/components/GenerateDays.jsx
import { useState } from "react"

export function GenerateDays({ tasks }) {
    const API = "http://localhost/Planit-Todo-App/backend/api"
    const [status, setStatus] = useState(null)

    const generateNext7Days = async () => {
        if (!tasks?.length) {
            setStatus("⚠️ No tasks found.")
            return
        }

        setStatus("⏳ Generating next 7 days...")
        const today = new Date()
        const newDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today)
            d.setDate(today.getDate() + i)
            return d.toISOString().split("T")[0]
        })

        try {
            debugger
            for (const day of newDays) {
                for (const task of tasks) {
                    const weekday = new Date(day).toLocaleDateString("en-US", { weekday: "long" })
                    const isDaily = task.frequency === "daily"
                    const isWeeklyMonday = task.frequency === "weekly" && weekday === "Monday"
                    if (isDaily || isWeeklyMonday) {
                        const body = { task_id: task.id, day_date: day }
                        console.log("🛰 Sending:", body)

                        const res = await fetch(`${API}/generateNextDays.php`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(body),
                        })

                        const data = await res.json()
                        console.log("📩 Server response:", data)
                    }
                }
            }
            setStatus("✅ Generated successfully!")
        } catch (err) {
            console.error("❌ Error:", err)
            setStatus("❌ Failed to generate days.")
        }
    }

    return (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button onClick={generateNext7Days} className="generate-btn">
                Generate Next 7 Days
            </button>
            {status && <p>{status}</p>}
        </div>
    )
}

import { useState } from "react"
import { buildApiUrl } from "../lib/api-config"

export function GenerateDays({ tasks }) {
    const apiBaseUrl = buildApiUrl()
    const [status, setStatus] = useState(null)

    const generateNext7Days = async () => {
        if (!tasks?.length) {
            setStatus("⚠️ No tasks found.")
            return
        }

        // 🧭 Get current logged-in user from localStorage
        const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
        if (!loggedUser?._id) {
            setStatus("❌ No logged-in user found.")
            return
        }

        setStatus("⏳ Generating next 7 days...")

        // Generate ISO date strings for the next 7 days
        const today = new Date()
        const next7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today)
            d.setDate(today.getDate() + i)
            return d.toISOString().split("T")[0]
        })

        try {
            // Loop through each day and each task
            for (const day of next7Days) {
                for (const task of tasks) {
                    const weekday = new Date(day).toLocaleDateString("en-US", { weekday: "long" })
                    const isDaily = task.frequency === "daily"
                    const isWeeklyMonday = task.frequency === "weekly" && weekday === "Monday"

                    if (isDaily || isWeeklyMonday) {
                        const payload = {
                            user_id: loggedUser._id,              // from localStorage
                            task_id: task._id || task.id,         // Mongo _id or fallback
                            day_date: day,
                            title: task.title,
                        }

                        console.log("🛰 Sending:", payload)

                        const res = await fetch(`${apiBaseUrl}/daytasks`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
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

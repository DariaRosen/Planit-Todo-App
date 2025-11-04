import { useState, useEffect } from "react"
import { DndContext } from "@dnd-kit/core"
import { TaskPanel } from "../components/TaskPanel"
import { DroppableDay } from "../components/DroppableDay"

export function WeekPlanner() {
    const API = "http://localhost/Planit-Todo-App/backend/api"
    const [days, setDays] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [signupDate, setSignupDate] = useState(null)

    // 🧭 Load signup date once using logged-in user email
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
        if (!loggedUser?.email) {
            console.error("❌ No logged user found in localStorage")
            return
        }

        const email = encodeURIComponent(loggedUser.email)

        fetch(`${API}/getUserByEmail.php?email=${email}`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data?.success && data.user?.created_at) {
                    setSignupDate(new Date(data.user.created_at))
                } else {
                    console.error("⚠️ Could not fetch created_at, fallback to today")
                    setSignupDate(new Date())
                }
            })
            .catch((err) => {
                console.error("❌ Error loading user:", err)
                setSignupDate(new Date())
            })
    }, [])

    // 📅 Once we have signup date, build all days (signup → today + 7)
    useEffect(() => {
        if (!signupDate) return

        const today = new Date()
        const allDays = []
        const oneDay = 24 * 60 * 60 * 1000

        for (let d = new Date(signupDate); d <= today; d = new Date(d.getTime() + oneDay)) {
            allDays.push(new Date(d))
        }

        // add 7 future days
        for (let i = 1; i <= 7; i++) {
            const future = new Date(today)
            future.setDate(today.getDate() + i)
            allDays.push(future)
        }

        const formatted = allDays.map((date) => ({
            fullDate: date.toISOString().split("T")[0],
            name: date.toLocaleDateString("en-US", { weekday: "long" }),
            short: date.toLocaleDateString("en-US", { day: "numeric", month: "numeric" }),
        }))

        setDays(formatted)
    }, [signupDate])

    // ⏩ move one day right
    const showNext = () => {
        setCurrentIndex((prev) =>
            prev + 1 < days.length - 2 ? prev + 1 : prev
        )
    }

    // ⏪ move one day left (until signup date)
    const showPrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
    }

    const visibleDays = days.slice(currentIndex, currentIndex + 3)

    return (
        <DndContext>
            <div className="week-planner-container">
                <div className="task-panel-wrapper">
                    <TaskPanel tasks={[]} />
                </div>

                <div className="week-planner-header">
                    <button
                        onClick={showPrev}
                        className="arrow-btn"
                        disabled={currentIndex === 0}
                    >
                        ◀
                    </button>
                    <h2 className="week-title">Planit Timeline</h2>
                    <button
                        onClick={showNext}
                        className="arrow-btn"
                        disabled={currentIndex + 3 >= days.length}
                    >
                        ▶
                    </button>
                </div>

                <div className="week-planner">
                    {visibleDays.map((day) => (
                        <DroppableDay key={day.fullDate} day={day}>
                            <h3 className="day-title">
                                <span className="day-name">{day.name}</span>
                                <span className="day-date">{day.short}</span>
                            </h3>
                            <p className="no-tasks">🕳 Drag and drop tasks here</p>
                        </DroppableDay>
                    ))}
                </div>
            </div>
        </DndContext>
    )
}

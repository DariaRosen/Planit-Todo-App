import { useState, useEffect } from "react"
import { DndContext } from "@dnd-kit/core"
import { TaskPanel } from "../components/TaskPanel"
import { DroppableDay } from "../components/DroppableDay"

export function WeekPlanner() {
    const API = "http://localhost/Planit-Todo-App/backend/api"
    const [days, setDays] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [signupDate, setSignupDate] = useState(null)
    const handleDragEnd = (event) => {
        const { active, over } = event
        if (!over) return

        const taskData = active.data?.current
        if (!taskData) return

        const targetDay = over.id.replace("day-", "")

        setDays((prev) =>
            prev.map((day) => {
                if (day.fullDate !== targetDay) return day

                const alreadyExists = day.tasks.some((t) => t.id === taskData.id)
                if (alreadyExists) return day

                // 💾 Save to DB
                fetch(`${API}/addDayTask.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ task_id: taskData.id, day_date: targetDay }),
                }).catch(console.error)

                return { ...day, tasks: [...day.tasks, taskData] }
            })
        )
    }


    // 🧭 Load signup date using user email
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
        if (!loggedUser?.email) {
            console.error("❌ No logged user found in localStorage")
            return
        }

        const email = encodeURIComponent(loggedUser.email)

        fetch(`${API}/getUserByEmail.php?email=${email}`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                if (data?.success && data.user?.created_at) {
                    setSignupDate(new Date(data.user.created_at))
                } else {
                    setSignupDate(new Date())
                }
            })
            .catch((err) => {
                console.error("❌ Error loading user:", err)
                setSignupDate(new Date())
            })
    }, [])

    // 📅 Build full days list once we have signup date
    // 📅 Build full days list once we have signup date
    useEffect(() => {
        if (!signupDate) return

        const today = new Date()
        today.setHours(0, 0, 0, 0) // normalize
        const allDays = []
        const oneDay = 24 * 60 * 60 * 1000

        // Create days from signup to today
        for (let d = new Date(signupDate); d <= today; d = new Date(d.getTime() + oneDay)) {
            d.setHours(0, 0, 0, 0)
            allDays.push(new Date(d))
        }

        // Add next 7 future days
        for (let i = 1; i <= 7; i++) {
            const future = new Date(today)
            future.setDate(today.getDate() + i)
            future.setHours(0, 0, 0, 0)
            allDays.push(future)
        }

        const formatted = allDays.map((date) => {
            const isToday =
                date.toDateString() === today.toDateString()

            return {
                fullDate: date.toISOString().split("T")[0],
                name: date.toLocaleDateString("en-US", { weekday: "long" }),
                short: date.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "numeric",
                }),
                isToday,
            }
        })

        setDays(formatted)

        // 🧭 Make today the leftmost visible day
        const todayIndex = formatted.findIndex((d) => d.isToday)
        if (todayIndex !== -1) {
            // ensure it shows today + next two days
            const startIndex = Math.max(0, todayIndex)
            setCurrentIndex(startIndex)
        }
    }, [signupDate])


    // Navigation buttons
    const showNext = () => {
        setCurrentIndex((prev) => (prev + 1 < days.length - 2 ? prev + 1 : prev))
    }
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
                        <DroppableDay
                            key={day.fullDate}
                            day={day}
                            className={day.isToday ? "today" : ""}
                        >
                            <h3 className={`day-title ${day.isToday ? "today" : ""}`}>
                                <span className="day-name">{day.name}</span>
                                <span className="day-date">{day.short}</span>
                            </h3>
                            <p className="no-tasks">
                                {day.isToday ? "🌞 Today — Drag tasks here" : "🕳 Drag and drop tasks here"}
                            </p>
                        </DroppableDay>
                    ))}
                </div>
            </div>
        </DndContext>
    )
}

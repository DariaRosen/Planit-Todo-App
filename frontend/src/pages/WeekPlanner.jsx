// ✅ WeekPlanner.jsx
import { useState, useEffect } from "react"
import { DndContext } from "@dnd-kit/core"
import { TaskPanel } from "../components/TaskPanel"
import { DroppableDay } from "../components/DroppableDay"
import { TaskIcon } from "../components/TaskIcon"
import { Check, X, RotateCcw } from "lucide-react"

export function WeekPlanner() {
    const API = "http://localhost/Planit-Todo-App/backend/api"
    const [days, setDays] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [signupDate, setSignupDate] = useState(null)
    const [taskState, setTaskState] = useState({}) // ✅ Track approved/removed per day

    // ✅ DRAG END LOGIC
    const handleDragEnd = (event) => {
        const { active, over } = event
        if (!over) return
        const taskData = active.data?.current
        if (!taskData) return

        const targetDay = over.id.replace("day-", "")
        console.log("🗓 Dropped task", taskData.title, "into", targetDay)

        setDays((prev) =>
            prev.map((day) => {
                if (day.fullDate !== targetDay) return day
                const alreadyExists = day.tasks.some((t) => t.id === taskData.id)
                if (alreadyExists) return day
                return { ...day, tasks: [...day.tasks, taskData] }
            })
        )

        // 💾 (optional) API insert placeholder — uncomment later:
        /*
        fetch(`${API}/addDayTask.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task_id: taskData.id, day_date: targetDay }),
        })
            .then((res) => res.json())
            .then((data) => console.log("✅ DB add:", data))
            .catch((err) => console.error("❌ Add failed:", err))
        */
    }

    // ✅ APPROVE / REMOVE / REVERT logic
    const handleApprove = (day, taskId) => {
        setTaskState((prev) => ({
            ...prev,
            [day.fullDate]: {
                ...prev[day.fullDate],
                [taskId]:
                    prev[day.fullDate]?.[taskId] === "approved"
                        ? "pending"
                        : "approved",
            },
        }))
    }

    const handleRemove = (day, taskId) => {
        setTaskState((prev) => ({
            ...prev,
            [day.fullDate]: {
                ...prev[day.fullDate],
                [taskId]: "removed",
            },
        }))
    }

    // ✅ Load signup date
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
        if (!loggedUser?.email) return

        fetch(`${API}/getUserByEmail.php?email=${encodeURIComponent(loggedUser.email)}`)
            .then((res) => res.json())
            .then((data) => {
                if (data?.success && data.user?.created_at) {
                    setSignupDate(new Date(data.user.created_at))
                } else {
                    setSignupDate(new Date())
                }
            })
            .catch(() => setSignupDate(new Date()))
    }, [])

    // ✅ Build days (with empty tasks)
    useEffect(() => {
        if (!signupDate) return

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const allDays = []
        const oneDay = 24 * 60 * 60 * 1000

        // Past days from signup to today
        for (let d = new Date(signupDate); d <= today; d = new Date(d.getTime() + oneDay)) {
            d.setHours(0, 0, 0, 0)
            allDays.push(new Date(d))
        }

        // Next 7 future days
        for (let i = 1; i <= 7; i++) {
            const future = new Date(today)
            future.setDate(today.getDate() + i)
            future.setHours(0, 0, 0, 0)
            allDays.push(future)
        }

        const formatted = allDays.map((date) => {
            const isToday = date.toDateString() === today.toDateString()
            return {
                fullDate: date.toISOString().split("T")[0],
                name: date.toLocaleDateString("en-US", { weekday: "long" }),
                short: date.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "numeric",
                }),
                isToday,
                tasks: [], // ✅ prevents undefined error
            }
        })

        setDays(formatted)
        const todayIndex = formatted.findIndex((d) => d.isToday)
        if (todayIndex !== -1) setCurrentIndex(todayIndex)
    }, [signupDate])

    // ✅ Pagination
    const showNext = () => setCurrentIndex((prev) => (prev + 1 < days.length - 2 ? prev + 1 : prev))
    const showPrev = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
    const visibleDays = days.slice(currentIndex, currentIndex + 3)

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="week-planner-container">
                <div className="task-panel-wrapper">
                    <TaskPanel />
                </div>

                <div className="week-planner-header">
                    <button onClick={showPrev} className="arrow-btn" disabled={currentIndex === 0}>
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
                            <h3 className={`day-title ${day.isToday ? "today" : ""}`}>
                                <span className="day-name">{day.name}</span>
                                <span className="day-date">{day.short}</span>
                            </h3>

                            {day.tasks && day.tasks.length > 0 ? (
                                <ul className="task-list">
                                    {day.tasks
                                        .filter(
                                            (t) =>
                                                taskState[day.fullDate]?.[t.id] !== "removed"
                                        )
                                        .sort((a, b) => {
                                            const aState = taskState[day.fullDate]?.[a.id]
                                            const bState = taskState[day.fullDate]?.[b.id]
                                            if (aState === "approved" && bState !== "approved")
                                                return 1
                                            if (aState !== "approved" && bState === "approved")
                                                return -1
                                            return 0
                                        })
                                        .map((t) => {
                                            const state =
                                                taskState[day.fullDate]?.[t.id] || "pending"
                                            return (
                                                <li
                                                    key={`${day.fullDate}-${t.id}`}
                                                    className={`task-item ${state === "approved" ? "approved" : ""
                                                        }`}
                                                >
                                                    <div className="task-left">
                                                        <TaskIcon title={t.title} />
                                                        <span className="task-text">{t.title}</span>
                                                    </div>

                                                    <div className="task-actions">
                                                        {state === "approved" ? (
                                                            <button
                                                                className="revert-btn"
                                                                onClick={() =>
                                                                    handleApprove(day, t.id)
                                                                }
                                                            >
                                                                <RotateCcw size={18} />
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="approve-btn"
                                                                    onClick={() =>
                                                                        handleApprove(day, t.id)
                                                                    }
                                                                >
                                                                    <Check size={18} />
                                                                </button>
                                                                <button
                                                                    className="remove-btn"
                                                                    onClick={() =>
                                                                        handleRemove(day, t.id)
                                                                    }
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </li>
                                            )
                                        })}
                                </ul>
                            ) : (
                                <p className="no-tasks">
                                    {day.isToday
                                        ? "🌞 Today — Drag tasks here"
                                        : "🕳 Drag and drop tasks here"}
                                </p>
                            )}
                        </DroppableDay>
                    ))}
                </div>
            </div>
        </DndContext>
    )
}

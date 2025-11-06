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
    const [taskState, setTaskState] = useState({})

    // ✅ DRAG END LOGIC
    const handleDragEnd = (event) => {
        const { active, over } = event
        if (!over) return
        const taskData = active.data?.current
        if (!taskData) return

        const targetDay = over.id.replace("day-", "")
        console.log("🗓 Dropped task", taskData.title, "into", targetDay)

        // Add task visually
        setDays((prev) =>
            prev.map((day) => {
                if (day.fullDate !== targetDay) return day
                const duplicatedTask = {
                    ...taskData,
                    uniqueId: `${taskData.id}-${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2, 7)}`,
                }
                return { ...day, tasks: [...day.tasks, duplicatedTask] }
            })
        )

        // 💾 Save to DB
        fetch(`${API}/addDayTask.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                task_id: taskData.id,
                day_date: targetDay,
            }),
        })
            .then((res) => res.json())
            .then((data) => console.log("✅ DB add:", data))
            .catch((err) => console.error("❌ Add failed:", err))
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

    // ✅ Build full day list
    useEffect(() => {
        if (!signupDate) return

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const allDays = []
        const oneDay = 24 * 60 * 60 * 1000

        for (let d = new Date(signupDate); d <= today; d = new Date(d.getTime() + oneDay)) {
            d.setHours(0, 0, 0, 0)
            allDays.push(new Date(d))
        }

        for (let i = 1; i <= 7; i++) {
            const future = new Date(today)
            future.setDate(today.getDate() + i)
            future.setHours(0, 0, 0, 0)
            allDays.push(future)
        }

        const formatted = allDays.map((date) => ({
            fullDate: date.toLocaleDateString("en-CA"),
            name: date.toLocaleDateString("en-US", { weekday: "long" }),
            short: date.toLocaleDateString("en-US", { day: "numeric", month: "numeric" }),
            isToday: date.toDateString() === today.toDateString(),
            tasks: [],
        }))

        setDays(formatted)
        const todayIndex = formatted.findIndex((d) => d.isToday)
        if (todayIndex !== -1) setCurrentIndex(todayIndex)
    }, [signupDate])

    // ✅ Sync daily tasks → then load tasks
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
        if (!loggedUser?.id || days.length === 0) return

        const visibleDays = days.slice(currentIndex, currentIndex + 3)
        const daysParam = visibleDays.map((d) => d.fullDate).join(",")

        const syncAndLoad = async () => {
            try {
                console.log("🟢 Syncing for user:", loggedUser.id)

                // Step 1: sync daily tasks
                const syncRes = await fetch(`${API}/syncDailyTasks.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: loggedUser.id }),
                    credentials: "include",
                })
                const syncData = await syncRes.json()
                console.log("🔄 Sync result:", syncData)

                // Step 2: load tasks from DB
                const loadRes = await fetch(
                    `${API}/getDayTasks.php?user_id=${loggedUser.id}&days=${daysParam}`
                )
                const loadData = await loadRes.json()
                console.log("📅 Loaded tasks:", loadData)

                if (loadData.success && loadData.tasks) {
                    setDays((prev) =>
                        prev.map((day) => ({
                            ...day,
                            tasks: loadData.tasks[day.fullDate] || [],
                        }))
                    )
                }
            } catch (err) {
                console.error("❌ Error syncing/loading tasks:", err)
            }
        }

        syncAndLoad()
    }, [currentIndex, days.length])

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

                {/* Header */}
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

                {/* Days */}
                <div className="week-planner">
                    {visibleDays.map((day) => (
                        <DroppableDay
                            key={day.fullDate}
                            day={day}
                            className={`day-card ${day.isToday ? "today" : ""} ${day.tasks.length > 0 ? "has-tasks" : ""
                                }`}
                        >
                            <h3 className={`day-title ${day.isToday ? "today" : ""}`}>
                                <span className="day-name">{day.name}</span>
                                <span className="day-date">{day.short}</span>
                            </h3>

                            {day.tasks.length > 0 ? (
                                <ul className="task-list">
                                    {day.tasks
                                        .filter(
                                            (t) =>
                                                taskState[day.fullDate]?.[t.id || t.task_id] !==
                                                "removed"
                                        )
                                        .sort((a, b) => {
                                            const aId = a.id || a.task_id
                                            const bId = b.id || b.task_id
                                            const aState = taskState[day.fullDate]?.[aId]
                                            const bState = taskState[day.fullDate]?.[bId]

                                            // ✅ Approved tasks go last
                                            if (aState === "approved" && bState !== "approved") return 1
                                            if (aState !== "approved" && bState === "approved") return -1

                                            // ✅ Alphabetical sort (A → Z)
                                            return a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
                                        })
                                        .map((t) => {
                                            const taskId = t.id || t.task_id
                                            const state = taskState[day.fullDate]?.[taskId] || "pending"
                                            return (
                                                <li
                                                    key={t.uniqueId || `${day.fullDate}-${taskId}`}
                                                    className={`task-item ${state === "approved" ? "approved" : ""}`}
                                                >
                                                    <div className="task-left">
                                                        <TaskIcon title={t.title} />
                                                        <span className="task-text">{t.title}</span>
                                                    </div>

                                                    <div className="task-actions">
                                                        {state === "approved" ? (
                                                            <button
                                                                className="revert-btn"
                                                                onClick={() => handleApprove(day, taskId)}
                                                            >
                                                                <RotateCcw size={18} />
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="approve-btn"
                                                                    onClick={() => handleApprove(day, taskId)}
                                                                >
                                                                    <Check size={18} />
                                                                </button>
                                                                <button
                                                                    className="remove-btn"
                                                                    onClick={() => handleRemove(day, taskId)}
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

import { useState, useEffect } from "react"
import { DndContext } from "@dnd-kit/core"
import { TaskPanel } from "../components/TaskPanel"
import { DroppableDay } from "../components/DroppableDay"
import { TaskIcon } from "../components/TaskIcon"
import { Check, X, RotateCcw } from "lucide-react"

export function WeekPlanner() {
    const API = "http://localhost:4000/api"
    const [days, setDays] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [signupDate, setSignupDate] = useState(null)
    const [taskState, setTaskState] = useState({})

    // 🧩 Handle Drag → Add Task
    const handleDragEnd = async (event) => {
        const { active, over } = event
        if (!over) return
        const taskData = active.data?.current
        if (!taskData) return

        const targetDay = over.id.replace("day-", "")
        const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
        if (!loggedUser?._id) return console.error("❌ No logged-in user found")

        try {
            const res = await fetch(`${API}/daytasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: loggedUser._id,
                    task_id: taskData.id,
                    day_date: targetDay,
                    title: taskData.title,
                }),
            })
            const data = await res.json()
            if (data.success) {
                console.log("✅ Task saved to DB:", data)
                setDays((prev) =>
                    prev.map((day) =>
                        day.fullDate === targetDay
                            ? {
                                ...day,
                                tasks: [
                                    ...day.tasks,
                                    {
                                        ...taskData,
                                        id: data.id,
                                        uniqueId: `${taskData.id}-${Date.now()}`,
                                    },
                                ],
                            }
                            : day
                    )
                )
            }
        } catch (err) {
            console.error("❌ Error adding task:", err)
        }
    }

    // 🧩 Approve / Revert
    const handleApprove = async (day, dayTaskId) => {
        const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
        if (!loggedUser?._id) return console.error("❌ No logged-in user found")

        const currentState = taskState[day.fullDate]?.[dayTaskId] || "pending"
        const newStatus = currentState === "approved" ? "pending" : "approved"

        setTaskState((prev) => ({
            ...prev,
            [day.fullDate]: { ...prev[day.fullDate], [dayTaskId]: newStatus },
        }))

        try {
            const res = await fetch(`${API}/daytasks/${dayTaskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })
            const data = await res.json()
            if (!data.success) console.error("❌ Failed to update:", data)
        } catch (err) {
            console.error("❌ Error updating status:", err)
        }
    }

    // 🧩 Remove Task
    const handleRemove = async (day, taskId) => {
        const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
        if (!loggedUser?._id) return console.error("❌ No logged-in user found")

        setTaskState((prev) => ({
            ...prev,
            [day.fullDate]: { ...prev[day.fullDate], [taskId]: "removed" },
        }))

        try {
            await fetch(`${API}/daytasks/${taskId}`, { method: "DELETE" })
            setDays((prev) =>
                prev.map((d) =>
                    d.fullDate === day.fullDate
                        ? { ...d, tasks: d.tasks.filter((t) => t.id !== taskId) }
                        : d
                )
            )
        } catch (err) {
            console.error("❌ Error removing task:", err)
        }
    }

    // 🧩 Load Signup Date
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
        if (!loggedUser?.email) return
        fetch(`${API}/users/email/${encodeURIComponent(loggedUser.email)}`)
            .then((res) => res.json())
            .then((data) => {
                if (data?.user?.created_at) setSignupDate(new Date(data.user.created_at))
                else setSignupDate(new Date())
            })
            .catch(() => setSignupDate(new Date()))
    }, [])

    // 🧩 Generate full day list
    useEffect(() => {
        if (!signupDate) return
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const allDays = []
        const oneDay = 24 * 60 * 60 * 1000

        for (let d = new Date(signupDate); d <= today; d = new Date(d.getTime() + oneDay)) {
            allDays.push(new Date(d))
        }
        for (let i = 1; i <= 7; i++) {
            const future = new Date(today)
            future.setDate(today.getDate() + i)
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

    // 🧩 Load + Sync Daily Tasks
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
        if (!loggedUser?._id || days.length === 0) return

        const visibleDays = days.slice(currentIndex, currentIndex + 3)
        const daysParam = visibleDays.map((d) => d.fullDate).join(",")

        const loadAndSync = async () => {
            try {
                // Load current tasks
                const res = await fetch(`${API}/daytasks?user_id=${loggedUser._id}&days=${daysParam}`)
                const data = await res.json()
                let tasks = data.tasks || {}
                let hasMissing = false

                visibleDays.forEach((d) => {
                    if (!tasks[d.fullDate] || tasks[d.fullDate].length === 0)
                        hasMissing = true
                })

                // If missing → sync via new Node route
                if (hasMissing) {
                    console.log("🔄 Missing daily tasks — syncing…")
                    await fetch(`${API}/sync-daily`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: loggedUser._id }),
                    })
                    const reload = await fetch(
                        `${API}/daytasks?user_id=${loggedUser._id}&days=${daysParam}`
                    )
                    const reloadData = await reload.json()
                    tasks = reloadData.tasks || {}
                }

                // Update UI
                setDays((prev) =>
                    prev.map((day) => ({
                        ...day,
                        tasks: tasks[day.fullDate] || [],
                    }))
                )
            } catch (err) {
                console.error("❌ Error loading/syncing tasks:", err)
            }
        }

        const timer = setTimeout(loadAndSync, 250)
        return () => clearTimeout(timer)
    }, [signupDate, currentIndex, days.length])

    // Pagination
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
                    <button onClick={showPrev} className="arrow-btn" disabled={currentIndex === 0}>◀</button>
                    <h2 className="week-title">Planit Timeline</h2>
                    <button onClick={showNext} className="arrow-btn" disabled={currentIndex + 3 >= days.length}>▶</button>
                </div>

                <div className="week-planner">
                    {visibleDays.map((day) => (
                        <DroppableDay
                            key={day.fullDate}
                            day={day}
                            className={`day-card ${day.isToday ? "today" : ""} ${day.tasks.length ? "has-tasks" : ""}`}
                        >
                            <h3 className={`day-title ${day.isToday ? "today" : ""}`}>
                                <span className="day-name">{day.name}</span>
                                <span className="day-date">{day.short}</span>
                            </h3>

                            {day.tasks.length > 0 ? (
                                <ul className="task-list">
                                    {day.tasks
                                        .filter((t) => taskState[day.fullDate]?.[t.id] !== "removed")
                                        .sort((a, b) => a.title.localeCompare(b.title))
                                        .map((t) => {
                                            const taskId = t.id || t.task_id
                                            const state = taskState[day.fullDate]?.[taskId] || t.status || "pending"
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
                                                            <button className="revert-btn" onClick={() => handleApprove(day, taskId)}>
                                                                <RotateCcw size={18} />
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button className="approve-btn" onClick={() => handleApprove(day, taskId)}>
                                                                    <Check size={18} />
                                                                </button>
                                                                <button className="remove-btn" onClick={() => handleRemove(day, taskId)}>
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
                                    {day.isToday ? "🌞 Today — Drag tasks here" : "🕳 Drag and drop tasks here"}
                                </p>
                            )}
                        </DroppableDay>
                    ))}
                </div>
            </div>
        </DndContext>
    )
}

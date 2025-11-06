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

    // ✅ DRAG END LOGIC — add task visually + save to DB
    const handleDragEnd = async (event) => {
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
        try {
            const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
            if (!loggedUser?.id) {
                console.error("❌ No logged-in user found")
                return
            }

            const res = await fetch(`${API}/addDayTask.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    user_id: loggedUser.id,
                    task_id: taskData.id,
                    day_date: targetDay,
                    title: taskData.title,
                }),
            })

            const data = await res.json()
            if (data.success) console.log("✅ Task saved to DB:", data)
            else console.error("❌ DB insertion failed:", data)
        } catch (err) {
            console.error("❌ Error adding task to DB:", err)
        }
    }

    // ✅ APPROVE / REVERT logic
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

    // ✅ REMOVE TASK — visually and from DB
    const handleRemove = async (day, taskId) => {
        setTaskState((prev) => ({
            ...prev,
            [day.fullDate]: {
                ...prev[day.fullDate],
                [taskId]: "removed",
            },
        }))

        try {
            const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
            if (!loggedUser?.id) {
                console.error("❌ No logged-in user found")
                return
            }

            // ✅ find the exact DB record id for this task
            const dayTask = day.tasks.find((t) => (t.id || t.task_id) === taskId)
            if (!dayTask?.id) {
                console.error("❌ Missing DB id for this task")
                return
            }

            console.log("🗑️ Removing task from DB:", {
                user_id: loggedUser.id,
                day_task_id: dayTask.id,
            })

            // 💾 Delete from DB
            const res = await fetch(`${API}/removeDayTask.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    user_id: loggedUser.id,
                    day_task_id: dayTask.id,
                }),
            })

            const data = await res.json()
            if (data.success) {
                console.log("🗑️ Task removed from DB:", data)

                // ✅ Remove visually from UI immediately
                setDays((prev) =>
                    prev.map((d) =>
                        d.fullDate === day.fullDate
                            ? { ...d, tasks: d.tasks.filter((t) => t.id !== dayTask.id) }
                            : d
                    )
                )
            } else {
                console.error("❌ Failed to remove task from DB:", data)
            }
        } catch (err) {
            console.error("❌ Error removing task:", err)
        }
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

    // ✅ Build full day list (past + future)
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

    // ✅ Load existing tasks first, then sync daily tasks only if missing
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem("loggedinUser"))
        if (!loggedUser?.id || days.length === 0) return

        const visibleDays = days.slice(currentIndex, currentIndex + 3)
        const daysParam = visibleDays.map((d) => d.fullDate).join(",")

        const loadTasks = async () => {
            try {
                console.log("📦 Checking existing tasks for user:", loggedUser.id)

                // Step 1️⃣: Load existing tasks first
                const res = await fetch(
                    `${API}/getDayTasks.php?user_id=${loggedUser.id}&days=${daysParam}`
                )
                const data = await res.json()
                console.log("📅 Existing tasks:", data)

                let tasks = data.tasks || {}
                let hasMissing = false

                // Step 2️⃣: Check if any visible day has no tasks
                visibleDays.forEach((d) => {
                    if (!tasks[d.fullDate] || tasks[d.fullDate].length === 0)
                        hasMissing = true
                })

                // Step 3️⃣: If missing → sync daily tasks
                if (hasMissing) {
                    console.log("🔄 Missing daily tasks found, syncing...")
                    const syncRes = await fetch(`${API}/syncDailyTasks.php`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: loggedUser.id }),
                        credentials: "include",
                    })
                    const syncData = await syncRes.json()
                    console.log("✅ Sync completed:", syncData)

                    // Step 4️⃣: Reload all tasks after sync
                    const reload = await fetch(
                        `${API}/getDayTasks.php?user_id=${loggedUser.id}&days=${daysParam}`
                    )
                    const reloadData = await reload.json()
                    tasks = reloadData.tasks || {}
                    console.log("📦 Reloaded tasks:", reloadData)
                }

                // Step 5️⃣: Update UI
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

        loadTasks()
    }, [currentIndex, days.length])

    // ✅ Pagination logic
    const showNext = () => setCurrentIndex((prev) => (prev + 1 < days.length - 2 ? prev + 1 : prev))
    const showPrev = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
    const visibleDays = days.slice(currentIndex, currentIndex + 3)

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="week-planner-container">
                {/* Sidebar with draggable tasks */}
                <div className="task-panel-wrapper">
                    <TaskPanel />
                </div>

                {/* Header navigation */}
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

                {/* Days display */}
                <div className="week-planner">
                    {visibleDays.map((day) => (
                        <DroppableDay
                            key={day.fullDate}
                            day={day}
                            className={`day-card ${day.isToday ? "today" : ""} ${day.tasks.length > 0 ? "has-tasks" : ""}`}
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
                                                taskState[day.fullDate]?.[t.id || t.task_id] !== "removed"
                                        )
                                        .sort((a, b) => {
                                            const aId = a.id || a.task_id
                                            const bId = b.id || b.task_id
                                            const aState = taskState[day.fullDate]?.[aId]
                                            const bState = taskState[day.fullDate]?.[bId]

                                            // Approved tasks last
                                            if (aState === "approved" && bState !== "approved") return 1
                                            if (aState !== "approved" && bState === "approved") return -1

                                            // Alphabetical A→Z
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

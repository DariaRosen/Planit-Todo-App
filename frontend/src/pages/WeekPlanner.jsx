import { useState, useEffect } from "react"
import { DndContext } from "@dnd-kit/core"
import { Check, X, RotateCcw } from "lucide-react"
import { TaskPanel } from "../components/TaskPanel"
import { TaskIcon } from "../components/TaskIcon"
import { DroppableDay } from "../components/DroppableDay"
import { GenerateDays } from "../components/GenerateDays"

export function WeekPlanner() {
    const API = "http://localhost/Planit-Todo-App/backend/api"
    const [tasks, setTasks] = useState([])
    const [days, setDays] = useState([])
    const [taskState, setTaskState] = useState({})
    const [currentOffset, setCurrentOffset] = useState(0)

    // 🧭 Load all base tasks on mount
    useEffect(() => {
        loadTasks()
    }, [])

    const loadTasks = async () => {
        try {
            const res = await fetch(`${API}/getTasks.php`, { credentials: "include" })
            const data = await res.json()
            setTasks(data)
            generateWeek(data)
        } catch (err) {
            console.error("❌ Error loading tasks:", err)
        }
    }

    // 🧠 Generate next 7 days based on current offset
    const generateWeek = (taskList = tasks) => {
        const today = new Date()
        const newDays = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today)
            date.setDate(today.getDate() + currentOffset + i)
            const fullDate = date.toISOString().split("T")[0]
            const name = date.toLocaleDateString("en-US", { weekday: "long" })
            const shortDate = date.toLocaleDateString("en-US", { day: "numeric", month: "numeric" })

            // Filter tasks for this day
            const filtered = taskList.filter((t) => {
                const isDaily = t.frequency === "daily"
                const isWeeklyMonday = t.frequency === "weekly" && name === "Monday"
                return isDaily || isWeeklyMonday
            })

            return { name, date: shortDate, fullDate, tasks: filtered }
        })

        setDays(newDays)
    }

    // ✅ Approve / Remove / Revert task states
    const handleApprove = (day, taskId) => {
        setTaskState((prev) => ({
            ...prev,
            [day.fullDate]: {
                ...prev[day.fullDate],
                [taskId]:
                    prev[day.fullDate]?.[taskId] === "approved" ? "pending" : "approved",
            },
        }))
    }

    const handleRemove = (day, taskId) => {
        setTaskState((prev) => ({
            ...prev,
            [day.fullDate]: { ...prev[day.fullDate], [taskId]: "removed" },
        }))
    }

    // 🧲 Drag and drop handler (optional)
    const handleDragEnd = (event) => {
        const { active, over } = event
        if (!over) return
        const taskData = active.data?.current
        if (!taskData) return

        const targetDay = over.id.replace("day-", "")
        setDays((prev) =>
            prev.map((day) => {
                if (day.fullDate !== targetDay) return day

                const alreadyExists = day.tasks.some(
                    (t) => t.id === taskData.id || t.title === taskData.title
                )

                if (alreadyExists) {
                    const confirmDuplicate = window.confirm(
                        `Task "${taskData.title}" already exists in ${day.name}. Add again anyway?`
                    )
                    if (!confirmDuplicate) return day
                }

                // 💾 Insert new task in DB
                fetch(`${API}/generateNextDays.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        task_id: taskData.id,
                        day_date: targetDay,
                    }),
                }).catch(console.error)

                return {
                    ...day,
                    tasks: [...day.tasks, taskData],
                }
            })
        )
    }

    // 🧭 Navigation arrows
    const showNext = () => {
        setCurrentOffset((prev) => prev + 7)
        generateWeek()
    }
    const showPrev = () => {
        setCurrentOffset((prev) => Math.max(0, prev - 7))
        generateWeek()
    }

    const visibleDays = days.slice(0, 3)

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="week-planner-container">
                {/* 🧩 Task Panel */}
                <div className="task-panel-wrapper">
                    <TaskPanel tasks={tasks} />
                </div>

                {/* 🧭 Header */}
                <div className="week-planner-header">
                    <button onClick={showPrev} className="arrow-btn">◀</button>
                    <h2 className="week-title">Planit Timeline</h2>
                    <button onClick={showNext} className="arrow-btn">▶</button>
                </div>

                {/* 📅 Planner */}
                <div className="week-planner">
                    {visibleDays.map((day) => (
                        <DroppableDay key={day.fullDate} day={day}>
                            <h3 className="day-title">
                                <span className="day-name">{day.name}</span>
                                <span className="day-date">{day.date}</span>
                            </h3>

                            <ul className="task-list">
                                {day.tasks
                                    .filter(Boolean)
                                    .filter(
                                        (t) =>
                                            taskState[day.fullDate]?.[t.id] !== "removed"
                                    )
                                    .sort((a, b) => {
                                        const aState = taskState[day.fullDate]?.[a.id]
                                        const bState = taskState[day.fullDate]?.[b.id]
                                        if (
                                            aState === "approved" &&
                                            bState !== "approved"
                                        )
                                            return 1
                                        if (
                                            aState !== "approved" &&
                                            bState === "approved"
                                        )
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

                            {day.tasks.length === 0 && (
                                <p className="no-tasks">No tasks assigned</p>
                            )}
                        </DroppableDay>
                    ))}
                </div>
            </div>
        </DndContext>
    )
}

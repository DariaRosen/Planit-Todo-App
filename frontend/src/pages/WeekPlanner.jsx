import { useState, useEffect } from "react"
import { Check, X, RotateCcw } from "lucide-react"
import { DndContext } from "@dnd-kit/core"
import { TaskPanel } from "../components/TaskPanel"
import { TaskIcon } from "../components/TaskIcon"
import { DroppableDay } from "../components/DroppableDay"

export function WeekPlanner() {
    const [tasks, setTasks] = useState([])
    const [days, setDays] = useState([])
    const [currentOffset, setCurrentOffset] = useState(0)
    const [taskState, setTaskState] = useState({})

    const API = "http://localhost/Planit-Todo-App/backend/api"

    // 🧩 Generate days with optional data merge
    const generateDays = (taskList = [], dayTasks = []) => {
        const today = new Date()

        return Array.from({ length: 14 }, (_, i) => {
            const date = new Date(today)
            date.setDate(today.getDate() + currentOffset + i)

            const name = date.toLocaleDateString("en-US", { weekday: "long" })
            const shortDate = date.toLocaleDateString("en-US", {
                day: "numeric",
                month: "numeric",
            })
            const fullDate = date.toISOString().split("T")[0]

            // 🧠 Base tasks (daily/weekly auto-assign)
            const autoTasks = taskList.filter((t) => {
                if (t.frequency === "daily") return true
                if (t.frequency === "weekly" && name === "Monday") return true
                return false
            })

            // 🧠 Merge persisted tasks from DB
            const savedTasks = dayTasks
                .filter((dt) => dt.day_date === fullDate)
                .map((dt) => ({
                    id: dt.task_id,
                    title: dt.title,
                    frequency: dt.frequency,
                    status: dt.status,
                }))

            // Merge auto + saved tasks, but remove duplicates
            const combined = [...autoTasks, ...savedTasks]
                .filter(
                    (task, index, self) =>
                        index === self.findIndex((t) => t.id === task.id || t.title === task.title)
                )

            return { name, date: shortDate, fullDate, tasks: combined }
        })
    }

    // 🔄 Load both tasks and day-tasks once
    useEffect(() => {
        Promise.all([
            fetch(`${API}/getTasks.php`).then((res) => res.json()),
            fetch(`${API}/getDayTasks.php`).then((res) => res.json())
        ])
            .then(([allTasks, dayTasks]) => {
                setTasks(allTasks)
                setDays(generateDays(allTasks, dayTasks))
            })
            .catch(console.error)
    }, [currentOffset])


    // ✅ Task actions
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

    // 🧲 Drag handling
    const handleDragEnd = (event) => {
        const { active, over } = event
        if (!over) return

        const taskData = active.data?.current
        if (!taskData) return

        const taskId = parseInt(active.id.replace("task-", ""), 10)
        const targetDay = over.id.replace("day-", "")

        setDays((prev) =>
            prev.map((day) => {
                if (day.fullDate !== targetDay) return day

                const alreadyExists = day.tasks.some(
                    (t) =>
                        t.id === taskId ||
                        t.title.toLowerCase() === taskData.title.toLowerCase()
                )

                // 🟢 Ask before inserting duplicate
                if (alreadyExists) {
                    const confirmDuplicate = window.confirm(
                        `The task "${taskData.title}" already exists in ${day.name}. Add again anyway?`
                    )
                    if (!confirmDuplicate) return day
                }

                // 🧠 Save to DB only after confirmation
                fetch(`${API}/addDayTask.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ task_id: taskData.id, day_date: targetDay }),
                }).catch(console.error)

                return {
                    ...day,
                    tasks: alreadyExists
                        ? [...day.tasks, { ...taskData, id: `${taskId}-dup-${Date.now()}` }]
                        : [...day.tasks, taskData],
                }
            })
        )
    }

    const showNext = () => setCurrentOffset((prev) => prev + 1)
    const showPrev = () => setCurrentOffset((prev) => prev - 1)
    const visibleDays = days.slice(0, 4)

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="week-planner-container">
                {/* 🧩 Task Panel */}
                <div className="task-panel-wrapper">
                    <TaskPanel tasks={tasks} />
                </div>

                {/* 🧭 Header with arrows */}
                <div className="week-planner-header">
                    <button onClick={showPrev} className="arrow-btn">◀</button>
                    <h2 className="week-title">Planit Timeline</h2>
                    <button onClick={showNext} className="arrow-btn">▶</button>
                </div>

                {/* 📅 Days */}
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
                                    .filter((t) => taskState[day.fullDate]?.[t.id] !== "removed")
                                    .sort((a, b) => {
                                        const aState = taskState[day.fullDate]?.[a.id]
                                        const bState = taskState[day.fullDate]?.[b.id]
                                        if (aState === "approved" && bState !== "approved") return 1
                                        if (aState !== "approved" && bState === "approved") return -1
                                        return 0
                                    })
                                    .map((t) => {
                                        const state = taskState[day.fullDate]?.[t.id] || "pending"
                                        return (
                                            <li
                                                key={t.id}
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
                                                            onClick={() => handleApprove(day, t.id)}
                                                        >
                                                            <RotateCcw size={18} />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="approve-btn"
                                                                onClick={() => handleApprove(day, t.id)}
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                className="remove-btn"
                                                                onClick={() => handleRemove(day, t.id)}
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

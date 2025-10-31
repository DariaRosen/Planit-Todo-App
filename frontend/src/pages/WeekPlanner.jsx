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

    // 🧠 Generate days — merge auto & saved tasks correctly
    const generateDays = (taskList = [], dayTasks = []) => {
        const today = new Date()

        // Collect all saved (persisted) task titles for fast lookup
        const savedPairs = new Set(
            dayTasks.map((dt) => `${dt.day_date}-${dt.task_id}`)
        )

        return Array.from({ length: 14 }, (_, i) => {
            const date = new Date(today)
            date.setDate(today.getDate() + currentOffset + i)

            const name = date.toLocaleDateString("en-US", { weekday: "long" })
            const shortDate = date.toLocaleDateString("en-US", { day: "numeric", month: "numeric" })
            const fullDate = date.toISOString().split("T")[0]

            // Filter DB-saved tasks for that date
            const savedTasks = dayTasks
                .filter((dt) => dt.day_date === fullDate)
                .map((dt) => ({
                    id: dt.task_id,
                    title: dt.title,
                    frequency: dt.frequency,
                    status: dt.status,
                }))

            // Generate auto daily/weekly tasks based on daily_amount
            const autoTasks = taskList.flatMap((t) => {
                const isDaily = t.frequency === "daily"
                const isWeeklyMonday = t.frequency === "weekly" && name === "Monday"
                const alreadySaved = savedPairs.has(`${fullDate}-${t.id}`)
                const count = t.daily_amount || (isDaily ? 1 : 0)

                if ((isDaily || isWeeklyMonday) && !alreadySaved && count > 0) {
                    // create 'count' copies
                    return Array.from({ length: count }, (_, idx) => ({
                        ...t,
                        id: `${t.id}-${idx}`,
                        duplicateIndex: idx,
                    }))
                }
                return []
            })

            return { name, date: shortDate, fullDate, tasks: [...savedTasks, ...autoTasks] }
        })
    }



    // 🔄 Load both main tasks and day-tasks
    useEffect(() => {
        Promise.all([
            fetch(`${API}/getTasks.php`).then((res) => res.json()),
            fetch(`${API}/getDayTasks.php`).then((res) => res.json()),
        ])
            .then(([allTasks, dayTasks]) => {
                setTasks(allTasks)
                setDays(generateDays(allTasks, dayTasks))
            })
            .catch(console.error)
    }, [currentOffset])

    // ✅ Approve / Remove / Revert task handlers
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

    // 🧲 Handle drag and drop
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

                // 🟡 Ask before inserting duplicate
                if (alreadyExists) {
                    const confirmDuplicate = window.confirm(
                        `The task "${taskData.title}" already exists in ${day.name}. Add again anyway?`
                    )
                    if (!confirmDuplicate) return day
                }

                // 💾 Save to DB
                fetch(`${API}/addDayTask.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ task_id: taskData.id, day_date: targetDay }),
                }).catch(console.error)

                return {
                    ...day,
                    tasks: alreadyExists
                        ? [
                            ...day.tasks,
                            { ...taskData, id: `${taskId}-dup-${Date.now()}` }, // keep visible duplicate
                        ]
                        : [...day.tasks, taskData],
                }
            })
        )
    }

    // 🧭 Arrows
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
                                        (t) => taskState[day.fullDate]?.[t.id] !== "removed"
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
                                            <li key={`${day.fullDate}-${t.id}`} className={`task-item ${state === "approved" ? "approved" : ""}`}>
                                                <div className="task-left">
                                                    <TaskIcon title={t.title} />
                                                    <span className="task-text">
                                                        {t.title}
                                                    </span>
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
                                                                    handleApprove(
                                                                        day,
                                                                        t.id
                                                                    )
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

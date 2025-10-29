import { useState, useEffect } from "react"
import { Check, X, RotateCcw } from "lucide-react" // ✅ nice icons
import { TaskPanel } from "../components/TaskPanel"
import { TaskIcon } from "../components/TaskIcon"

export function WeekPlanner() {
    const [tasks, setTasks] = useState([])
    const [currentOffset, setCurrentOffset] = useState(0)
    const [taskState, setTaskState] = useState({}) // { [day.fullDate]: { [task.id]: "approved"/"removed"/"pending" } }

    const API = "http://localhost/Planit-Todo-App/backend/api"

    useEffect(() => {
        fetch(`${API}/getTasks.php`)
            .then((res) => res.json())
            .then(setTasks)
            .catch(console.error)
    }, [])

    const generateDays = () => {
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

            const dayTasks = tasks.filter((t) => {
                if (t.frequency === "daily") return true
                if (t.frequency === "weekly" && name === "Monday") return true
                return false
            })

            return { name, date: shortDate, fullDate, tasks: dayTasks }
        })
    }

    const [days, setDays] = useState(generateDays)
    useEffect(() => setDays(generateDays()), [tasks, currentOffset])

    const handleAddTask = (title, frequency) => {
        const newTask = { title, frequency }
        fetch(`${API}/addTask.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setTasks((prev) => [
                        { id: data.id, title, frequency, completed: 0 },
                        ...prev,
                    ])
                }
            })
    }

    // ⬅️ Task actions: approve / remove / revert
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

    const showNext = () => setCurrentOffset((prev) => prev + 1)
    const showPrev = () => setCurrentOffset((prev) => prev - 1)
    const visibleDays = days.slice(0, 4)

    return (
        <div className="week-planner-container">
            <div className="task-panel-wrapper">
                <TaskPanel tasks={tasks} onAddTask={handleAddTask} />
            </div>

            <div className="week-planner-header">
                <button onClick={showPrev} className="arrow-btn">◀</button>
                <h2 className="week-title">Planit Timeline</h2>
                <button onClick={showNext} className="arrow-btn">▶</button>
            </div>

            <div className="week-planner">
                {visibleDays.map((day) => (
                    <div key={day.fullDate} className="day-column">
                        <h3 className="day-title">
                            <span className="day-name">{day.name}</span>
                            <span className="day-date">{day.date}</span>
                        </h3>

                        <ul className="task-list">
                            {day.tasks
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
                    </div>
                ))}
            </div>
        </div>
    )
}

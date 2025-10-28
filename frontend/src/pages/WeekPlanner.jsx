import { useState, useEffect } from "react"
import { TaskPanel } from "../components/TaskPanel"

export function WeekPlanner() {
    const [tasks, setTasks] = useState([])
    const [currentOffset, setCurrentOffset] = useState(0)

    const API = "http://localhost/Planit-Todo-App/backend/api"

    // 🧠 Load all tasks once
    useEffect(() => {
        fetch(`${API}/getTasks.php`)
            .then((res) => res.json())
            .then(setTasks)
            .catch(console.error)
    }, [])

    // 🧩 Generate visible days dynamically with tasks
    const generateDays = () => {
        const today = new Date()
        const generatedDays = Array.from({ length: 14 }, (_, i) => {
            const date = new Date(today)
            date.setDate(today.getDate() + currentOffset + i)
            const name = date.toLocaleDateString("en-US", { weekday: "long" })
            const shortDate = date.toLocaleDateString("en-US", {
                day: "numeric",
                month: "numeric",
            })

            // Automatically include daily / weekly tasks
            const dayTasks = tasks.filter((t) => {
                if (t.frequency === "daily") return true
                if (t.frequency === "weekly" && name === "Monday") return true
                return false
            })

            return {
                name,
                date: shortDate,
                fullDate: date.toISOString().split("T")[0],
                tasks: dayTasks,
            }
        })
        return generatedDays
    }

    const [days, setDays] = useState(generateDays)

    // Recreate days whenever tasks or offset changes
    useEffect(() => {
        setDays(generateDays())
    }, [tasks, currentOffset])

    // ➕ Add new task
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

    // ◀▶ Navigation (4 days visible)
    const showNext = () => setCurrentOffset((prev) => prev + 1)
    const showPrev = () => setCurrentOffset((prev) => prev - 1)

    // Slice 4-day window
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

                        {day.tasks.length > 0 ? (
                            <ul className="task-list">
                                {day.tasks.map((t) => (
                                    <li key={t.id} className="task-item">
                                        {t.title}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-tasks">No tasks assigned</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

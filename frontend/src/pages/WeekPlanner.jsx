import { useState, useEffect } from "react"
import { TaskPanel } from "../components/TaskPanel"

export function WeekPlanner() {
    const [tasks, setTasks] = useState([])
    const [days, setDays] = useState(() =>
        Array.from({ length: 7 }, (_, i) => {
            const currentDate = new Date(Date.now() + i * 86400000)
            return {
                name: currentDate.toLocaleDateString("en-US", { weekday: "long" }),
                date: currentDate.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "numeric",
                }),
                tasks: [],
            }
        })
    )

    const API = "http://localhost/Planit-Todo-App/backend/api"

    // Load all tasks
    useEffect(() => {
        fetch(`${API}/getTasks.php`)
            .then((res) => res.json())
            .then(setTasks)
            .catch(console.error)
    }, [])

    // 🧠 Distribute tasks into days automatically
    useEffect(() => {
        const updatedDays = days.map((day) => {
            // For now, daily tasks go into every day.
            const dayTasks = tasks.filter((t) => {
                if (t.frequency === "daily") return true
                if (t.frequency === "weekly") return false
                if (t.frequency === "as_needed") return false
                return false
            })
            return { ...day, tasks: dayTasks }
        })
        setDays(updatedDays)
    }, [tasks])

    // Add new task
    const handleAddTask = (taskTitle, frequency) => {
        const newTask = { title: taskTitle, frequency }
        fetch(`${API}/addTask.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setTasks((prev) => [
                        { id: data.id, title: taskTitle, frequency, completed: 0 },
                        ...prev,
                    ])
                }
            })
    }

    return (
        <div className="week-planner-container">
            {/* Add task section */}
            <div className="task-panel-wrapper">
                <TaskPanel tasks={tasks} onAddTask={handleAddTask} />
            </div>

            {/* Week view */}
            <div className="week-planner">
                {days.map((day, idx) => (
                    <div key={idx} className="day-column">
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

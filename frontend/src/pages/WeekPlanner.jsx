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

    useEffect(() => {
        fetch(`${API}/getTasks.php`)
            .then((res) => res.json())
            .then(setTasks)
            .catch(console.error)
    }, [])

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
                    setTasks([{ id: data.id, title: taskTitle, frequency, completed: 0 }, ...tasks])
                }
            })
    }

    return (
        <div className="week-planner-container">
            {/* Task panel section */}
            <div className="task-panel-wrapper">
                <TaskPanel tasks={tasks} onAddTask={handleAddTask} />
            </div>

            {/* Week planner grid */}
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

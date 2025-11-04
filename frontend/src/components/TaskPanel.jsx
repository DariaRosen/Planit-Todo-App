import { useEffect, useState } from "react"
import { TaskIcon } from "./TaskIcon"

export function TaskPanel() {
    const API = "http://localhost/Planit-Todo-App/backend/api"
    const [tasks, setTasks] = useState([])

    useEffect(() => {
        const frequencies = "weekly,as_needed"
        fetch(`${API}/getTasksByFrequency.php?frequencies=${frequencies}`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success && Array.isArray(data.tasks)) {
                    setTasks(data.tasks)
                } else {
                    console.warn("⚠️ No tasks returned")
                    setTasks([])
                }
            })
            .catch((err) => console.error("❌ Error loading tasks:", err))
    }, [])

    return (
        <div className="task-panel">
            <h3 className="task-panel-title">Choose Tasks:</h3>
            <div className="task-panel-list">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`task-chip draggable ${task.frequency}`}
                            draggable
                            data-id={task.id}
                        >
                            <TaskIcon title={task.title} />
                            {task.title}
                        </div>
                    ))
                ) : (
                    <p className="no-tasks">No tasks yet.</p>
                )}
            </div>
        </div>
    )
}

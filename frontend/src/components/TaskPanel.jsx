import { useState } from "react"

export function TaskPanel({ tasks, onAddTask }) {
    const [newTask, setNewTask] = useState("")
    const [frequency, setFrequency] = useState("as_needed")

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!newTask.trim()) return
        onAddTask(newTask, frequency)
        setNewTask("")
        setFrequency("as_needed")
    }

    // 🧠 Filter out daily tasks
    const filteredTasks = tasks.filter((t) => t.frequency !== "daily")

    return (
        <aside className="task-panel">
            <h2 className="">Choose Tasks:</h2>

            <form onSubmit={handleSubmit} className="task-form">
                <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add new task..."
                />
                <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                >
                    <option value="weekly">Weekly</option>
                    <option value="as_needed">As needed</option>
                    <option value="daily">Daily</option>
                </select>
                <button type="submit">Add</button>
            </form>

            <ul className="task-list">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <li key={task.id} className="task-item">
                            <span>{task.title}</span>
                            <span className="task-frequency">{task.frequency}</span>
                        </li>
                    ))
                ) : (
                    <li className="no-tasks">No tasks yet</li>
                )}
            </ul>
        </aside>
    )
}

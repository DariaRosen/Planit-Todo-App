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

    return (
        <aside className="task-panel">
            <h2 className="">All Tasks</h2>

            <form onSubmit={handleSubmit} className="">
                <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add new task..."
                    className=""
                />

                <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className=""
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as_needed">As needed</option>
                </select>

                <button className="">
                    Add Task
                </button>
            </form>

            <ul className="">
                {tasks.map((task) => (
                    <li
                        key={task.id}
                        className=""
                    >
                        <span>{task.title}</span>
                        <span className="">{task.frequency}</span>
                    </li>
                ))}
            </ul>
        </aside>
    )
}

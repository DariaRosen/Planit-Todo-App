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
        <aside className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-semibold mb-3 text-lg">All Tasks</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-3">
                <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add new task..."
                    className="border p-2 rounded"
                />

                <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as_needed">As needed</option>
                </select>

                <button className="bg-blue-500 text-white px-3 py-1 rounded">
                    Add Task
                </button>
            </form>

            <ul className="space-y-2">
                {tasks.map((task) => (
                    <li
                        key={task.id}
                        className="border rounded p-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                    >
                        <span>{task.title}</span>
                        <span className="text-sm text-gray-500">{task.frequency}</span>
                    </li>
                ))}
            </ul>
        </aside>
    )
}

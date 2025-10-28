import { useState } from "react"

export function TaskPanel({ tasks, onAddTask }) {
    const [newTask, setNewTask] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!newTask.trim()) return
        onAddTask(newTask)
        setNewTask("")
    }

    return (
        <aside className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-semibold mb-3 text-lg">All Tasks</h2>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
                <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add new task..."
                    className="border p-2 flex-1 rounded"
                />
                <button className="bg-blue-500 text-white px-3 rounded">Add</button>
            </form>

            <ul className="space-y-2">
                {tasks.map((task) => (
                    <li
                        key={task.id}
                        className="border rounded p-2 hover:bg-blue-50 cursor-pointer"
                    >
                        {task.title}
                    </li>
                ))}
            </ul>
        </aside>
    )
}

import { useEffect, useState } from "react"
import "../assets/css/setup/main.scss"
import { buildApiUrl } from "../lib/api-config"

export function Tasks() {
    const [tasks, setTasks] = useState([])
    const [newTask, setNewTask] = useState("")
    const [frequency, setFrequency] = useState("daily")
    const [editingTask, setEditingTask] = useState(null)
    const apiBaseUrl = buildApiUrl()

    // 🧠 Load all tasks on mount
    useEffect(() => {
        fetch(`${apiBaseUrl}/tasks`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setTasks(data)
            })
            .catch((err) => console.error("❌ Failed to load tasks:", err))
    }, [])

    // 💾 Add or edit task
    const handleSave = async () => {
        if (!newTask.trim()) return

        try {
            if (editingTask) {
                // 🛠 Update existing task
                const res = await fetch(`${apiBaseUrl}/tasks/${editingTask._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: newTask, frequency }),
                })
                const data = await res.json()

                if (data.success) {
                    setTasks((prev) =>
                        prev.map((t) =>
                            t._id === editingTask._id
                                ? { ...t, title: newTask, frequency }
                                : t
                        )
                    )
                    setEditingTask(null)
                    setNewTask("")
                }
            } else {
                // ➕ Add new task
                const res = await fetch(`${apiBaseUrl}/tasks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: newTask, frequency }),
                })
                const data = await res.json()

                if (data.success) {
                    setTasks((prev) => [data.task, ...prev])
                    setNewTask("")
                }
            }
        } catch (err) {
            console.error("❌ Error saving task:", err)
        }
    }

    // ❌ Delete a task
    const handleDelete = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return

        try {
            const res = await fetch(`${apiBaseUrl}/tasks/${taskId}`, { method: "DELETE" })
            const data = await res.json()

            if (data.success) {
                setTasks((prev) => prev.filter((t) => t._id !== taskId))
            } else {
                console.error("Failed to delete:", data.error)
            }
        } catch (err) {
            console.error("❌ Error deleting task:", err)
        }
    }

    // ✏️ Edit mode
    const handleEdit = (task) => {
        setEditingTask(task)
        setNewTask(task.title)
        setFrequency(task.frequency)
    }

    // 📂 Group tasks by frequency
    const grouped = {
        daily: tasks.filter((t) => t.frequency === "daily"),
        weekly: tasks.filter((t) => t.frequency === "weekly"),
        as_needed: tasks.filter((t) => t.frequency === "as_needed"),
    }

    // 🧱 Render
    return (
        <div className="tasks-page">
            <h1 className="page-title">🗂️ All Tasks</h1>

            {/* ➕ Add / Edit Task */}
            <div className="task-form">
                <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add new task..."
                />
                <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as_needed">As needed</option>
                </select>
                <button onClick={handleSave}>
                    {editingTask ? "Update Task" : "Add Task"}
                </button>
            </div>

            {/* 🗂️ Grouped Tasks */}
            <div className="task-groups">
                {Object.entries(grouped).map(([freq, list]) => (
                    <div key={freq} className="task-group">
                        <h2>{freq.replace("_", " ").toUpperCase()}</h2>

                        <div className="task-list">
                            {list.length > 0 ? (
                                list.map((task) => (
                                    <div key={task._id} className={`task-item ${freq}`}>
                                        <span>{task.title}</span>

                                        <div className="actions">
                                            <button onClick={() => handleEdit(task)}>✏️</button>
                                            <button onClick={() => handleDelete(task._id)}>🗑️</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-tasks">No {freq} tasks yet</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

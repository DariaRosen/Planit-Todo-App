import { useEffect, useState } from "react"
import "../assets/css/setup/main.scss"

export function Tasks() {
    const [tasks, setTasks] = useState([])
    const [newTask, setNewTask] = useState("")
    const [frequency, setFrequency] = useState("daily")
    const [editingTask, setEditingTask] = useState(null)

    const API = "http://localhost/Planit-Todo-App/backend/api"

    // Load all tasks
    useEffect(() => {
        fetch(`${API}/getTasks.php`)
            .then((res) => res.json())
            .then(setTasks)
            .catch(console.error)
    }, [])

    // Handle add or edit
    const handleSave = () => {
        if (!newTask.trim()) return

        if (editingTask) {
            // EDIT existing task
            fetch(`${API}/updateTask.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingTask.id,
                    title: newTask,
                    frequency,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        setTasks((prev) =>
                            prev.map((t) =>
                                t.id === editingTask.id ? { ...t, title: newTask, frequency } : t
                            )
                        )
                        setEditingTask(null)
                        setNewTask("")
                    }
                })
        } else {
            // ADD new task
            fetch(`${API}/addTask.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTask, frequency }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        setTasks([
                            { id: data.id, title: newTask, frequency, completed: 0 },
                            ...tasks,
                        ])
                        setNewTask("")
                    }
                })
        }
    }

    const handleDelete = (id) => {
        fetch(`${API}/deleteTask.php?id=${id}`, { method: "DELETE" })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setTasks((prev) => prev.filter((t) => t.id !== id))
            })
    }

    const handleEdit = (task) => {
        setEditingTask(task)
        setNewTask(task.title)
        setFrequency(task.frequency)
    }

    const grouped = {
        daily: tasks.filter((t) => t.frequency === "daily"),
        weekly: tasks.filter((t) => t.frequency === "weekly"),
        as_needed: tasks.filter((t) => t.frequency === "as_needed"),
    }

    return (
        <div className="tasks-page">
            <h1 className="page-title">🗂️ All Tasks</h1>

            {/* Add new / edit task */}
            <div className="task-form">
                <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Task title..."
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

            {/* Task Groups */}
            <div className="task-groups">
                {Object.entries(grouped).map(([freq, list]) => (
                    <div key={freq} className="task-group">
                        <h2>{freq.replace("_", " ").toUpperCase()}</h2>
                        <div className="task-list">
                            {list.map((task) => (
                                <div key={task.id} className={`task-item ${freq}`}>
                                    <span>{task.title}</span>
                                    <div className="actions">
                                        <button onClick={() => handleEdit(task)}>✏️</button>
                                        <button onClick={() => handleDelete(task.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

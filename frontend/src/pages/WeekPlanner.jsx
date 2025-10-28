import { useState, useEffect } from "react"
import { TaskPanel } from "../components/TaskPanel"

export function WeekPlanner() {
    const [tasks, setTasks] = useState([])
    const [days, setDays] = useState(() =>
        Array.from({ length: 7 }, (_, i) => ({
            name: new Date(Date.now() + i * 86400000).toLocaleDateString("en-US", {
                weekday: "short",
            }),
            tasks: [],
        }))
    )

    const API = "http://localhost/Planit-Todo-App/backend/api"

    useEffect(() => {
        fetch(`${API}/getTasks.php`)
            .then((res) => res.json())
            .then(setTasks)
            .catch(console.error)
    }, [])

    const handleAddTask = (taskTitle) => {
        const newTask = { title: taskTitle }
        fetch(`${API}/addTask.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setTasks([{ id: data.id, title: taskTitle, completed: 0 }, ...tasks])
                }
            })
    }

    return (
        <div className="grid grid-cols-8 gap-4">
            <div className="col-span-2">
                <TaskPanel tasks={tasks} onAddTask={handleAddTask} />
            </div>

            <div className="col-span-6 grid grid-cols-7 gap-2">
                {days.map((day, idx) => (
                    <div
                        key={idx}
                        className="border rounded-md p-2 min-h-[200px] bg-white shadow-sm"
                    >
                        <h3 className="font-semibold text-center border-b pb-1 mb-2">
                            {day.name}
                        </h3>
                        {day.tasks.length > 0 ? (
                            <ul>
                                {day.tasks.map((t) => (
                                    <li key={t.id}>{t.title}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 text-center text-sm">
                                No tasks assigned
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

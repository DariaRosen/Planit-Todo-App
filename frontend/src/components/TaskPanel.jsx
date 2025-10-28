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

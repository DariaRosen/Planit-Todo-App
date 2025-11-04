import { useEffect, useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { TaskIcon } from "./TaskIcon"

function DraggableTask({ task }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `task-${task.id}`,
        data: { ...task },
    })

    const style = {
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`task-block draggable ${task.frequency}`}
            style={style}
        >
            <TaskIcon title={task.title} />
            <span className="task-title">{task.title}</span>
        </div>
    )
}

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
                    setTasks([])
                }
            })
            .catch((err) => console.error("❌ Error loading tasks:", err))
    }, [])

    return (
        <div className="task-panel">
            <h3 className="task-panel-title">Choose Tasks:</h3>
            <div className="task-blocks">
                {tasks.length > 0 ? (
                    tasks.map((task) => <DraggableTask key={task.id} task={task} />)
                ) : (
                    <p className="no-tasks">No tasks yet.</p>
                )}
            </div>
        </div>
    )
}

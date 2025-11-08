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
    const [includeDaily, setIncludeDaily] = useState(false)

    // Fetch both weekly/as_needed and optionally daily tasks
    useEffect(() => {
        const frequencies = includeDaily
            ? "daily,weekly,as_needed"
            : "weekly,as_needed"

        fetch(`${API}/tasks/by-frequency?frequencies=${frequencies}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success && Array.isArray(data.tasks)) {
                    setTasks(data.tasks)
                } else {
                    setTasks([])
                }
            })
            .catch((err) => console.error("❌ Error loading tasks:", err))
    }, [includeDaily])

    return (
        <div className="task-panel">
            <div className="task-panel-header">
                <h3 className="task-panel-title">Choose Tasks:</h3>

                {/* ✅ Checkbox toggle */}
                <label className="show-daily-toggle">
                    <input
                        type="checkbox"
                        checked={includeDaily}
                        onChange={(e) => setIncludeDaily(e.target.checked)}
                    />
                    Show daily tasks
                </label>
            </div>

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

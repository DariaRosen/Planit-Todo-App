import { useDraggable } from "@dnd-kit/core"
import { TaskIcon } from "./TaskIcon"

export function DraggableTask({ task }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `task-${task.id}`,
        data: task,
    })

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        zIndex: isDragging ? 9999 : "auto",
        position: isDragging ? "relative" : "static",
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="task-block draggable"
            data-dragging={isDragging}
        >
            <TaskIcon title={task.title} size={20} />
            <span className="task-title">{task.title}</span>
        </div>
    )
}

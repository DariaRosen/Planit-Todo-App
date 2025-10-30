import { useDroppable } from "@dnd-kit/core"

export function DroppableDay({ day, children }) {
    const { isOver, setNodeRef } = useDroppable({
        id: `day-${day.fullDate}`,
        data: day,
    })

    return (
        <div
            ref={setNodeRef}
            className={`day-column ${isOver ? "day-over" : ""}`}
        >
            {children}
        </div>
    )
}

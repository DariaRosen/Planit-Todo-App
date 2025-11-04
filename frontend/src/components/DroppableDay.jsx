import { useDroppable } from "@dnd-kit/core"

export function DroppableDay({ day, children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `day-${day.fullDate}`,
    })

    return (
        <div
            ref={setNodeRef}
            className={`day-column ${day.isToday ? "today" : ""} ${isOver ? "day-over" : ""}`}
        >
            {children}
        </div>
    )
}

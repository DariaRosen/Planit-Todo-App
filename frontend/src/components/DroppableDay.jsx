import { useDroppable } from "@dnd-kit/core"

export function DroppableDay({ day, className = "", children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `day-${day.fullDate}`,
    })

    const combinedClassName = [
        "day-column",
        day.isToday ? "today" : "",
        isOver ? "day-over" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ")

    return (
        <div
            ref={setNodeRef}
            className={combinedClassName}
        >
            {children}
        </div>
    )
}

import { DraggableTask } from "./DraggableTask"

export function TaskPanel({ tasks }) {
    const filteredTasks = tasks.filter((t) => t.frequency !== "daily")

    return (
        <aside className="task-panel">
            <h2 className="task-panel-title">Choose Tasks:</h2>
            <div className="task-blocks">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => <DraggableTask key={task.id} task={task} />)
                ) : (
                    <p className="no-tasks">No tasks yet</p>
                )}
            </div>
        </aside>
    )
}

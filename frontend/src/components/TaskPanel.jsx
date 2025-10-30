import { TaskIcon } from "./TaskIcon"

export function TaskPanel({ tasks }) {
    // Exclude daily tasks
    const filteredTasks = tasks.filter((t) => t.frequency !== "daily")

    return (
        <aside className="task-panel">
            <h2 className="task-panel-title">Choose Tasks:</h2>

            <div className="task-blocks">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <div key={task.id} className="task-block">
                            <TaskIcon title={task.title} size={20} />
                            <span className="task-title">{task.title}</span>
                        </div>
                    ))
                ) : (
                    <p className="no-tasks">No tasks yet</p>
                )}
            </div>
        </aside>
    )
}

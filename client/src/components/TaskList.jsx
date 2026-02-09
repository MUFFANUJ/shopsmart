import TaskItem from './TaskItem';

function TaskList({ tasks, onDelete, onUpdate, busy }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <h3>No tasks yet</h3>
        <p>Create your first task and start tracking progress.</p>
      </div>
    );
  }

  return (
    <section className="task-grid" aria-live="polite">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onDelete={onDelete} onUpdate={onUpdate} busy={busy} />
      ))}
    </section>
  );
}

export default TaskList;

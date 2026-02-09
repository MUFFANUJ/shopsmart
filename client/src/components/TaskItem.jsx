import { useState } from 'react';
import TaskForm from './TaskForm';

function TaskItem({ task, onDelete, onUpdate, busy }) {
  const [isEditing, setIsEditing] = useState(false);

  const submitEdit = async (payload) => {
    await onUpdate(task.id, payload);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <article className="task-card editing">
        <TaskForm
          initialValues={task}
          submitLabel="Update Task"
          busy={busy}
          onSubmit={submitEdit}
          onCancel={() => setIsEditing(false)}
        />
      </article>
    );
  }

  return (
    <article className={`task-card ${task.completed ? 'done' : ''}`}>
      <header>
        <h3>{task.title}</h3>
        <span className="status-pill">{task.completed ? 'Completed' : 'Pending'}</span>
      </header>
      {task.description && <p>{task.description}</p>}
      <div className="task-actions">
        <button
          type="button"
          className="button secondary"
          onClick={() => onUpdate(task.id, { completed: !task.completed })}
          disabled={busy}
        >
          Toggle Status
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() => setIsEditing(true)}
          disabled={busy}
        >
          Edit
        </button>
        <button
          type="button"
          className="button danger"
          onClick={() => onDelete(task.id)}
          disabled={busy}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskItem;

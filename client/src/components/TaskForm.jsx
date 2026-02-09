import { useEffect, useState } from 'react';

const defaultState = {
  title: '',
  description: '',
  completed: false,
};

function TaskForm({
  initialValues = defaultState,
  onSubmit,
  onCancel,
  submitLabel = 'Save Task',
  busy = false,
}) {
  const [formValues, setFormValues] = useState(defaultState);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormValues({
      title: initialValues.title || '',
      description: initialValues.description || '',
      completed: Boolean(initialValues.completed),
    });
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.title.trim()) {
      setError('Title is required.');
      return;
    }

    setError('');

    await onSubmit({
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      completed: formValues.completed,
    });

    if (!initialValues.id) {
      setFormValues(defaultState);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={formValues.title}
          onChange={handleChange}
          placeholder="Add a focused task"
          maxLength={120}
        />
      </div>

      <div className="field-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formValues.description}
          onChange={handleChange}
          placeholder="Optional details"
          maxLength={500}
          rows={3}
        />
      </div>

      <label className="checkbox-row" htmlFor="completed">
        <input
          id="completed"
          name="completed"
          type="checkbox"
          checked={formValues.completed}
          onChange={handleChange}
        />
        Mark as completed
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="button-row">
        {onCancel && (
          <button type="button" className="button secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        )}
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;

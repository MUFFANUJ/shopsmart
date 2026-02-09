import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import useTasks from './hooks/useTasks';

function App() {
  const { tasks, loading, error, processing, createTask, updateTask, deleteTask, loadTasks } =
    useTasks();

  return (
    <main className="app-shell">
      <div className="glow-orb" aria-hidden="true" />
      <section className="panel hero">
        <p className="eyebrow">ShopSmart Productivity</p>
        <h1>Task Command Center</h1>
        <p>
          Capture priorities, update status instantly, and manage work with a production-ready
          stack.
        </p>
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>Create Task</h2>
          <button
            type="button"
            className="button secondary"
            onClick={loadTasks}
            disabled={loading || processing}
          >
            Refresh
          </button>
        </div>
        <TaskForm onSubmit={createTask} submitLabel="Create Task" busy={processing} />
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>All Tasks</h2>
          <span className="badge">{tasks.length} items</span>
        </div>

        {loading ? <p className="status">Loading tasks...</p> : null}
        {error ? <p className="status error">{error}</p> : null}

        {!loading && !error ? (
          <TaskList tasks={tasks} onDelete={deleteTask} onUpdate={updateTask} busy={processing} />
        ) : null}
      </section>
    </main>
  );
}

export default App;

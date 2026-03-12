import { useCallback, useEffect, useMemo, useState } from 'react';
import { taskApi } from '../api/tasksApi';

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(async (payload) => {
    setProcessing(true);
    try {
      setError('');
      const createdTask = await taskApi.createTask(payload);
      setTasks((previousTasks) => [createdTask, ...previousTasks]);
      return createdTask;
    } catch (apiError) {
      setError(apiError.message);
      throw apiError;
    } finally {
      setProcessing(false);
    }
  }, []);

  const updateTask = useCallback(async (id, payload) => {
    setProcessing(true);
    try {
      setError('');
      const updatedTask = await taskApi.updateTask(id, payload);
      setTasks((previousTasks) =>
        previousTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      return updatedTask;
    } catch (apiError) {
      setError(apiError.message);
      throw apiError;
    } finally {
      setProcessing(false);
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    setProcessing(true);
    try {
      setError('');
      await taskApi.deleteTask(id);
      setTasks((previousTasks) => previousTasks.filter((task) => task.id !== id));
    } catch (apiError) {
      setError(apiError.message);
      throw apiError;
    } finally {
      setProcessing(false);
    }
  }, []);

  return useMemo(
    () => ({
      tasks,
      loading,
      error,
      processing,
      loadTasks,
      createTask,
      updateTask,
      deleteTask,
    }),
    [tasks, loading, error, processing, loadTasks, createTask, updateTask, deleteTask]
  );
};

export default useTasks;

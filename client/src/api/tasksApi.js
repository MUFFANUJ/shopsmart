const resolveApiBaseUrl = () => {
  try {
    // `import.meta.env` is available in Vite runtime.
    return Function('return import.meta.env?.VITE_API_URL || ""')();
  } catch (error) {
    // Fallback for Jest/Node environments.
    return globalThis?.process?.env?.VITE_API_URL || '';
  }
};

const API_BASE_URL = resolveApiBaseUrl().replace(/\/$/, '');

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.error?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  return parseResponse(response);
};

const taskApi = {
  getTasks: () => request('/api/tasks'),
  createTask: (payload) =>
    request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTask: (id, payload) =>
    request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteTask: (id) =>
    fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to delete task ${id}`);
      }
    }),
};

export { taskApi, parseResponse };

import { Status, Task } from './types.js';

const TASK_API_BASE = 'http://localhost:3000/api/v1/';
const TOKEN = '';

export async function getTasks(status?: Status, search?: string) {
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(
      `${TASK_API_BASE}tasks${status ? `?status=${status}` : ''}${search ? `&search=${search}` : ''}`,
      { headers }
    );
    if (!response.ok) {
      throw new Error(`Error fetching tasks: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return null;
  }
}

export async function createTask(task: Task) {
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(`${TASK_API_BASE}tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(`Error creating task: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

export async function deleteTask(taskId: number) {
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(`${TASK_API_BASE}tasks/${taskId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      console.error('Error deleting task:', response.statusText);
      throw new Error(`Error deleting task: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return null;
  }
}

export async function changeTaskStatus(taskId: number, status: Status) {
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(`${TASK_API_BASE}tasks/${taskId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      console.error('Error changing task status:', response.statusText);
      throw new Error(`Error changing task status: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error changing task status:', error);
    return null;
  }
}

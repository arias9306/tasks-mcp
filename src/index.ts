import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const TASK_API_BASE = 'http://localhost:3000/api/v1/';
const TOKEN = '';

const StatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'DONE']);

interface Task {
  title: string;
  description: string;
}

type Status = z.infer<typeof StatusSchema>;

const server = new McpServer({
  name: 'tasks management',
  version: '1.0.0',
  capabilities: {
    resources: {},
    tools: {},
  },
});

async function getTasks(status?: Status, search?: string) {
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

async function createTask(task: Task) {
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

async function deleteTask(taskId: number) {
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

async function changeTaskStatus(taskId: number, status: Status) {
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

server.tool(
  'get_tasks',
  `Get All Tasks or Filter by Status/ Search

  e.g. GET /tasks?status=OPEN&search=bug
  e.g. GET /tasks?status=DONE
  e.g. GET /tasks
  e.g. GET /tasks?search=bug
  `,
  {
    status: StatusSchema.optional().describe('Filter tasks by status (e.g., "OPEN", "IN_PROGRESS", "DONE")'),
    search: z.string().optional().describe('Search term to filter tasks by title or description'),
  },
  async ({ status, search }) => {
    const tasks = await getTasks(status, search);

    if (!tasks) {
      return {
        content: [{ type: 'text', text: 'Failed to retrieve tasks.' }],
      };
    }

    if (tasks.length === 0) {
      return {
        content: [{ type: 'text', text: 'No tasks found.' }],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: 'The following tasks were retrieved successfully: <json>' + JSON.stringify(tasks) + '</json>',
        },
      ],
    };
  }
);

server.tool(
  'create_tasks',
  `
    Create a new task with the status OPEN

    e.g. POST /tasks body: { "title": "New Task", "description": "Task description" }
    `,
  {
    title: z.string().min(2).max(100).describe('The title of the task'),
    description: z.string().min(2).max(100).describe('The description of the task'),
  },
  async ({ title, description }) => {
    const newTasks = await createTask({ title, description });

    if (!newTasks) {
      return {
        content: [{ type: 'text', text: 'Failed to create task.' }],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: 'The following task was created successfully: <json>' + JSON.stringify(newTasks) + '</json>',
        },
      ],
    };
  }
);

server.tool(
  'delete_task_by_id',
  `
  Delete a task by its ID

  e.g. DELETE /tasks/{id}
`,
  {
    id: z.number().min(1).describe('The ID of the task to delete'),
  },
  async ({ id }) => {
    const deletedTask = await deleteTask(id);

    if (!deletedTask) {
      return {
        content: [{ type: 'text', text: 'Failed to delete task.' }],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: 'The task was deleted successfully!',
        },
      ],
    };
  }
);

server.tool(
  'change_task_status',
  `
  Change the status of a task

  e.g. PATCH /tasks/{id}/status body: { "status": "DONE" }
  e.g. PATCH /tasks/{id}/status body: { "status": "IN_PROGRESS" }
  e.g. PATCH /tasks/{id}/status body: { "status": "OPEN" }
`,
  {
    id: z.number().min(1).describe('The ID of the task to update'),
    status: StatusSchema.describe('The new status of the task (e.g., "DONE", "IN_PROGRESS", "OPEN")'),
  },
  async ({ id, status }) => {
    const updatedTask = await changeTaskStatus(id, status);

    if (!updatedTask) {
      return {
        content: [{ type: 'text', text: 'Failed to change task status.' }],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text:
            'The task status was changed successfully the new status is: ' +
            status +
            '. <json>' +
            JSON.stringify(updatedTask) +
            '</json>',
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Tasks MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

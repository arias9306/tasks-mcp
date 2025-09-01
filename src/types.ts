import { z } from 'zod';

export const StatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'DONE']);

export interface Task {
  title: string;
  description: string;
}

export type Status = z.infer<typeof StatusSchema>;

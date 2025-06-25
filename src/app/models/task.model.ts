export enum TaskStatus {
  Pending = 'pending',
  Completed = 'completed'
}
export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: TaskStatus;
  due_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskResponse {
  data: Task[];
  total: number;
  page: number;
  pageSize: number;
}
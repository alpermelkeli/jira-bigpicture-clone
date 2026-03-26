export type IssueType = 'epic' | 'story' | 'task' | 'subtask' | 'bug';

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export type Priority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';

export interface Task {
  id: string;
  issueKey: string;
  summary: string;
  description: string;
  issueType: IssueType;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  reporter: string;
  startDate: string | null; // ISO date string
  endDate: string | null;   // ISO date string
  progress: number;         // 0-100
  parentId: string | null;
  children: string[];
  labels: string[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

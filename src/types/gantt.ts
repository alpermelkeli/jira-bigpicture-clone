// SVAR wx-react-gantt compatible types
export interface GanttTask {
  id: string | number;
  text: string;
  start: Date;
  end: Date;
  duration?: number;
  progress: number;
  type?: 'task' | 'summary' | 'milestone';
  parent?: string | number;
  open?: boolean;
  lazy?: boolean;
  details?: string;
  // Custom fields
  issueType?: string;
  issueKey?: string;
  status?: string;
  priority?: string;
  assignee?: string;
}

export interface GanttLink {
  id: string | number;
  source: string | number;
  target: string | number;
  type: string; // "e2s" | "s2s" | "e2e" | "s2e"
}

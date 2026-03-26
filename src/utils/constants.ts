import { IssueType, TaskStatus, Priority } from '../types/task';

export const ISSUE_TYPE_COLORS: Record<IssueType, string> = {
  epic: '#6B46C1',
  story: '#2D9CDB',
  task: '#0065FF',
  subtask: '#00B8D9',
  bug: '#DE350B',
};

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  epic: 'Epic',
  story: 'Story',
  task: 'Task',
  subtask: 'Subtask',
  bug: 'Bug',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#DFE1E6',
  in_progress: '#0065FF',
  in_review: '#FF991F',
  done: '#36B37E',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  highest: 'Highest',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  lowest: 'Lowest',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  highest: '#CD1316',
  high: '#E44D42',
  medium: '#E97F33',
  low: '#2D8738',
  lowest: '#57A55A',
};

export const ZOOM_LEVELS = ['day', 'week', 'month'] as const;
export type ZoomLevel = typeof ZOOM_LEVELS[number];

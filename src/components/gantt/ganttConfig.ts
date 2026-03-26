import { ZoomLevel } from '../../utils/constants';

export const GANTT_COLUMNS = [
  {
    id: 'text',
    header: 'Task',
    width: 240,
    flexgrow: 1,
    tree: true,
  },
  {
    id: 'issueKey',
    header: 'Key',
    width: 80,
    align: 'center',
  },
  {
    id: 'assignee',
    header: 'Assignee',
    width: 110,
  },
  {
    id: 'status',
    header: 'Status',
    width: 95,
  },
];

export const SCALE_CONFIGS: Record<ZoomLevel, { unit: string; step: number; format: string }[]> = {
  day: [
    { unit: 'month', step: 1, format: 'MMMM yyyy' },
    { unit: 'day', step: 1, format: 'd' },
  ],
  week: [
    { unit: 'month', step: 1, format: 'MMMM yyyy' },
    { unit: 'week', step: 1, format: "'W'w" },
  ],
  month: [
    { unit: 'year', step: 1, format: 'yyyy' },
    { unit: 'month', step: 1, format: 'MMM' },
  ],
};

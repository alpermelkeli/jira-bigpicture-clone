import { useRef, useMemo } from 'react';
import { Gantt } from 'wx-react-gantt';
import 'wx-react-gantt/dist/gantt.css';
import { useTaskStore } from '../../store/taskStore';
import { useUiStore } from '../../store/uiStore';
import { Task } from '../../types/task';
import { STATUS_LABELS } from '../../utils/constants';
import { toDate } from '../../utils/dates';
import { GANTT_COLUMNS, SCALE_CONFIGS } from './ganttConfig';
import { useGanttEvents } from '../../hooks/useGanttEvents';

function taskToGanttTask(task: Task) {
  const start = toDate(task.startDate);
  const end = toDate(task.endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerDay));

  return {
    id: task.id,
    text: `[${task.issueKey}] ${task.summary}`,
    start,
    end,
    duration,
    progress: task.progress,
    type: task.children.length > 0 ? 'summary' : 'task',
    parent: task.parentId ?? 0,
    open: task.children.length > 0,
    lazy: false,
    // extra columns shown in the grid
    issueKey: task.issueKey,
    status: STATUS_LABELS[task.status],
    assignee: task.assignee,
  };
}

export function GanttChart() {
  const { tasks, links, selectedTaskId } = useTaskStore();
  const { theme, zoomLevel } = useUiStore();

  const apiRef = useRef<any>(null);
  useGanttEvents(apiRef);

  const ganttTasks = useMemo(
    () => Object.values(tasks || {}).map(taskToGanttTask),
    [tasks]
  );
  const scales = SCALE_CONFIGS[zoomLevel] || SCALE_CONFIGS.week;

  const wxThemeClass = theme === 'dark' ? 'wx-willow-dark-theme' : 'wx-willow-theme';

  return (
    <div
      className={`h-full w-full ${wxThemeClass}`}
    >
      <Gantt
        api={apiRef}
        tasks={ganttTasks}
        links={links || []}
        scales={scales}
        columns={GANTT_COLUMNS}
        selected={selectedTaskId ? [selectedTaskId] : []}
        cellHeight={36}
        scaleHeight={52}
      />
    </div>
  );
}

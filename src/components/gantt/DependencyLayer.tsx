import { parseISO, differenceInDays } from 'date-fns';
import { GanttLink } from '../../types/gantt';
import { Task } from '../../types/task';
import { FlatTask, ROW_HEIGHT, dateToX } from './utils/ganttLayout';

interface Props {
  links: GanttLink[];
  flatTasks: FlatTask[];
  rangeStart: Date;
  pxPerDay: number;
  totalWidth: number;
  totalHeight: number;
}

export function DependencyLayer({ links, flatTasks, rangeStart, pxPerDay, totalWidth, totalHeight }: Props) {
  const rowMap = new Map<string, number>();
  flatTasks.forEach(({ task }, idx) => rowMap.set(task.id, idx));

  const arrows = links.flatMap((link) => {
    const srcIdx = rowMap.get(String(link.source));
    const tgtIdx = rowMap.get(String(link.target));
    if (srcIdx == null || tgtIdx == null) return [];

    const srcTask = flatTasks[srcIdx].task;
    const tgtTask = flatTasks[tgtIdx].task;

    const srcEnd = srcTask.endDate ? parseISO(srcTask.endDate) : new Date();
    const tgtStart = tgtTask.startDate ? parseISO(tgtTask.startDate) : new Date();

    const x1 = dateToX(srcEnd, rangeStart, pxPerDay);
    const x2 = dateToX(tgtStart, rangeStart, pxPerDay);
    const y1 = srcIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
    const y2 = tgtIdx * ROW_HEIGHT + ROW_HEIGHT / 2;

    const step = 14;
    const isForward = x2 >= x1 + step * 2;
    let d: string;

    if (isForward) {
      // Simple L-shaped path
      d = `M ${x1} ${y1} H ${x1 + step} V ${y2} H ${x2}`;
    } else {
      // Route around: go right a bit, up/down past the rows, then come in from left
      const mid = Math.min(x1, x2) - step;
      d = `M ${x1} ${y1} H ${x1 + step} V ${y2 < y1 ? y1 - ROW_HEIGHT * 0.7 : y1 + ROW_HEIGHT * 0.7} H ${mid} V ${y2} H ${x2}`;
    }

    return [{ id: link.id, d, x2, y2 }];
  });

  if (!arrows.length) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: totalWidth,
        height: totalHeight,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible',
      }}
    >
      <defs>
        <marker
          id="dep-arrow"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" opacity="0.7" />
        </marker>
      </defs>
      {arrows.map((a) => (
        <path
          key={String(a.id)}
          d={a.d}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          strokeDasharray="none"
          markerEnd="url(#dep-arrow)"
        />
      ))}
    </svg>
  );
}

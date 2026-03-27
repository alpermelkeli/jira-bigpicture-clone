import {
  differenceInDays, addDays, format,
  startOfMonth, getDaysInMonth,
  startOfWeek, getWeek, getYear,
  eachMonthOfInterval, eachWeekOfInterval,
} from 'date-fns';
import { Task } from '../../../types/task';
import { ZoomLevel } from '../../../utils/constants';

export const ROW_HEIGHT = 40;
export const HEADER_HEIGHT = 56;
export const TREE_WIDTH = 380;

export const PX_PER_DAY: Record<ZoomLevel, number> = {
  day: 48,
  week: 22,
  month: 7,
};

export interface FlatTask {
  task: Task;
  depth: number;
}

/** Ordered flat list respecting tree structure and collapse state */
export function flattenTasks(
  tasks: Record<string, Task>,
  collapsed: Set<string>
): FlatTask[] {
  const result: FlatTask[] = [];

  const visit = (task: Task, depth: number) => {
    result.push({ task, depth });
    if (!collapsed.has(task.id)) {
      task.children
        .map((id) => tasks[id])
        .filter(Boolean)
        .forEach((child) => visit(child, depth + 1));
    }
  };

  Object.values(tasks)
    .filter((t) => t.parentId === null)
    .sort((a, b) => +new Date(a.startDate ?? 0) - +new Date(b.startDate ?? 0))
    .forEach((t) => visit(t, 0));

  return result;
}

/** Minimum total range days per zoom level so the timeline never feels empty */
const MIN_RANGE_DAYS: Record<ZoomLevel, number> = {
  day: 90,   // ~3 months
  week: 210, // ~7 months
  month: 548, // ~18 months
};

/** Compute a comfortable date range that covers all tasks with a zoom-aware minimum */
export function getTimelineRange(tasks: Task[], zoom: ZoomLevel = 'week'): { start: Date; end: Date } {
  const dates = tasks
    .flatMap((t) => [t.startDate, t.endDate])
    .filter((d): d is string => !!d)
    .map((d) => new Date(d));

  const minDays = MIN_RANGE_DAYS[zoom];

  if (!dates.length) {
    const now = new Date();
    return { start: addDays(now, -Math.floor(minDays / 4)), end: addDays(now, Math.ceil(minDays * 3 / 4)) };
  }

  const min = new Date(Math.min(...dates.map((d) => d.getTime())));
  const max = new Date(Math.max(...dates.map((d) => d.getTime())));

  const padStart = addDays(min, -14);
  const padEnd = addDays(max, 28);

  // Ensure minimum range width
  const currentDays = differenceInDays(padEnd, padStart);
  if (currentDays < minDays) {
    const extra = minDays - currentDays;
    return { start: padStart, end: addDays(padEnd, extra) };
  }

  return { start: padStart, end: padEnd };
}

export function dateToX(date: Date, rangeStart: Date, pxPerDay: number): number {
  return differenceInDays(date, rangeStart) * pxPerDay;
}

export function xToDate(x: number, rangeStart: Date, pxPerDay: number): Date {
  return addDays(rangeStart, Math.round(x / pxPerDay));
}

// ─── Header column generation ──────────────────────────────────────────────

export interface HeaderCell {
  label: string;
  x: number;
  width: number;
  isWeekend?: boolean;
}

export interface HeaderLevel {
  cells: HeaderCell[];
  height: number;
}

export function buildHeaderLevels(
  rangeStart: Date,
  rangeEnd: Date,
  zoom: ZoomLevel
): { top: HeaderLevel; bottom: HeaderLevel } {
  const ppd = PX_PER_DAY[zoom];

  if (zoom === 'month') {
    // Top: years, Bottom: months
    const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });

    const topMap: Record<number, { start: Date; end: Date }> = {};
    months.forEach((m) => {
      const y = getYear(m);
      if (!topMap[y]) topMap[y] = { start: m, end: m };
      else topMap[y].end = m;
    });

    const top: HeaderCell[] = Object.entries(topMap).map(([y, { start, end }]) => {
      const x = dateToX(start, rangeStart, ppd);
      const endX = dateToX(addDays(new Date(getYear(end), 11, 31), 1), rangeStart, ppd);
      return { label: y, x, width: endX - x };
    });

    const bottom: HeaderCell[] = months.map((m) => {
      const x = dateToX(m, rangeStart, ppd);
      const days = getDaysInMonth(m);
      return { label: format(m, 'MMM'), x, width: days * ppd };
    });

    return { top: { cells: top, height: 28 }, bottom: { cells: bottom, height: 28 } };
  }

  if (zoom === 'week') {
    // Top: months, Bottom: week numbers
    const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });
    const top: HeaderCell[] = months.map((m) => {
      const x = dateToX(m, rangeStart, ppd);
      return { label: format(m, 'MMM yyyy'), x, width: getDaysInMonth(m) * ppd };
    });

    const weeks = eachWeekOfInterval(
      { start: rangeStart, end: rangeEnd },
      { weekStartsOn: 1 }
    );
    const bottom: HeaderCell[] = weeks.map((w) => {
      const x = dateToX(w, rangeStart, ppd);
      return { label: `W${getWeek(w, { weekStartsOn: 1 })}`, x, width: 7 * ppd };
    });

    return { top: { cells: top, height: 28 }, bottom: { cells: bottom, height: 28 } };
  }

  // zoom === 'day'
  // Top: month + week label, Bottom: day numbers
  const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });
  const top: HeaderCell[] = months.map((m) => {
    const x = dateToX(m, rangeStart, ppd);
    return { label: format(m, 'MMMM yyyy'), x, width: getDaysInMonth(m) * ppd };
  });

  const totalDays = differenceInDays(rangeEnd, rangeStart) + 1;
  const bottom: HeaderCell[] = Array.from({ length: totalDays }, (_, i) => {
    const d = addDays(rangeStart, i);
    const dow = d.getDay();
    return {
      label: format(d, 'd'),
      x: i * ppd,
      width: ppd,
      isWeekend: dow === 0 || dow === 6,
    };
  });

  return { top: { cells: top, height: 28 }, bottom: { cells: bottom, height: 28 } };
}

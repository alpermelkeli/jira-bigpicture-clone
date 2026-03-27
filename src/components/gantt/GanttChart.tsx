import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { differenceInDays, format, isToday } from 'date-fns';
import { useTaskStore } from '../../store/taskStore';
import { useUiStore } from '../../store/uiStore';
import {
  flattenTasks, getTimelineRange, buildHeaderLevels, dateToX,
  ROW_HEIGHT, HEADER_HEIGHT, TREE_WIDTH, PX_PER_DAY,
} from './utils/ganttLayout';
import { TaskTree } from './TaskTree';
import { TaskBar } from './TaskBar';
import { DependencyLayer } from './DependencyLayer';

export function GanttChart() {
  const { tasks, links, selectedTaskId, selectTask, updateTask } = useTaskStore();
  const { zoomLevel } = useUiStore();

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const treeScrollRef = useRef<HTMLDivElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  const pxPerDay = PX_PER_DAY[zoomLevel];

  const flatTasks = useMemo(
    () => flattenTasks(tasks, collapsed),
    [tasks, collapsed]
  );

  const { start: rangeStart, end: rangeEnd } = useMemo(
    () => getTimelineRange(Object.values(tasks)),
    [tasks]
  );

  const totalDays = differenceInDays(rangeEnd, rangeStart) + 1;
  const totalTimelineWidth = totalDays * pxPerDay;
  const totalContentHeight = flatTasks.length * ROW_HEIGHT;

  const { top: topHeader, bottom: bottomHeader } = useMemo(
    () => buildHeaderLevels(rangeStart, rangeEnd, zoomLevel),
    [rangeStart, rangeEnd, zoomLevel]
  );

  const todayX = dateToX(new Date(), rangeStart, pxPerDay);

  // Scroll to today on mount / zoom change
  useEffect(() => {
    if (timelineScrollRef.current) {
      const viewWidth = timelineScrollRef.current.clientWidth;
      timelineScrollRef.current.scrollLeft = Math.max(0, todayX - viewWidth / 2);
    }
  }, [todayX, zoomLevel]);

  // Vertical scroll sync
  const handleTreeScroll = useCallback(() => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    requestAnimationFrame(() => {
      if (timelineScrollRef.current && treeScrollRef.current) {
        timelineScrollRef.current.scrollTop = treeScrollRef.current.scrollTop;
      }
      isSyncing.current = false;
    });
  }, []);

  const handleTimelineScroll = useCallback(() => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    requestAnimationFrame(() => {
      if (treeScrollRef.current && timelineScrollRef.current) {
        treeScrollRef.current.scrollTop = timelineScrollRef.current.scrollTop;
      }
      isSyncing.current = false;
    });
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((id: string) => {
    selectTask(id === selectedTaskId ? null : id);
  }, [selectTask, selectedTaskId]);

  const handleUpdateDates = useCallback((id: string, startDate: string, endDate: string) => {
    updateTask(id, { startDate, endDate });
  }, [updateTask]);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* ── Tree panel ─────────────────────────────────────────── */}
      <TaskTree
        flatTasks={flatTasks}
        collapsed={collapsed}
        selectedId={selectedTaskId}
        onToggle={toggleCollapse}
        onSelect={handleSelect}
        scrollRef={treeScrollRef as React.RefObject<HTMLDivElement>}
        onScroll={handleTreeScroll}
      />

      {/* ── Timeline panel ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Timeline scroll area (both x and y) */}
        <div
          ref={timelineScrollRef}
          onScroll={handleTimelineScroll}
          onClick={() => selectTask(null)}
          style={{ flex: 1, overflow: 'scroll', position: 'relative' }}
        >
          {/* Inner content — full width */}
          <div style={{ width: totalTimelineWidth, position: 'relative', minHeight: HEADER_HEIGHT + totalContentHeight }}>

            {/* ── Sticky header ──────────────────────────────── */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                height: HEADER_HEIGHT,
                zIndex: 20,
                background: 'var(--bg-header)',
                borderBottom: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              {/* Top row */}
              <div style={{ height: 28, position: 'relative', borderBottom: '1px solid var(--border)' }}>
                {topHeader.cells.map((cell, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: cell.x,
                      top: 0,
                      width: cell.width,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 10,
                      borderRight: '1px solid var(--border)',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {cell.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom row */}
              <div style={{ height: 28, position: 'relative' }}>
                {bottomHeader.cells.map((cell, i) => {
                  const isCurrentDay = zoomLevel === 'day' && (() => {
                    const d = new Date();
                    return format(d, 'd') === cell.label && Math.abs(cell.x - todayX) < pxPerDay;
                  })();
                  return (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: cell.x,
                        top: 0,
                        width: cell.width,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid var(--grid-line)',
                        background: cell.isWeekend ? 'var(--grid-line)' : isCurrentDay ? 'var(--today-soft)' : 'transparent',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: zoomLevel === 'day' ? 'var(--font-mono)' : 'var(--font-ui)',
                          fontWeight: isCurrentDay ? 700 : 400,
                          color: isCurrentDay ? 'var(--today)' : cell.isWeekend ? 'var(--text-faint)' : 'var(--text-muted)',
                        }}
                      >
                        {cell.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Content rows ───────────────────────────────── */}
            <div style={{ position: 'relative', height: totalContentHeight }}>

              {/* Grid background */}
              <GridBackground
                flatTasksCount={flatTasks.length}
                bottomCells={bottomHeader.cells}
                pxPerDay={pxPerDay}
                zoomLevel={zoomLevel}
                totalWidth={totalTimelineWidth}
              />

              {/* Today vertical line */}
              <div
                style={{
                  position: 'absolute',
                  left: todayX,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: 'var(--today)',
                  opacity: 0.6,
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
              {/* Today label */}
              <div
                style={{
                  position: 'absolute',
                  left: todayX + 3,
                  top: 4,
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--today)',
                  fontWeight: 600,
                  pointerEvents: 'none',
                  zIndex: 2,
                  opacity: 0.8,
                }}
              >
                TODAY
              </div>

              {/* Row highlights */}
              {flatTasks.map(({ task }, idx) => (
                <div
                  key={task.id}
                  style={{
                    position: 'absolute',
                    top: idx * ROW_HEIGHT,
                    left: 0,
                    right: 0,
                    height: ROW_HEIGHT,
                    background: task.id === selectedTaskId ? 'var(--bg-selected)' : 'transparent',
                    borderBottom: '1px solid var(--grid-line)',
                    transition: 'background 0.12s',
                  }}
                />
              ))}

              {/* Dependency arrows */}
              <DependencyLayer
                links={links}
                flatTasks={flatTasks}
                rangeStart={rangeStart}
                pxPerDay={pxPerDay}
                totalWidth={totalTimelineWidth}
                totalHeight={totalContentHeight}
              />

              {/* Task bars */}
              {flatTasks.map(({ task }, idx) => (
                <TaskBar
                  key={task.id}
                  task={task}
                  rowIdx={idx}
                  rangeStart={rangeStart}
                  pxPerDay={pxPerDay}
                  isSelected={task.id === selectedTaskId}
                  onSelect={() => handleSelect(task.id)}
                  onUpdate={(s, e) => handleUpdateDates(task.id, s, e)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Grid Background ────────────────────────────────────────────────────────

interface GridBgProps {
  flatTasksCount: number;
  bottomCells: { x: number; width: number; isWeekend?: boolean }[];
  pxPerDay: number;
  zoomLevel: string;
  totalWidth: number;
}

function GridBackground({ flatTasksCount, bottomCells, pxPerDay, zoomLevel, totalWidth }: GridBgProps) {
  const height = flatTasksCount * ROW_HEIGHT;
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: totalWidth, height, pointerEvents: 'none', zIndex: 0 }}
    >
      {/* Weekend / period shading */}
      {bottomCells
        .filter((c) => c.isWeekend)
        .map((c, i) => (
          <rect key={i} x={c.x} y={0} width={c.width} height={height} fill="var(--grid-line)" />
        ))}

      {/* Vertical period lines */}
      {bottomCells.map((c, i) => (
        <line
          key={`v-${i}`}
          x1={c.x}
          y1={0}
          x2={c.x}
          y2={height}
          stroke="var(--grid-line)"
          strokeWidth={zoomLevel === 'day' ? 1 : 1}
        />
      ))}
    </svg>
  );
}

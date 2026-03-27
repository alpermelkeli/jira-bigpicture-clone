import { useRef, useState, useEffect } from 'react';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';
import { Task } from '../../types/task';
import { ISSUE_TYPE_COLORS, STATUS_COLORS } from '../../utils/constants';
import { ROW_HEIGHT, dateToX } from './utils/ganttLayout';

interface Props {
  task: Task;
  rowIdx: number;
  rangeStart: Date;
  pxPerDay: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (startDate: string, endDate: string) => void;
}

type DragType = 'move' | 'resize-start' | 'resize-end';

export function TaskBar({ task, rowIdx, rangeStart, pxPerDay, isSelected, onSelect, onUpdate }: Props) {
  const toDate = (s: string | null) => (s ? parseISO(s) : new Date());
  const [localStart, setLocalStart] = useState(() => toDate(task.startDate));
  const [localEnd, setLocalEnd] = useState(() => toDate(task.endDate) );
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dragging = useRef(false);

  // Sync with store changes when not actively dragging
  useEffect(() => {
    if (!dragging.current) {
      setLocalStart(toDate(task.startDate));
      setLocalEnd(toDate(task.endDate));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.startDate, task.endDate]);

  const x = dateToX(localStart, rangeStart, pxPerDay);
  const width = Math.max(pxPerDay, differenceInDays(localEnd, localStart) * pxPerDay);
  const barTop = rowIdx * ROW_HEIGHT + 4;
  const barH = ROW_HEIGHT - 8;

  const color = ISSUE_TYPE_COLORS[task.issueType] ?? '#3B82F6';
  const statusColor = STATUS_COLORS[task.status];
  const isDone = task.status === 'done';
  const isEpic = task.issueType === 'epic';

  const startDrag = (type: DragType, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);

    const originX = e.clientX;
    const originStart = localStart;
    const originEnd = localEnd;
    let curStart = originStart;
    let curEnd = originEnd;

    const onMove = (ev: MouseEvent) => {
      const days = Math.round((ev.clientX - originX) / pxPerDay);
      if (type === 'move') {
        curStart = addDays(originStart, days);
        curEnd = addDays(originEnd, days);
        setLocalStart(curStart);
        setLocalEnd(curEnd);
      } else if (type === 'resize-start') {
        const ns = addDays(originStart, days);
        if (differenceInDays(originEnd, ns) >= 1) {
          curStart = ns;
          setLocalStart(curStart);
        }
      } else {
        const ne = addDays(originEnd, days);
        if (differenceInDays(ne, originStart) >= 1) {
          curEnd = ne;
          setLocalEnd(curEnd);
        }
      }
    };

    const onUp = () => {
      dragging.current = false;
      setIsDragging(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      onUpdate(format(curStart, 'yyyy-MM-dd'), format(curEnd, 'yyyy-MM-dd'));
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const barBg = isDone
    ? `linear-gradient(90deg, ${statusColor}aa 0%, ${statusColor}66 100%)`
    : isEpic
    ? `linear-gradient(135deg, ${color}ee 0%, ${color}99 100%)`
    : `linear-gradient(90deg, ${color}dd 0%, ${color}88 100%)`;

  return (
    <div style={{ position: 'absolute', left: x, top: barTop, width, height: barH, zIndex: isSelected ? 3 : isDragging ? 4 : 2 }}>
      {/* Bar body */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onMouseDown={(e) => startDrag('move', e)}
        style={{
          position: 'absolute', inset: 0,
          borderRadius: isEpic ? 5 : 3,
          background: barBg,
          border: `1px solid ${isSelected ? color : color + '55'}`,
          boxShadow: isSelected
            ? `0 0 0 2px ${color}33, 0 2px 8px ${color}44`
            : hovered ? `0 2px 8px ${color}33` : 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center',
          paddingLeft: 8, paddingRight: 8,
          transition: isDragging ? 'none' : 'box-shadow 0.15s',
        }}
      >
        {/* Progress fill */}
        {task.progress > 0 && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${task.progress}%`,
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
          }} />
        )}
        <span style={{
          fontSize: 11, fontWeight: 500,
          color: 'rgba(255,255,255,0.92)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          pointerEvents: 'none', position: 'relative', zIndex: 1,
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          letterSpacing: '0.01em',
        }}>
          {task.summary}
        </span>
      </div>

      {/* Resize handles — visible on hover/select */}
      {(hovered || isSelected) && !isDragging && (
        <>
          <div
            onMouseDown={(e) => startDrag('resize-start', e)}
            style={{
              position: 'absolute', left: 0, top: '15%', width: 5, height: '70%',
              background: 'rgba(255,255,255,0.75)', borderRadius: '2px 0 0 2px',
              cursor: 'ew-resize', zIndex: 5,
            }}
          />
          <div
            onMouseDown={(e) => startDrag('resize-end', e)}
            style={{
              position: 'absolute', right: 0, top: '15%', width: 5, height: '70%',
              background: 'rgba(255,255,255,0.75)', borderRadius: '0 2px 2px 0',
              cursor: 'ew-resize', zIndex: 5,
            }}
          />
        </>
      )}

      {/* Drag date tooltip */}
      {isDragging && (
        <div style={{
          position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-header)', border: '1px solid var(--border)',
          borderRadius: 5, padding: '2px 8px',
          fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text)',
          whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {format(localStart, 'MMM d')} → {format(localEnd, 'MMM d')}
        </div>
      )}
    </div>
  );
}

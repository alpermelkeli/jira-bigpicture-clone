import { ChevronRight, ChevronDown } from 'lucide-react';
import { FlatTask, ROW_HEIGHT, HEADER_HEIGHT, TREE_WIDTH } from './utils/ganttLayout';
import { ISSUE_TYPE_COLORS, ISSUE_TYPE_LABELS, STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';
import { Task } from '../../types/task';

interface Props {
  flatTasks: FlatTask[];
  collapsed: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
}

const ISSUE_TYPE_ICONS: Record<string, string> = {
  epic: '◆',
  story: '▣',
  task: '☑',
  subtask: '⊡',
  bug: '⬟',
};

function IssueTypeDot({ type }: { type: string }) {
  const color = ISSUE_TYPE_COLORS[type as keyof typeof ISSUE_TYPE_COLORS] ?? '#8B949E';
  const icon = ISSUE_TYPE_ICONS[type] ?? '○';
  return (
    <span
      style={{ color, fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1 }}
      title={ISSUE_TYPE_LABELS[type as keyof typeof ISSUE_TYPE_LABELS] ?? type}
    >
      {icon}
    </span>
  );
}

function StatusPill({ status }: { status: Task['status'] }) {
  const bg = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  return (
    <span
      style={{
        background: bg + '22',
        color: bg,
        border: `1px solid ${bg}44`,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.03em',
        padding: '1px 6px',
        borderRadius: 3,
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {label}
    </span>
  );
}

export function TaskTree({ flatTasks, collapsed, selectedId, onToggle, onSelect, scrollRef, onScroll }: Props) {
  const totalHeight = flatTasks.length * ROW_HEIGHT;

  return (
    <div
      style={{
        width: TREE_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-panel)',
        flexShrink: 0,
        zIndex: 2,
      }}
    >
      {/* Header columns */}
      <div
        style={{
          height: HEADER_HEIGHT,
          background: 'var(--bg-header)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 12px 0 0',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingBottom: 8, paddingLeft: 12, gap: 0 }}>
          <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Task
          </span>
          <span style={{ width: 80, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'right' }}>
            Assignee
          </span>
          <span style={{ width: 90, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'right' }}>
            Status
          </span>
        </div>
      </div>

      {/* Scrollable rows */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          flex: 1,
          overflowY: 'scroll',
          overflowX: 'hidden',
        }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {flatTasks.map(({ task, depth }, idx) => {
            const hasChildren = task.children.length > 0;
            const isCollapsed = collapsed.has(task.id);
            const isSelected = task.id === selectedId;
            const y = idx * ROW_HEIGHT;
            const typeColor = ISSUE_TYPE_COLORS[task.issueType] ?? '#8B949E';

            return (
              <div
                key={task.id}
                onClick={() => onSelect(task.id)}
                style={{
                  position: 'absolute',
                  top: y,
                  left: 0,
                  right: 0,
                  height: ROW_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 12 + depth * 20,
                  paddingRight: 12,
                  cursor: 'pointer',
                  background: isSelected ? 'var(--bg-selected)' : 'transparent',
                  borderBottom: '1px solid var(--grid-line)',
                  transition: 'background 0.12s',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = isSelected ? 'var(--bg-selected)' : 'transparent';
                }}
              >
                {/* Collapse toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(task.id); }}
                  style={{
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: 'none',
                    border: 'none',
                    cursor: hasChildren ? 'pointer' : 'default',
                    color: hasChildren ? 'var(--text-muted)' : 'transparent',
                    padding: 0,
                    marginRight: 4,
                    borderRadius: 3,
                    transition: 'color 0.1s',
                  }}
                >
                  {hasChildren ? (
                    isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />
                  ) : null}
                </button>

                {/* Left accent bar */}
                <div
                  style={{
                    width: 3,
                    height: 20,
                    borderRadius: 2,
                    background: typeColor,
                    flexShrink: 0,
                    marginRight: 7,
                    opacity: 0.8,
                  }}
                />

                {/* Type icon */}
                <IssueTypeDot type={task.issueType} />

                {/* Issue key */}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-faint)',
                    marginLeft: 6,
                    marginRight: 7,
                    flexShrink: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {task.issueKey}
                </span>

                {/* Summary */}
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: task.issueType === 'epic' ? 600 : 400,
                    color: isSelected ? 'var(--accent)' : 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}
                >
                  {task.summary}
                </span>

                {/* Assignee */}
                <span
                  style={{
                    width: 80,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    textAlign: 'right',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                  title={task.assignee}
                >
                  {task.assignee ? task.assignee.split(' ')[0] : '—'}
                </span>

                {/* Status */}
                <div style={{ width: 90, display: 'flex', justifyContent: 'flex-end', flexShrink: 0, marginLeft: 4 }}>
                  <StatusPill status={task.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

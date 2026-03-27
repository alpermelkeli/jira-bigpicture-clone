import { ZoomIn, ZoomOut, Sun, Moon, Plus, LayoutTemplate } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';
import { ZOOM_LEVELS, ZoomLevel } from '../../utils/constants';

const ZOOM_LABELS: Record<ZoomLevel, string> = { day: 'Day', week: 'Week', month: 'Month' };

export function Header() {
  const { theme, toggleTheme, zoomLevel, setZoomLevel, openAddTaskModal } = useUiStore();
  const taskCount = useTaskStore((s) => Object.keys(s.tasks).length);
  const idx = ZOOM_LEVELS.indexOf(zoomLevel);

  return (
    <header
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--bg-header)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        zIndex: 30,
        gap: 12,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <LayoutTemplate size={18} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          BigPicture
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono)',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '1px 6px',
          }}
        >
          {taskCount} items
        </span>
      </div>

      {/* Zoom controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '3px',
        }}
      >
        <button
          onClick={() => idx > 0 && setZoomLevel(ZOOM_LEVELS[idx - 1])}
          disabled={idx === 0}
          style={iconBtnStyle(idx === 0)}
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>

        {ZOOM_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => setZoomLevel(level)}
            style={{
              padding: '4px 12px',
              borderRadius: 5,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'var(--font-ui)',
              background: zoomLevel === level ? 'var(--accent)' : 'transparent',
              color: zoomLevel === level ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {ZOOM_LABELS[level]}
          </button>
        ))}

        <button
          onClick={() => idx < ZOOM_LEVELS.length - 1 && setZoomLevel(ZOOM_LEVELS[idx + 1])}
          disabled={idx === ZOOM_LEVELS.length - 1}
          style={iconBtnStyle(idx === ZOOM_LEVELS.length - 1)}
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={openAddTaskModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            letterSpacing: '-0.01em',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          <Plus size={15} />
          Add Task
        </button>

        <button
          onClick={toggleTheme}
          style={iconBtnStyle(false)}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark'
            ? <Sun size={16} style={{ color: '#F59E0B' }} />
            : <Moon size={16} style={{ color: 'var(--text-muted)' }} />}
        </button>
      </div>
    </header>
  );
}

function iconBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    border: 'none',
    background: 'transparent',
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    color: 'var(--text-muted)',
    transition: 'background 0.12s',
  };
}

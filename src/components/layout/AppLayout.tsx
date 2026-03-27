import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Header } from './Header';
import { GanttChart } from '../gantt/GanttChart';
import { TaskDetailPanel } from '../task/TaskDetailPanel';
import { TaskForm } from '../task/TaskForm';
import { useUiStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';

export function AppLayout() {
  const { theme, applyTheme, detailPanelOpen, addTaskModalOpen, openDetailPanel, closeDetailPanel } = useUiStore();
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId);

  // Apply persisted theme on mount
  useEffect(() => {
    applyTheme(theme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open/close detail panel based on selection
  useEffect(() => {
    if (selectedTaskId) openDetailPanel();
    else closeDetailPanel();
  }, [selectedTaskId, openDetailPanel, closeDetailPanel]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <Header />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Main Gantt */}
        <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <GanttChart />
        </div>

        {/* Detail panel */}
        <div
          style={{
            width: detailPanelOpen && selectedTaskId ? 320 : 0,
            flexShrink: 0,
            borderLeft: detailPanelOpen && selectedTaskId ? '1px solid var(--border)' : 'none',
            background: 'var(--bg-panel)',
            overflowY: 'auto',
            overflowX: 'hidden',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {detailPanelOpen && selectedTaskId && <TaskDetailPanel taskId={selectedTaskId} />}
        </div>
      </div>

      {addTaskModalOpen && <TaskForm />}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Header } from './Header';
import { GanttChart } from '../gantt/GanttChart';
import { TaskDetailPanel } from '../task/TaskDetailPanel';
import { TaskForm } from '../task/TaskForm';
import { useUiStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';

export function AppLayout() {
  const { detailPanelOpen, addTaskModalOpen } = useUiStore();
  const selectedTaskId = useTaskStore(s => s.selectedTaskId);

  // Open detail panel when a task is selected
  const { openDetailPanel, closeDetailPanel } = useUiStore();
  useEffect(() => {
    if (selectedTaskId) {
      openDetailPanel();
    } else {
      closeDetailPanel();
    }
  }, [selectedTaskId, openDetailPanel, closeDetailPanel]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Main Gantt area */}
        <div className="flex-1 overflow-hidden relative">
          <GanttChart />
        </div>

        {/* Detail panel */}
        <div
          className={`shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300 overflow-y-auto ${
            detailPanelOpen && selectedTaskId ? 'w-80' : 'w-0'
          }`}
        >
          {detailPanelOpen && selectedTaskId && <TaskDetailPanel taskId={selectedTaskId} />}
        </div>
      </div>

      {/* Add task modal */}
      {addTaskModalOpen && <TaskForm />}

      <Toaster position="bottom-right" richColors />
    </div>
  );
}

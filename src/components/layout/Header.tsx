import { ZoomIn, ZoomOut, Plus, Layout } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';
import { ZOOM_LEVELS, ZoomLevel } from '../../utils/constants';

const ZOOM_ICONS: Record<ZoomLevel, string> = {
  day: 'D',
  week: 'W',
  month: 'M',
};

export function Header() {
  const { zoomLevel, setZoomLevel, openAddTaskModal } = useUiStore();
  const { tasks } = useTaskStore();
  const taskCount = Object.keys(tasks).length;

  const currentIdx = ZOOM_LEVELS.indexOf(zoomLevel);

  const zoomIn = () => {
    if (currentIdx > 0) setZoomLevel(ZOOM_LEVELS[currentIdx - 1]);
  };
  const zoomOut = () => {
    if (currentIdx < ZOOM_LEVELS.length - 1) setZoomLevel(ZOOM_LEVELS[currentIdx + 1]);
  };

  return (
    <header className="flex items-center justify-between px-4 h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0 z-10">
      {/* Left: Brand */}
      <div className="flex items-center gap-2">
        <Layout size={20} className="text-blue-600 dark:text-blue-400" />
        <span className="font-semibold text-gray-900 dark:text-white text-sm">
          BigPicture
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
          {taskCount} items
        </span>
      </div>

      {/* Center: Zoom controls */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
        <button
          onClick={zoomIn}
          disabled={currentIdx === 0}
          className="p-1 rounded hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} className="text-gray-600 dark:text-gray-300" />
        </button>

        {ZOOM_LEVELS.map(level => (
          <button
            key={level}
            onClick={() => setZoomLevel(level)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              zoomLevel === level
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {ZOOM_ICONS[level]}
          </button>
        ))}

        <button
          onClick={zoomOut}
          disabled={currentIdx === ZOOM_LEVELS.length - 1}
          className="p-1 rounded hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={openAddTaskModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>
    </header>
  );
}

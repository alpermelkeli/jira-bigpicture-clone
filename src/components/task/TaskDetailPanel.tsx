import { useState } from 'react';
import { X, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTaskStore } from '../../store/taskStore';
import { useUiStore } from '../../store/uiStore';
import {
  ISSUE_TYPE_COLORS,
  ISSUE_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '../../utils/constants';
import { formatDate } from '../../utils/dates';
import { TaskStatus, Priority, IssueType } from '../../types/task';

interface Props {
  taskId: string;
}

export function TaskDetailPanel({ taskId }: Props) {
  const task = useTaskStore(s => s.tasks[taskId]);
  const { updateTask, deleteTask, selectTask, tasks } = useTaskStore();
  const { closeDetailPanel } = useUiStore();
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState('');

  if (!task) return null;

  const parentTask = task.parentId ? tasks[task.parentId] : null;
  const childTasks = task.children.map(cid => tasks[cid]).filter(Boolean);

  const handleClose = () => {
    selectTask(null);
    closeDetailPanel();
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${task.summary}"? This will also delete all child tasks.`)) return;
    deleteTask(task.id);
    handleClose();
    toast.success('Task deleted');
  };

  const startEditSummary = () => {
    setSummaryDraft(task.summary);
    setEditingSummary(true);
  };

  const saveSummary = () => {
    if (summaryDraft.trim()) {
      updateTask(task.id, { summary: summaryDraft.trim() });
      toast.success('Task updated');
    }
    setEditingSummary(false);
  };

  const typeColor = ISSUE_TYPE_COLORS[task.issueType];

  return (
    <div className="flex flex-col h-full text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded text-white text-xs font-medium"
            style={{ backgroundColor: typeColor }}
          >
            {ISSUE_TYPE_LABELS[task.issueType]}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{task.issueKey}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleDelete} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
          <button onClick={handleClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Summary */}
        <div>
          {editingSummary ? (
            <input
              autoFocus
              value={summaryDraft}
              onChange={e => setSummaryDraft(e.target.value)}
              onBlur={saveSummary}
              onKeyDown={e => { if (e.key === 'Enter') saveSummary(); if (e.key === 'Escape') setEditingSummary(false); }}
              className="w-full text-base font-semibold bg-transparent border-b-2 border-blue-500 outline-none text-gray-900 dark:text-white pb-1"
            />
          ) : (
            <h3
              className="text-base font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={startEditSummary}
              title="Click to edit"
            >
              {task.summary}
            </h3>
          )}
        </div>

        {/* Status + Priority row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">Status</label>
            <select
              value={task.status}
              onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
              className="w-full text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1.5"
            >
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">Priority</label>
            <select
              value={task.priority}
              onChange={e => updateTask(task.id, { priority: e.target.value as Priority })}
              className="w-full text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1.5"
            >
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map(p => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">Assignee</label>
          <input
            type="text"
            value={task.assignee}
            onChange={e => updateTask(task.id, { assignee: e.target.value })}
            className="w-full text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1.5"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">Start Date</label>
            <input
              type="date"
              value={task.startDate ?? ''}
              onChange={e => updateTask(task.id, { startDate: e.target.value })}
              className="w-full text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">End Date</label>
            <input
              type="date"
              value={task.endDate ?? ''}
              onChange={e => updateTask(task.id, { endDate: e.target.value })}
              className="w-full text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1.5"
            />
          </div>
        </div>

        {/* Progress */}
        <div>
          <label className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
            Progress — {task.progress}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={task.progress}
            onChange={e => updateTask(task.id, { progress: Number(e.target.value) })}
            className="w-full accent-blue-600"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">Description</label>
          <textarea
            value={task.description}
            onChange={e => updateTask(task.id, { description: e.target.value })}
            rows={3}
            placeholder="Add a description..."
            className="w-full text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1.5 resize-none"
          />
        </div>

        {/* Parent */}
        {parentTask && (
          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">Parent</label>
            <button
              onClick={() => { selectTask(parentTask.id); }}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span
                className="px-1.5 py-0.5 rounded text-white text-xs"
                style={{ backgroundColor: ISSUE_TYPE_COLORS[parentTask.issueType] }}
              >
                {parentTask.issueKey}
              </span>
              {parentTask.summary}
              <ChevronRight size={12} />
            </button>
          </div>
        )}

        {/* Children */}
        {childTasks.length > 0 && (
          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
              Child Tasks ({childTasks.length})
            </label>
            <div className="space-y-1">
              {childTasks.map(child => (
                <button
                  key={child.id}
                  onClick={() => selectTask(child.id)}
                  className="w-full flex items-center gap-2 text-left text-xs px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[child.status] }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 truncate">{child.summary}</span>
                  <ChevronRight size={12} className="ml-auto text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1">
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>Created</span>
            <span>{formatDate(task.createdAt)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>Updated</span>
            <span>{formatDate(task.updatedAt)}</span>
          </div>
          {task.reporter && (
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
              <span>Reporter</span>
              <span>{task.reporter}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

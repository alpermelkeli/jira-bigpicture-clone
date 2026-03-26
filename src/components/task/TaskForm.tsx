import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../shared/Modal';
import { useTaskStore } from '../../store/taskStore';
import { useUiStore } from '../../store/uiStore';
import { ISSUE_TYPE_LABELS, PRIORITY_LABELS } from '../../utils/constants';
import { IssueType, Priority } from '../../types/task';
import { today, addDaysToStr } from '../../utils/dates';

export function TaskForm() {
  const { closeAddTaskModal } = useUiStore();
  const { addTask, tasks, selectedTaskId } = useTaskStore();

  const [summary, setSummary] = useState('');
  const [issueType, setIssueType] = useState<IssueType>('task');
  const [priority, setPriority] = useState<Priority>('medium');
  const [parentId, setParentId] = useState<string>(selectedTaskId ?? '');
  const [assignee, setAssignee] = useState('');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(addDaysToStr(today(), 7));

  // Available parent tasks (non-subtasks can have parent)
  const parentOptions = Object.values(tasks).filter(
    t => t.issueType === 'epic' || t.issueType === 'story' || t.issueType === 'task'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    addTask({
      summary: summary.trim(),
      issueType,
      priority,
      assignee,
      parentId: parentId || null,
      startDate,
      endDate,
    });

    toast.success(`"${summary.trim()}" created`);
    closeAddTaskModal();
  };

  const inputClass =
    'w-full text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const labelClass = 'text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1';

  return (
    <Modal title="Create Task" onClose={closeAddTaskModal}>
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        {/* Summary */}
        <div>
          <label className={labelClass}>Summary *</label>
          <input
            autoFocus
            type="text"
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="Task summary..."
            className={inputClass}
            required
          />
        </div>

        {/* Type + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Issue Type</label>
            <select
              value={issueType}
              onChange={e => setIssueType(e.target.value as IssueType)}
              className={inputClass}
            >
              {(Object.keys(ISSUE_TYPE_LABELS) as IssueType[]).map(t => (
                <option key={t} value={t}>{ISSUE_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className={inputClass}
            >
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map(p => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Parent Task */}
        <div>
          <label className={labelClass}>Parent Task (optional)</label>
          <select
            value={parentId}
            onChange={e => setParentId(e.target.value)}
            className={inputClass}
          >
            <option value="">— No parent (root level) —</option>
            {parentOptions.map(t => (
              <option key={t.id} value={t.id}>
                [{t.issueKey}] {t.summary}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className={labelClass}>Assignee</label>
          <input
            type="text"
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
            placeholder="Name..."
            className={inputClass}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={closeAddTaskModal}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
}

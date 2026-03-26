import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, IssueType, TaskStatus, Priority } from '../types/task';
import { GanttLink } from '../types/gantt';
import { MOCK_TASKS, MOCK_LINKS } from '../utils/mockData';
import { today, addDaysToStr } from '../utils/dates';

interface TaskState {
  tasks: Record<string, Task>;
  links: GanttLink[];
  selectedTaskId: string | null;

  // Selectors
  getRootTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
  getChildren: (id: string) => Task[];

  // Actions
  selectTask: (id: string | null) => void;
  addTask: (partial: Partial<Task> & { summary: string; issueType: IssueType }) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newParentId: string | null) => void;

  // Link actions
  addLink: (link: Omit<GanttLink, 'id'>) => void;
  deleteLink: (id: string | number) => void;

  // Import / reset
  loadMockData: () => void;
  clearAll: () => void;
}

const buildInitialState = () => {
  const tasks: Record<string, Task> = {};
  MOCK_TASKS.forEach(t => { tasks[t.id] = t; });
  return { tasks, links: MOCK_LINKS as GanttLink[] };
};

let linkCounter = 100;

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),
      selectedTaskId: null,

      getRootTasks: () => {
        const { tasks } = get();
        return Object.values(tasks).filter(t => t.parentId === null);
      },

      getTaskById: (id) => get().tasks[id],

      getChildren: (id) => {
        const { tasks } = get();
        const task = tasks[id];
        if (!task) return [];
        return task.children.map(cid => tasks[cid]).filter(Boolean);
      },

      selectTask: (id) => set({ selectedTaskId: id }),

      addTask: (partial) => {
        const id = `task-${Date.now()}`;
        const now = new Date().toISOString();
        const parentId = partial.parentId ?? null;
        const start = partial.startDate ?? today();
        const end = partial.endDate ?? addDaysToStr(start, 7);

        const newTask: Task = {
          id,
          issueKey: `BP-${Date.now().toString().slice(-4)}`,
          summary: partial.summary,
          description: partial.description ?? '',
          issueType: partial.issueType,
          status: partial.status ?? 'todo',
          priority: partial.priority ?? 'medium',
          assignee: partial.assignee ?? '',
          reporter: partial.reporter ?? '',
          startDate: start,
          endDate: end,
          progress: 0,
          parentId,
          children: [],
          labels: partial.labels ?? [],
          createdAt: now,
          updatedAt: now,
        };

        set(state => {
          const tasks = { ...state.tasks, [id]: newTask };
          if (parentId && tasks[parentId]) {
            tasks[parentId] = {
              ...tasks[parentId],
              children: [...tasks[parentId].children, id],
              updatedAt: now,
            };
          }
          return { tasks };
        });

        return id;
      },

      updateTask: (id, updates) => {
        set(state => {
          const task = state.tasks[id];
          if (!task) return state;
          return {
            tasks: {
              ...state.tasks,
              [id]: { ...task, ...updates, updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      deleteTask: (id) => {
        set(state => {
          const tasks = { ...state.tasks };
          const task = tasks[id];
          if (!task) return state;

          // Remove from parent's children list
          if (task.parentId && tasks[task.parentId]) {
            tasks[task.parentId] = {
              ...tasks[task.parentId],
              children: tasks[task.parentId].children.filter(cid => cid !== id),
            };
          }

          // Recursively delete children
          const deleteRecursive = (taskId: string) => {
            const t = tasks[taskId];
            if (!t) return;
            t.children.forEach(deleteRecursive);
            delete tasks[taskId];
          };
          deleteRecursive(id);

          // Remove related links
          const links = state.links.filter(
            l => l.source !== id && l.target !== id
          );

          return { tasks, links, selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId };
        });
      },

      moveTask: (id, newParentId) => {
        set(state => {
          const tasks = { ...state.tasks };
          const task = tasks[id];
          if (!task) return state;
          const now = new Date().toISOString();

          // Remove from old parent
          if (task.parentId && tasks[task.parentId]) {
            tasks[task.parentId] = {
              ...tasks[task.parentId],
              children: tasks[task.parentId].children.filter(cid => cid !== id),
              updatedAt: now,
            };
          }

          // Add to new parent
          if (newParentId && tasks[newParentId]) {
            tasks[newParentId] = {
              ...tasks[newParentId],
              children: [...tasks[newParentId].children, id],
              updatedAt: now,
            };
          }

          tasks[id] = { ...task, parentId: newParentId, updatedAt: now };
          return { tasks };
        });
      },

      addLink: (link) => {
        const id = `link-${++linkCounter}`;
        set(state => ({ links: [...state.links, { ...link, id }] }));
      },

      deleteLink: (id) => {
        set(state => ({ links: state.links.filter(l => l.id !== id) }));
      },

      loadMockData: () => {
        set(buildInitialState());
      },

      clearAll: () => {
        set({ tasks: {}, links: [], selectedTaskId: null });
      },
    }),
    {
      name: 'bigpicture-tasks',
      partialize: (state) => ({
        tasks: state.tasks,
        links: state.links,
      }),
    }
  )
);

// Convenience selectors
export const selectAllTasksSorted = (state: TaskState): Task[] => {
  const tasks = Object.values(state.tasks);

  const order: Record<string, number> = { epic: 0, story: 1, task: 1, bug: 1, subtask: 2 };
  const getDepth = (t: Task): number => {
    let depth = 0;
    let current = t;
    while (current.parentId) {
      const parent = state.tasks[current.parentId];
      if (!parent) break;
      current = parent;
      depth++;
    }
    return depth;
  };

  return tasks.sort((a, b) => {
    const depthDiff = getDepth(a) - getDepth(b);
    if (depthDiff !== 0) return depthDiff;
    return (order[a.issueType] ?? 1) - (order[b.issueType] ?? 1);
  });
};

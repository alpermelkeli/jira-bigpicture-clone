import { useEffect, MutableRefObject } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useUiStore } from '../store/uiStore';
import { toDateStr } from '../utils/dates';

interface GanttApi {
  on: (event: string, handler: (data: any) => void) => () => void;
  exec: (event: string, data?: any) => void;
  intercept: (event: string, handler: (data: any) => boolean) => () => void;
}

export function useGanttEvents(apiRef: MutableRefObject<GanttApi | null>) {
  const { updateTask, selectTask, addLink, deleteLink } = useTaskStore();
  const { openDetailPanel } = useUiStore();

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;


    const unsubscribers: (() => void)[] = [];

    const safeOn = (event: string, handler: (data: any) => void) => {
      try {
        return api.on(event, handler);
      } catch (e) {
        console.warn(`Gantt API not ready for event: ${event}`, e);
        return null;
      }
    };

    // Task selected in grid or timeline
    const unsub1 = safeOn('select-task', ({ id }: { id: string | number }) => {
      selectTask(String(id));
      openDetailPanel();
    });
    if (unsub1) unsubscribers.push(unsub1);

    // Prevent default editor popup by intercepting internal SVAR events
    if (api.intercept) {
      const unsubIntercept1 = api.intercept('show-editor', () => false); // Blocks default double-click editor
      unsubscribers.push(unsubIntercept1);

      // SVAR fires add-task when user presses Enter from the inline editor or clicks '+'.
      // We block it entirely here because we have dedicated Add Task buttons.
      const unsubIntercept2 = api.intercept('add-task', () => false);
      unsubscribers.push(unsubIntercept2);
    }

    // Task dates changed via drag/resize
    const unsub2 = safeOn('update-task', ({ id, task }: { id: string | number; task: any }) => {
      const updates: Record<string, any> = {};
      if (task.start) updates.startDate = toDateStr(task.start);
      if (task.end) updates.endDate = toDateStr(task.end);
      if (typeof task.progress === 'number') updates.progress = task.progress;
      if (task.text !== undefined) updates.summary = task.text;
      if (Object.keys(updates).length > 0) {
        updateTask(String(id), updates);
      }
    });
    if (unsub2) unsubscribers.push(unsub2);

    // Dependency link added
    const unsub3 = safeOn('add-link', ({ link }: { link: any }) => {
      addLink({
        source: String(link.source),
        target: String(link.target),
        type: link.type || 'e2s',
      });
    });
    if (unsub3) unsubscribers.push(unsub3);

    // Dependency link deleted
    const unsub4 = safeOn('delete-link', ({ id }: { id: string | number }) => {
      deleteLink(id);
    });
    if (unsub4) unsubscribers.push(unsub4);

    return () => {
      unsubscribers.forEach(fn => fn && fn());
    };
  }, [apiRef, updateTask, selectTask, addLink, deleteLink, openDetailPanel]);
}

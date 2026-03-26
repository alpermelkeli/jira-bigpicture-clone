import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ZoomLevel } from '../utils/constants';

interface UiState {
  theme: 'light' | 'dark';
  detailPanelOpen: boolean;
  addTaskModalOpen: boolean;
  zoomLevel: ZoomLevel;
  sidebarWidth: number;

  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  openDetailPanel: () => void;
  closeDetailPanel: () => void;
  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;
  setZoomLevel: (level: ZoomLevel) => void;
  setSidebarWidth: (w: number) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      detailPanelOpen: false,
      addTaskModalOpen: false,
      zoomLevel: 'week',
      sidebarWidth: 320,

      toggleTheme: () =>
        set(state => {
          const next = state.theme === 'light' ? 'dark' : 'light';
          // Apply to DOM
          if (next === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: next };
        }),

      setTheme: (theme) => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ theme });
      },

      openDetailPanel: () => set({ detailPanelOpen: true }),
      closeDetailPanel: () => set({ detailPanelOpen: false }),
      openAddTaskModal: () => set({ addTaskModalOpen: true }),
      closeAddTaskModal: () => set({ addTaskModalOpen: false }),
      setZoomLevel: (level) => set({ zoomLevel: level }),
      setSidebarWidth: (w) => set({ sidebarWidth: w }),
    }),
    {
      name: 'bigpicture-ui',
      partialize: (state) => ({ theme: state.theme, zoomLevel: state.zoomLevel, sidebarWidth: state.sidebarWidth }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ZoomLevel } from '../utils/constants';

interface UiState {
  theme: 'light' | 'dark';
  detailPanelOpen: boolean;
  addTaskModalOpen: boolean;
  zoomLevel: ZoomLevel;

  toggleTheme: () => void;
  applyTheme: (t: 'light' | 'dark') => void;
  openDetailPanel: () => void;
  closeDetailPanel: () => void;
  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;
  setZoomLevel: (level: ZoomLevel) => void;
}

const applyThemeToDom = (t: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', t === 'dark');
};

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      detailPanelOpen: false,
      addTaskModalOpen: false,
      zoomLevel: 'week',

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyThemeToDom(next);
        set({ theme: next });
      },
      applyTheme: (t) => {
        applyThemeToDom(t);
        set({ theme: t });
      },
      openDetailPanel: () => set({ detailPanelOpen: true }),
      closeDetailPanel: () => set({ detailPanelOpen: false }),
      openAddTaskModal: () => set({ addTaskModalOpen: true }),
      closeAddTaskModal: () => set({ addTaskModalOpen: false }),
      setZoomLevel: (level) => set({ zoomLevel: level }),
    }),
    {
      name: 'bigpicture-ui',
      partialize: (s) => ({ theme: s.theme, zoomLevel: s.zoomLevel }),
    }
  )
);

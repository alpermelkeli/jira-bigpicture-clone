import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ZoomLevel } from '../utils/constants';

interface UiState {
  detailPanelOpen: boolean;
  addTaskModalOpen: boolean;
  zoomLevel: ZoomLevel;
  sidebarWidth: number;

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
      detailPanelOpen: false,
      addTaskModalOpen: false,
      zoomLevel: 'week',
      sidebarWidth: 320,

      openDetailPanel: () => set({ detailPanelOpen: true }),
      closeDetailPanel: () => set({ detailPanelOpen: false }),
      openAddTaskModal: () => set({ addTaskModalOpen: true }),
      closeAddTaskModal: () => set({ addTaskModalOpen: false }),
      setZoomLevel: (level) => set({ zoomLevel: level }),
      setSidebarWidth: (w) => set({ sidebarWidth: w }),
    }),
    {
      name: 'bigpicture-ui',
      partialize: (state) => ({ zoomLevel: state.zoomLevel, sidebarWidth: state.sidebarWidth }),
    }
  )
);

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { TrackElement, ElementType, SpaceDefinition, HistoryEntry } from './types';

interface TrackStore {
  elements: TrackElement[];
  selectedId: string | null;
  space: SpaceDefinition | null;
  history: HistoryEntry[];
  historyIndex: number;
  addElement: (type: ElementType, x: number, y: number) => void;
  updateElement: (id: string, updates: Partial<TrackElement>) => void;
  removeElement: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  setSpace: (space: SpaceDefinition | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 100;

export const useTrackStore = create<TrackStore>((set, get) => {
  const pushHistory = () => {
    const { elements, space, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ elements: [...elements], space });
    
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    
    set({ 
      history: newHistory,
      historyIndex: newHistory.length - 1 
    });
  };

  return {
    elements: [],
    selectedId: null,
    space: null,
    history: [{ elements: [], space: null }],
    historyIndex: 0,

    addElement: (type, x, y) => {
      const element: TrackElement = {
        id: nanoid(),
        type,
        x,
        y,
        rotation: 0,
        width: type === 'berm' ? 100 : 80,
        height: type === 'berm' ? 100 : 40,
      };
      set((state) => ({ 
        elements: [...state.elements, element],
        selectedId: element.id 
      }));
      pushHistory();
    },

    updateElement: (id, updates) => {
      set((state) => ({
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        ),
      }));
      pushHistory();
    },

    removeElement: (id) => {
      set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
      }));
      pushHistory();
    },

    setSelectedId: (id) => set({ selectedId: id }),

    setSpace: (space) => {
      set({ space });
      pushHistory();
    },

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        const { elements, space } = history[newIndex];
        set({ 
          elements: [...elements],
          space,
          historyIndex: newIndex,
          selectedId: null
        });
      }
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        const { elements, space } = history[newIndex];
        set({ 
          elements: [...elements],
          space,
          historyIndex: newIndex,
          selectedId: null
        });
      }
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,
  };
});
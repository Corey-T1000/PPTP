export type ViewMode = 'top-down' | 'isometric';

export type ElementType = 'berm' | 'roller' | 'tabletop';

export interface TrackElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
}

export interface SpaceDefinition {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface DragState {
  isDragging: boolean;
  element: ElementType | null;
  startX: number;
  startY: number;
}

export type ControlHandle = 'rotate' | 'resize' | 'move' | null;

export type HistoryEntry = {
  elements: TrackElement[];
  space: SpaceDefinition | null;
};
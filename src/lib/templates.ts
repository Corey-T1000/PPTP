import { TrackElement, ElementType } from './types';

export interface TrackTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  minSpace: { width: number; height: number };
  elements: Omit<TrackElement, 'id'>[];
}

export const trackTemplates: TrackTemplate[] = [
  {
    id: 'basic-loop',
    name: 'Basic Loop',
    description: 'A simple loop with berms and rollers, perfect for beginners',
    difficulty: 'beginner',
    minSpace: { width: 1500, height: 1000 },
    elements: [
      {
        type: 'berm',
        x: -600,
        y: -300,
        rotation: 0,
        width: 120,
        height: 120,
      },
      {
        type: 'roller',
        x: -300,
        y: -300,
        rotation: 0,
        width: 80,
        height: 40,
      },
      {
        type: 'berm',
        x: 600,
        y: -300,
        rotation: 180,
        width: 120,
        height: 120,
      },
      {
        type: 'roller',
        x: 300,
        y: 300,
        rotation: 180,
        width: 80,
        height: 40,
      },
    ],
  },
  {
    id: 'flow-line',
    name: 'Flow Line',
    description: 'A flowing sequence of rollers and tabletops',
    difficulty: 'intermediate',
    minSpace: { width: 2000, height: 1200 },
    elements: [
      {
        type: 'roller',
        x: -800,
        y: 0,
        rotation: 0,
        width: 100,
        height: 50,
      },
      {
        type: 'tabletop',
        x: -400,
        y: 0,
        rotation: 0,
        width: 120,
        height: 60,
      },
      {
        type: 'roller',
        x: 0,
        y: 0,
        rotation: 0,
        width: 100,
        height: 50,
      },
      {
        type: 'tabletop',
        x: 400,
        y: 0,
        rotation: 0,
        width: 120,
        height: 60,
      },
      {
        type: 'roller',
        x: 800,
        y: 0,
        rotation: 0,
        width: 100,
        height: 50,
      },
    ],
  },
];

export interface LayoutPreferences {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: 'flow' | 'technical' | 'mixed';
  spaceWidth: number;
  spaceHeight: number;
}

export function generateLayoutSuggestion(
  preferences: LayoutPreferences
): TrackTemplate {
  // Find a suitable template based on preferences
  const template = trackTemplates.find(
    (t) =>
      t.difficulty === preferences.difficulty &&
      t.minSpace.width <= preferences.spaceWidth &&
      t.minSpace.height <= preferences.spaceHeight
  );

  if (!template) {
    // Create a basic suggestion if no template fits
    return {
      id: 'custom',
      name: 'Custom Layout',
      description: 'A custom layout based on your preferences',
      difficulty: preferences.difficulty,
      minSpace: {
        width: preferences.spaceWidth,
        height: preferences.spaceHeight,
      },
      elements: [
        {
          type: 'berm',
          x: -preferences.spaceWidth / 3,
          y: -preferences.spaceHeight / 3,
          rotation: 0,
          width: 120,
          height: 120,
        },
        {
          type: preferences.focus === 'technical' ? 'tabletop' : 'roller',
          x: 0,
          y: 0,
          rotation: 0,
          width: 100,
          height: 50,
        },
        {
          type: 'berm',
          x: preferences.spaceWidth / 3,
          y: preferences.spaceHeight / 3,
          rotation: 180,
          width: 120,
          height: 120,
        },
      ],
    };
  }

  return template;
}
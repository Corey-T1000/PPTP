import {
  CircleOff,
  Mountain,
  MountainSnow,
  Waves,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ElementType } from '@/lib/types';

const tools = [
  {
    name: 'Berm',
    icon: Waves,
    type: 'berm' as ElementType,
    description: 'Add a banked turn to your track',
  },
  {
    name: 'Roller',
    icon: Mountain,
    type: 'roller' as ElementType,
    description: 'Add a rolling bump for pumping',
  },
  {
    name: 'Tabletop',
    icon: MountainSnow,
    type: 'tabletop' as ElementType,
    description: 'Add a jump with a flat top',
  },
  {
    name: 'Clear',
    icon: CircleOff,
    type: null,
    description: 'Remove track elements',
  },
];

export function Sidebar() {
  const handleDragStart = (e: React.DragEvent, type: ElementType | null) => {
    if (!type) return;
    e.dataTransfer.setData('application/pumptrack', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-[50px] border-r bg-background flex flex-col items-center gap-2 py-2">
      {tools.map((tool) => (
        <Tooltip key={tool.name} delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              draggable={!!tool.type}
              onDragStart={(e) => handleDragStart(e, tool.type)}
            >
              <tool.icon className="h-5 w-5" />
              <span className="sr-only">{tool.name}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            <p className="font-semibold">{tool.name}</p>
            <p className="text-xs text-muted-foreground">{tool.description}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
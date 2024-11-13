import { Eye, Grid3X3, Undo2, Redo2, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ViewMode } from '@/lib/types';
import { useTrackStore } from '@/lib/store';
import { useState } from 'react';
import { TemplatesDialog } from './templates-dialog';

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function Toolbar({ viewMode, onViewModeChange }: ToolbarProps) {
  const { space, setSpace, undo, redo, canUndo, canRedo } = useTrackStore();
  const [dimensions, setDimensions] = useState({
    width: space?.width || 2000,
    height: space?.height || 1000,
  });

  const handleSpaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSpace({
      ...dimensions,
      x: -dimensions.width / 2,
      y: -dimensions.height / 2,
    });
  };

  return (
    <div className="border-b bg-background p-2 flex items-center gap-2">
      <Button 
        variant="outline" 
        size="icon"
        onClick={undo}
        disabled={!canUndo()}
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={redo}
        disabled={!canRedo()}
      >
        <Redo2 className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-2" />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Ruler className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Define Available Space</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSpaceSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  min="100"
                  value={dimensions.width}
                  onChange={(e) =>
                    setDimensions((prev) => ({
                      ...prev,
                      width: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="100"
                  value={dimensions.height}
                  onChange={(e) =>
                    setDimensions((prev) => ({
                      ...prev,
                      height: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Set Space
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Button variant="outline" size="icon">
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onViewModeChange('top-down')}>
            Top Down View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewModeChange('isometric')}>
            Isometric View
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="w-px h-6 bg-border mx-2" />
      <TemplatesDialog />
    </div>
  );
}
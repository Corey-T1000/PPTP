import { useState } from 'react';
import { nanoid } from 'nanoid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTrackStore } from '@/lib/store';
import {
  trackTemplates,
  generateLayoutSuggestion,
  LayoutPreferences,
} from '@/lib/templates';

export function TemplatesDialog() {
  const { space, setSpace, elements, selectedId } = useTrackStore();
  const [preferences, setPreferences] = useState<LayoutPreferences>({
    difficulty: 'beginner',
    focus: 'flow',
    spaceWidth: space?.width || 2000,
    spaceHeight: space?.height || 1000,
  });

  const handleApplyTemplate = (templateId: string) => {
    const template = trackTemplates.find((t) => t.id === templateId);
    if (!template) return;

    // Create space if it doesn't exist
    if (!space) {
      setSpace({
        width: template.minSpace.width,
        height: template.minSpace.height,
        x: -template.minSpace.width / 2,
        y: -template.minSpace.height / 2,
      });
    }

    // Add template elements with new IDs
    const newElements = template.elements.map((el) => ({
      ...el,
      id: nanoid(),
    }));

    useTrackStore.setState({ elements: newElements, selectedId: null });
  };

  const handleGenerateSuggestion = () => {
    const suggestion = generateLayoutSuggestion(preferences);
    
    // Create space if it doesn't exist
    if (!space) {
      setSpace({
        width: suggestion.minSpace.width,
        height: suggestion.minSpace.height,
        x: -suggestion.minSpace.width / 2,
        y: -suggestion.minSpace.height / 2,
      });
    }

    // Add suggested elements with new IDs
    const newElements = suggestion.elements.map((el) => ({
      ...el,
      id: nanoid(),
    }));

    useTrackStore.setState({ elements: newElements, selectedId: null });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Templates</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Track Templates & Suggestions</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4">Pre-built Templates</h3>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {trackTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 rounded-lg border hover:border-primary cursor-pointer"
                    onClick={() => handleApplyTemplate(template.id)}
                  >
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {template.difficulty}
                      </span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {template.minSpace.width}x{template.minSpace.height}cm
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Generate Custom Layout</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select
                  value={preferences.difficulty}
                  onValueChange={(value: any) =>
                    setPreferences((p) => ({ ...p, difficulty: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Track Focus</Label>
                <Select
                  value={preferences.focus}
                  onValueChange={(value: any) =>
                    setPreferences((p) => ({ ...p, focus: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flow">Flow</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={handleGenerateSuggestion}
              >
                Generate Layout
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
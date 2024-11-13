import { useEffect, useRef, useState } from 'react';
import { ViewMode, ElementType, ControlHandle } from '@/lib/types';
import { useTrackStore } from '@/lib/store';
import { drawTrackElement, toIsometric } from '@/lib/utils';

interface CanvasProps {
  viewMode: ViewMode;
}

export function Canvas({ viewMode }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { elements, selectedId, space, addElement, updateElement, setSelectedId } = useTrackStore();
  const [activeHandle, setActiveHandle] = useState<ControlHandle>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const isIsometric = viewMode === 'isometric';

  // Convert canvas coordinates to world coordinates
  const toWorldCoords = (canvasX: number, canvasY: number) => {
    if (!isIsometric) return { x: canvasX, y: canvasY };

    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    // Reverse isometric projection (approximate)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = canvasX - centerX;
    const dy = (canvasY - centerY) * 2; // Compensate for scale(1, 0.5)
    
    const x = (dx / Math.cos(Math.PI / 6) + dy * Math.sin(Math.PI / 6)) / 2;
    const y = (dy * Math.sin(Math.PI / 6) - dx / Math.cos(Math.PI / 6)) / 2;

    return { x, y };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('application/pumptrack') as ElementType;
    if (!elementType) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const { x, y } = toWorldCoords(canvasX, canvasY);

    // Snap to grid
    const gridSize = 20;
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;

    // Check if within space bounds
    if (space) {
      if (
        snappedX < space.x ||
        snappedX > space.x + space.width ||
        snappedY < space.y ||
        snappedY > space.y + space.height
      ) {
        return;
      }
    }

    addElement(elementType, snappedX, snappedY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isIsometric) return; // Disable editing in isometric view

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const { x, y } = toWorldCoords(canvasX, canvasY);

    // Check for control handle clicks first
    if (selectedId) {
      const element = elements.find((el) => el.id === selectedId);
      if (element) {
        const handle = getControlHandle(x, y, element);
        if (handle) {
          setActiveHandle(handle);
          setDragStart({ x: canvasX, y: canvasY });
          return;
        }
      }
    }

    // Check for element selection
    const clickedElement = elements
      .slice()
      .reverse()
      .find((el) => isPointInElement(x, y, el));

    setSelectedId(clickedElement?.id || null);
    if (clickedElement) {
      setActiveHandle('move');
      setDragStart({ x: canvasX, y: canvasY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!activeHandle || !dragStart || !selectedId || isIsometric) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const { x, y } = toWorldCoords(canvasX, canvasY);
    const { x: startX, y: startY } = toWorldCoords(dragStart.x, dragStart.y);

    const dx = x - startX;
    const dy = y - startY;

    const element = elements.find((el) => el.id === selectedId);
    if (!element) return;

    switch (activeHandle) {
      case 'move': {
        const gridSize = 20;
        let newX = Math.round((element.x + dx) / gridSize) * gridSize;
        let newY = Math.round((element.y + dy) / gridSize) * gridSize;

        // Constrain to space bounds
        if (space) {
          newX = Math.max(space.x, Math.min(space.x + space.width, newX));
          newY = Math.max(space.y, Math.min(space.y + space.height, newY));
        }

        updateElement(selectedId, { x: newX, y: newY });
        break;
      }
      case 'rotate': {
        const center = { x: element.x, y: element.y };
        const angle = Math.atan2(y - center.y, x - center.x);
        const rotation = (angle * 180) / Math.PI;
        updateElement(selectedId, { rotation });
        break;
      }
      case 'resize': {
        const width = Math.max(40, element.width + dx);
        const height = Math.max(40, element.height + dy);

        // Check if new size fits within space
        if (space) {
          if (
            element.x + width / 2 > space.x + space.width ||
            element.x - width / 2 < space.x ||
            element.y + height / 2 > space.y + space.height ||
            element.y - height / 2 < space.y
          ) {
            return;
          }
        }

        updateElement(selectedId, { width, height });
        break;
      }
    }

    setDragStart({ x: canvasX, y: canvasY });
  };

  const handleMouseUp = () => {
    setActiveHandle(null);
    setDragStart(null);
  };

  const getControlHandle = (
    x: number,
    y: number,
    element: TrackElement
  ): ControlHandle => {
    const rotateHandle = {
      x: element.x,
      y: element.y - element.height / 2 - 20,
      radius: 5,
    };

    const resizeHandle = {
      x: element.x + element.width / 2,
      y: element.y + element.height / 2,
      radius: 5,
    };

    if (
      Math.hypot(x - rotateHandle.x, y - rotateHandle.y) <= rotateHandle.radius
    ) {
      return 'rotate';
    }

    if (
      Math.hypot(x - resizeHandle.x, y - resizeHandle.y) <= resizeHandle.radius
    ) {
      return 'resize';
    }

    return null;
  };

  const isPointInElement = (x: number, y: number, element: TrackElement): boolean => {
    const dx = x - element.x;
    const dy = y - element.y;
    
    // Transform point to account for element rotation
    const angle = (element.rotation * Math.PI) / 180;
    const rotatedX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
    const rotatedY = dx * Math.sin(-angle) + dy * Math.cos(-angle);

    return (
      Math.abs(rotatedX) <= element.width / 2 &&
      Math.abs(rotatedY) <= element.height / 2
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Render function
    const render = () => {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      if (!isIsometric) {
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;

        const gridSize = 20;
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Draw space bounds
      if (space) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        if (isIsometric) {
          // Draw isometric rectangle
          ctx.beginPath();
          const [x1, y1] = toIsometric(space.x, space.y);
          const [x2, y2] = toIsometric(space.x + space.width, space.y);
          const [x3, y3] = toIsometric(space.x + space.width, space.y + space.height);
          const [x4, y4] = toIsometric(space.x, space.y + space.height);
          
          ctx.moveTo(canvas.width / 2 + x1, canvas.height / 2 + y1);
          ctx.lineTo(canvas.width / 2 + x2, canvas.height / 2 + y2);
          ctx.lineTo(canvas.width / 2 + x3, canvas.height / 2 + y3);
          ctx.lineTo(canvas.width / 2 + x4, canvas.height / 2 + y4);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.strokeRect(space.x, space.y, space.width, space.height);
        }
        
        ctx.setLineDash([]);
      }

      // Draw elements
      elements.forEach((element) => {
        const isSelected = element.id === selectedId;
        drawTrackElement(ctx, element, isSelected, isIsometric);
      });
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [elements, selectedId, isIsometric, space]);

  return (
    <div className="flex-1 relative bg-muted">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ touchAction: 'none' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
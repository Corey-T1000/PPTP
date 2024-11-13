import { useState } from 'react';
import { Canvas } from './canvas';
import { Toolbar } from './toolbar';
import { Sidebar } from './sidebar';
import { ViewMode } from '@/lib/types';

export default function Designer() {
  const [viewMode, setViewMode] = useState<ViewMode>('top-down');

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Toolbar viewMode={viewMode} onViewModeChange={setViewMode} />
        <Canvas viewMode={viewMode} />
      </div>
    </div>
  );
}
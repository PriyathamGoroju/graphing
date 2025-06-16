import React, { useState, useRef, useCallback } from 'react';
import GraphDisplay from '../components/GraphDisplay';
import GraphControls from '../components/GraphControls';
import useToast from '../hooks/use-toast';

const GraphingTool = () => {
  const [equations, setEquations] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewport, setViewport] = useState({ center: { x: 0, y: 0 }, zoom: 1 });
  
  const exportGraphRef = useRef(null);
  const { toast } = useToast();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleViewportChange = useCallback((newViewport) => {
    setViewport(newViewport);
    setZoomLevel(newViewport.zoom);
  }, []);

  const resetView = useCallback(() => {
    setViewport({
      center: { x: 0, y: 0 },
      zoom: 1
    });
    toast({ title: "View reset", description: "Reset to default view" });
  }, [toast]);

  // Fixed export function
  const exportGraph = useCallback(() => {
    try {
      const canvas = exportGraphRef.current;
      if (!canvas) throw new Error('Graph canvas not found');

      // Create temporary canvas with proper scaling
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      
      // Set dimensions matching the original canvas
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      ctx.drawImage(canvas, 0, 0);

      // Create download link
      const link = document.createElement('a');
      link.download = `graph-export-${new Date().toISOString()}.png`;
      link.href = tempCanvas.toDataURL('image/png');
      link.click();

      toast({
        title: "Export successful",
        description: "Graph image downloaded successfully"
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: error.message || "Could not export graph",
        variant: "destructive"
      });
    }
  }, [toast]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background dark:bg-gray-900">
      <header className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-2">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <span className="text-lg">✕</span>
          ) : (
            <span className="text-lg">☰</span>
          )}
        </button>
          <h1 className="text-xl font-bold dark:text-gray-100">Graph Visualizer</h1>
        </div>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        <div className={`${
          isSidebarOpen ? 'w-92' : 'w-0'
        } transition-all duration-300 ease-in-out border-r dark:border-gray-700 overflow-hidden`}>
          <GraphControls
            equations={equations}
            setEquations={setEquations}
            zoomLevel={viewport.zoom}
            setZoomLevel={(newZoom) => setViewport(prev => ({
              ...prev,
              zoom: Math.max(0.5, Math.min(2.0, newZoom))
            }))}
            exportGraph={exportGraph}
            resetView={resetView}
            gridEnabled={gridEnabled}
            setGridEnabled={setGridEnabled}
            theme={theme}
            setTheme={setTheme}
          />
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <GraphDisplay
            equations={equations}
            zoomLevel={zoomLevel}
            gridEnabled={gridEnabled}
            theme={theme}
            exportGraphRef={exportGraphRef}
            onViewportChange={handleViewportChange}
            viewport={viewport}
          />
        </div>
      </main>
    </div>
  );
};

GraphingTool.propTypes = {
  // Add prop types if this component receives any props
};

export default GraphingTool;
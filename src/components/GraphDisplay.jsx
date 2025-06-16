import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generatePoints, evaluateExpression } from '../utils/graphUtils';
import { create, all } from 'mathjs';

const math = create(all, {
  parser: {
    implicit: 'multiply',
    evaluate: false
  }
});

const GraphDisplay = ({
  equations,
  zoomLevel,
  viewport,
  gridEnabled,
  theme,
  exportGraphRef,
  isSidebarOpen,
  onViewportChange
}) => {
  // const exportGraphRef = useRef(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tangentPoint, setTangentPoint] = useState(null);

  const themeSettings = {
    light: { backgroundColor: '#ffffff', gridColor: '#e0e0e0', axisColor: '#666666', textColor: '#333333' },
    dark: { backgroundColor: '#1a1a1a', gridColor: '#333333', axisColor: '#999999', textColor: '#eeeeee' },
    blue: { backgroundColor: 'lch(8 12.35 273.75)', gridColor: 'oklch(0.37 0.03 259.73)', axisColor: '#0066cc', textColor: '#003366' },
  };

  // Viewport calculations
  const calculateBounds = useCallback(() => {
    const aspect = size.height / size.width;
    const viewWidth = 20 / viewport.zoom;
    const viewHeight = viewWidth * aspect;
    
    return {
      xMin: viewport.center.x - viewWidth / 2,
      xMax: viewport.center.x + viewWidth / 2,
      yMin: viewport.center.y - viewHeight / 2,
      yMax: viewport.center.y + viewHeight / 2
    };
  }, [viewport, size]);

  // Drawing functions
  const drawGrid = useCallback((ctx, colors, bounds) => {
    ctx.strokeStyle = colors.gridColor;
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let x = Math.ceil(bounds.xMin); x <= bounds.xMax; x++) {
      const xPos = scaleX(x, bounds);
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, size.height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = Math.ceil(bounds.yMin); y <= bounds.yMax; y++) {
      const yPos = scaleY(y, bounds);
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(size.width, yPos);
      ctx.stroke();
    }
  }, [size]);

  const drawAxes = useCallback((ctx, colors, bounds) => {
    ctx.strokeStyle = colors.axisColor;
    ctx.lineWidth = 2;
    ctx.fillStyle = colors.textColor;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate tick spacing based on zoom level and available space
    const minLabelSpacing = 60; // Minimum pixels between labels
    const baseTickSpacing = Math.pow(2, Math.floor(Math.log2(viewport.zoom)));
    const xStep = Math.max(baseTickSpacing, (bounds.xMax - bounds.xMin) * minLabelSpacing / size.width);
    const yStep = Math.max(baseTickSpacing, (bounds.yMax - bounds.yMin) * minLabelSpacing / size.height);

    // X-axis
    if (bounds.yMin <= 0 && bounds.yMax >= 0) {
      const yPos = scaleY(0, bounds);
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(size.width, yPos);
      ctx.stroke();

      // X-axis labels
      for (let x = Math.ceil(bounds.xMin / xStep) * xStep; x <= bounds.xMax; x += xStep) {
        const xPos = scaleX(x, bounds);
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(xPos, yPos - 5);
        ctx.lineTo(xPos, yPos + 5);
        ctx.stroke();

        // Only draw label if there's enough space
        const label = x.toFixed(xStep < 1 ? 1 : 0);
        const labelWidth = ctx.measureText(label).width;
        const nextX = x + xStep;
        const nextXPos = scaleX(nextX, bounds);
        
        if (nextXPos - xPos > labelWidth + 10) { // 10px padding
          ctx.fillText(label, xPos, yPos + 20);
        }
      }
    }

    // Y-axis
    if (bounds.xMin <= 0 && bounds.xMax >= 0) {
      const xPos = scaleX(0, bounds);
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, size.height);
      ctx.stroke();

      // Y-axis labels
      for (let y = Math.ceil(bounds.yMin / yStep) * yStep; y <= bounds.yMax; y += yStep) {
        const yPos = scaleY(y, bounds);
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(xPos - 5, yPos);
        ctx.lineTo(xPos + 5, yPos);
        ctx.stroke();

        // Only draw label if there's enough space
        const label = y.toFixed(yStep < 1 ? 1 : 0);
        const labelWidth = ctx.measureText(label).width;
        const nextY = y + yStep;
        const nextYPos = scaleY(nextY, bounds);
        
        if (Math.abs(nextYPos - yPos) > 20) { // 20px minimum vertical spacing
          ctx.textAlign = 'right';
          ctx.fillText(label, xPos - 10, yPos);
        }
      }
    }

    // Reset text alignment
    ctx.textAlign = 'center';
  }, [size, viewport.zoom]);

  const scaleX = (x, bounds) => 
    ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * size.width;

  const scaleY = (y, bounds) => 
    size.height - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * size.height;

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth: width, clientHeight: height } = containerRef.current;
        setSize({ width, height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    // Add ResizeObserver for parent container changes
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, []);

  // Calculate derivative at a point
  const calculateDerivative = useCallback((expression, x, h = 0.0001) => {
    try {
      const y1 = evaluateExpression(expression, x - h);
      const y2 = evaluateExpression(expression, x + h);
      return (y2 - y1) / (2 * h);
    } catch (error) {
      console.warn('Derivative calculation failed:', error);
      return null;
    }
  }, []);

  // Convert canvas coordinates to graph coordinates
  const canvasToGraphCoords = useCallback((canvasX, canvasY, bounds) => {
    const x = bounds.xMin + (canvasX / size.width) * (bounds.xMax - bounds.xMin);
    const y = bounds.yMax - (canvasY / size.height) * (bounds.yMax - bounds.yMin);
    return { x, y };
  }, [size]);

  // Handle click on graph
  const handleCanvasClick = useCallback((e) => {
    const canvas = exportGraphRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const bounds = calculateBounds();
    const graphCoords = canvasToGraphCoords(canvasX, canvasY, bounds);

    // Find the closest equation point
    let closestPoint = null;
    let minDistance = Infinity;

    equations.forEach(eq => {
      if (!eq.visible) return;
      
      const points = generatePoints(
        eq.expression,
        graphCoords.x - 0.1,
        graphCoords.x + 0.1,
        0.01
      );

      points.forEach(point => {
        if (isNaN(point.y)) return;
        
        const distance = Math.sqrt(
          Math.pow(point.x - graphCoords.x, 2) + 
          Math.pow(point.y - graphCoords.y, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = {
            x: point.x,
            y: point.y,
            equation: eq.expression,
            color: eq.color
          };
        }
      });
    });

    if (closestPoint && minDistance < 0.5) {
      const derivative = calculateDerivative(closestPoint.equation, closestPoint.x);
      if (derivative !== null) {
        setTangentPoint({
          ...closestPoint,
          derivative
        });
      }
    } else {
      setTangentPoint(null);
    }
  }, [equations, calculateBounds, canvasToGraphCoords, calculateDerivative]);

  // Draw tangent line
  const drawTangentLine = useCallback((ctx, point, bounds, colors) => {
    if (!point || !point.derivative) return;

    const length = 5; // Length of tangent line in graph units
    const dx = length / Math.sqrt(1 + point.derivative * point.derivative);
    const dy = point.derivative * dx;

    ctx.beginPath();
    ctx.strokeStyle = point.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 5]);

    const startX = scaleX(point.x - dx, bounds);
    const startY = scaleY(point.y - dy, bounds);
    const endX = scaleX(point.x + dx, bounds);
    const endY = scaleY(point.y + dy, bounds);

    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw point
    ctx.beginPath();
    ctx.fillStyle = point.color;
    ctx.arc(scaleX(point.x, bounds), scaleY(point.y, bounds), 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw tangent equation
    ctx.fillStyle = point.color;
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    
    // Format the equation: y = mx + b
    const m = point.derivative.toFixed(2);
    const b = (point.y - point.derivative * point.x).toFixed(2);
    const equation = `y = ${m}x + ${b}`;
    
    // Position the equation above the point
    const textX = scaleX(point.x, bounds) + 10;
    const textY = scaleY(point.y, bounds) - 10;
    
    // Add background for better readability
    const textWidth = ctx.measureText(equation).width;
    ctx.fillStyle = colors.backgroundColor;
    ctx.fillRect(textX - 5, textY - 20, textWidth + 10, 25);
    
    // Draw the equation
    ctx.fillStyle = point.color;
    ctx.font = '16px monospace';
    ctx.fillText(equation, textX, textY);

    // Reset line style
    ctx.setLineDash([]);
  }, [scaleX, scaleY]);

  // Redraw canvas
  useEffect(() => {
    const canvas = exportGraphRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    ctx.scale(dpr, dpr);

    const colors = themeSettings[theme] || themeSettings.light;
    ctx.fillStyle = colors.backgroundColor;
    ctx.fillRect(0, 0, size.width, size.height);

    const bounds = calculateBounds();
    
    if (gridEnabled) {
      drawGrid(ctx, colors, bounds);
    }
    drawAxes(ctx, colors, bounds);

    equations.forEach(eq => {
      if (!eq.visible) return;
      
      const points = generatePoints(
        eq.expression, 
        bounds.xMin - 1, 
        bounds.xMax + 1, 
        0.02 / zoomLevel
      );

      if (points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = eq.color;
      ctx.lineWidth = eq.lineWidth;
      ctx.setLineDash(
        eq.lineStyle === 'dashed' ? [5, 3] : 
        eq.lineStyle === 'dotted' ? [2, 2] : []
      );

      ctx.moveTo(scaleX(points[0].x, bounds), scaleY(points[0].y, bounds));
      points.slice(1).forEach(point => {
        ctx.lineTo(scaleX(point.x, bounds), scaleY(point.y, bounds));
      });
      ctx.stroke();
    });

    // Draw tangent line if exists
    if (tangentPoint && equations.length > 0) {
      drawTangentLine(ctx, tangentPoint, bounds, colors);
    }
  }, [equations, size, zoomLevel, theme, gridEnabled, calculateBounds, drawGrid, drawAxes, tangentPoint, drawTangentLine]);

  // Panning handlers
  const handleMouseDown = useCallback((e) => {
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startCenter: { ...viewport.center }
    });
  }, [viewport]);

  const handleMouseMove = useCallback((e) => {
    if (!dragStart.x) return;

    const dx = (e.clientX - dragStart.x) * (viewport.zoom / size.width);
    const dy = (dragStart.y - e.clientY) * (viewport.zoom / size.height);
    
    // Use onViewportChange prop to update parent state
    onViewportChange({
      ...viewport,
      center: {
        x: dragStart.startCenter.x - dx * 20,
        y: dragStart.startCenter.y - dy * 20
      }
    });
  }, [dragStart, viewport, onViewportChange, size]);


  const handleMouseUp = useCallback(() => {
    setDragStart({ x: 0, y: 0 });
    if (onViewportChange) {
      onViewportChange(viewport);
    }
  }, [viewport, onViewportChange]);

  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full bg-white dark:bg-gray-900 overflow-hidden"
    >
      <canvas
        ref={exportGraphRef}
        className="touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      />
    </div>
  );
};

GraphDisplay.propTypes = {
  equations: PropTypes.arrayOf(PropTypes.shape({
    expression: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    lineWidth: PropTypes.number,
    lineStyle: PropTypes.oneOf(['solid', 'dashed', 'dotted']),
    visible: PropTypes.bool
  })).isRequired,
  zoomLevel: PropTypes.number.isRequired,
  gridEnabled: PropTypes.bool,
  theme: PropTypes.oneOf(['light', 'dark', 'blue']),
  isSidebarOpen: PropTypes.bool,
  onViewportChange: PropTypes.func
};

export default GraphDisplay;
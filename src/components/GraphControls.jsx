import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
    CircleHelp,
    Download,
    Minus,
    Plus,
    RefreshCw,
    Trash2
} from "lucide-react";
import useToast from "../hooks/use-toast";

const GraphControls = ({
    equations,
    setEquations,
    zoomLevel,
    setZoomLevel,
    exportGraph,
    resetView,
    gridEnabled,
    setGridEnabled,
    theme,
    setTheme
}) => {
    const { toast } = useToast();
    const [newEquation, setNewEquation] = useState("");
    const [selectedColor, setSelectedColor] = useState("#1E88E5");

    const addEquation = useCallback(() => {
        const expression = newEquation.trim();
        if (!expression) {
            toast({
                title: "Empty equation",
                description: "Please enter an equation to add.",
                variant: "destructive"
            });
            return;
        }

        const newEquationObj = {
            id: crypto.randomUUID(),
            expression,
            color: selectedColor,
            visible: true,
            lineWidth: 2,
            lineStyle: "solid"
        };

        setEquations((prev) => [...prev, newEquationObj]);
        setNewEquation("");
        toast({ title: "Equation added", description: `Added: ${expression}` });
    }, [newEquation, selectedColor, toast, setEquations]);

    const removeEquation = useCallback(
        (id) => {
            setEquations((prev) => prev.filter((eq) => eq.id !== id));
        },
        [setEquations]
    );

    const handleZoomChange = useCallback(
        (value) => {
            const newZoom = parseFloat(value);
            setZoomLevel(Math.max(0.5, Math.min(2.0, newZoom)));
        },
        [setZoomLevel]
    );

    return (
        <div className="font-mono p-6 h-full overflow-y-auto space-y-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    Graph Controls
                </h2>
                <div className="flex gap-1">
                    <button
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={resetView}
                        aria-label="Reset view"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={exportGraph}
                        aria-label="Export graph"
                    >
                        <Download size={16} />
                    </button>
                </div>
            </div>

            {/* Equation Input */}
            <div className="space-y-3 font-mono">
                <label
                    htmlFor="equation-input"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Enter an equation (f(x) = )
                </label>
                <div className="flex gap-2">
                    <input
                        id="equation-input"
                        value={newEquation}
                        onChange={(e) => setNewEquation(e.target.value)}
                        placeholder="e.g., x^2, sin(x), 2x+1"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-sm"
                        onKeyPress={(e) => e.key === "Enter" && addEquation()}
                    />
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        onClick={addEquation}
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
                <label
                    htmlFor="equation-color"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Line Color
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        id="equation-color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {selectedColor}
                    </span>
                </div>
            </div>

            {/* Zoom Controls */}
            <div className="space-y-3">
                <label
                    htmlFor="zoom-level"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Zoom Level
                </label>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleZoomChange(zoomLevel - 0.1)}
                        className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Minus size={14} />
                    </button>
                    <input
                        id="zoom-level"
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        value={zoomLevel}
                        onChange={(e) => handleZoomChange(e.target.value)}
                    />
                    <button
                        onClick={() => handleZoomChange(zoomLevel + 0.1)}
                        className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-mono min-w-[3rem]">
                        {zoomLevel.toFixed(1)}x
                    </span>
                </div>
            </div>

            {/* Grid Toggle */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Grid
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={gridEnabled}
                        onChange={() => setGridEnabled(!gridEnabled)}
                        className="sr-only"
                    />
                    <div
                        className={`w-11 h-6 rounded-full transition-colors ${
                            gridEnabled
                                ? "bg-blue-600"
                                : "bg-gray-300 dark:bg-gray-600"
                        }`}
                    >
                        <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                                gridEnabled ? "translate-x-5" : "translate-x-0"
                            } mt-0.5 ml-0.5`}
                        ></div>
                    </div>
                </label>
            </div>

            {/* Theme Selector */}
            <div className="space-y-3">
                <label
                    htmlFor="theme-select"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Theme
                </label>
                <select
                    id="theme-select"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="blue">Blue</option>
                </select>
            </div>

            {/* Equations List */}
            {equations.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Active Equations
                        </h3>
                        <button
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center text-sm"
                            onClick={() => setEquations([])}
                        >
                            <Trash2 size={14} className="mr-1" />
                            Clear All
                        </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {equations.map((eq) => (
                            <div
                                key={eq.id}
                                className="flex items-center justify-between p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                        style={{ backgroundColor: eq.color }}
                                    />
                                    <span
                                        className={`text-sm font-mono ${
                                            eq.visible
                                                ? "text-gray-900 dark:text-gray-100"
                                                : "line-through text-gray-400 dark:text-gray-500"
                                        }`}
                                    >
                                        y = {eq.expression}
                                    </span>
                                </div>
                                <button
                                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                    onClick={() => removeEquation(eq.id)}
                                    aria-label={`Remove equation ${eq.expression}`}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

GraphControls.propTypes = {
    equations: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            expression: PropTypes.string.isRequired,
            color: PropTypes.string.isRequired,
            visible: PropTypes.bool.isRequired,
            lineWidth: PropTypes.number,
            lineStyle: PropTypes.oneOf(["solid", "dashed", "dotted"])
        })
    ).isRequired,
    setEquations: PropTypes.func.isRequired,
    zoomLevel: PropTypes.number.isRequired,
    setZoomLevel: PropTypes.func.isRequired,
    exportGraph: PropTypes.func.isRequired,
    resetView: PropTypes.func.isRequired,
    gridEnabled: PropTypes.bool.isRequired,
    setGridEnabled: PropTypes.func.isRequired,
    theme: PropTypes.oneOf(["light", "dark", "blue"]).isRequired,
    setTheme: PropTypes.func.isRequired
};

export default GraphControls;

import { create, all } from 'mathjs';

const math = create(all, {
  parser: {
    // Enable implicit multiplication and other conveniences
    implicit: 'multiply', // Handles '2x' → '2*x'
    evaluate: false
  }
});

/**
 * Enhanced expression evaluator with modern math.js syntax
 * @param {string} expression - Mathematical expression to evaluate
 * @param {number} x - X-value for evaluation
 * @returns {number} Result or NaN if invalid
 */
export const evaluateExpression = (expression, x) => {
  try {
    // Use mathjs's built-in implicit multiplication handling
    const node = math.parse(expression);
    return node.compile().evaluate({ x });
  } catch (error) {
    console.warn(`Evaluation error for "${expression}" at x=${x}:`, error.message);
    return NaN;
  }
};

/**
 * Robust point generator with discontinuity detection and performance optimizations
 * @param {string} expression - Mathematical expression to graph
 * @param {number} min - Minimum x-value
 * @param {number} max - Maximum x-value
 * @param {number} step - Step size between points
 * @returns {Array<{x: number, y: number}>} Array of connected points
 */
export const generatePoints = (expression, min, max, step) => {
  if (!expression?.trim()) return [];
  
  const points = [];
  let previousY = null;
  const MAX_POINTS = 1000;
  const DISCONTINUITY_THRESHOLD = 1e6;

  for (let x = min; x <= max && points.length < MAX_POINTS; x += step) {
    const y = evaluateExpression(expression, x);
    
    // Handle discontinuities and invalid points
    if (isNaN(y) || Math.abs(y) > DISCONTINUITY_THRESHOLD) {
      previousY = null;
      continue;
    }

    // Detect sudden jumps indicating discontinuities
    if (previousY !== null && Math.abs(y - previousY) > DISCONTINUITY_THRESHOLD) {
      points.push({ x, y: NaN }); // Add break in line
    }

    points.push({ x, y });
    previousY = y;
  }

  return points;
};

/**
 * Smart bounds calculator with automatic axis preservation
 * @param {Array<{x: number, y: number}>} points - Graph points
 * @param {number} [padding=0.1] - Percentage padding
 * @returns {Object} Calculated bounds with axis preservation
 */
export const calculateBounds = (points, padding = 0.1) => {
  const safePoints = points.filter(p => !isNaN(p.y) && isFinite(p.y));
  
  if (safePoints.length === 0) {
    return { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
  }

  // Calculate bounds using reducer to avoid stack overflow
  const initial = {
    xMin: Infinity, xMax: -Infinity,
    yMin: Infinity, yMax: -Infinity
  };

  const bounds = safePoints.reduce((acc, p) => ({
    xMin: Math.min(acc.xMin, p.x),
    xMax: Math.max(acc.xMax, p.x),
    yMin: Math.min(acc.yMin, p.y),
    yMax: Math.max(acc.yMax, p.y)
  }), initial);

  // Calculate padding with axis preservation
  const xRange = bounds.xMax - bounds.xMin || 10;
  const yRange = bounds.yMax - bounds.yMin || 10;
  
  return {
    xMin: bounds.xMin - xRange * padding,
    xMax: bounds.xMax + xRange * padding,
    yMin: bounds.yMin - yRange * padding,
    yMax: bounds.yMax + yRange * padding,
    // Maintain axis visibility for flat lines
    ...(bounds.yMin === bounds.yMax && {
      yMin: bounds.yMin - 5,
      yMax: bounds.yMax + 5
    })
  };
};

/**
 * Comprehensive expression validator with detailed error messages
 * @param {string} expression - Expression to validate
 * @returns {Object} Validation result { isValid: boolean, error?: string }
 */
export const validateExpression = (expression) => {
  try {
    if (!expression.trim()) return { isValid: false, error: "Empty expression" };
    
    const sanitized = expression
      .replace(/(\d)x/g, '$1*x')
      .replace(/(x)(\d)/g, '$1^$2');

    // Test compilation with multiple x-values
    const node = math.compile(sanitized);
    [-2, -1, 0, 1, 2].forEach(x => node.evaluate({ x }));
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
        .replace('Undefined symbol', 'Invalid symbol')
        .replace('Unexpected operator', 'Invalid syntax')
    };
  }
};

/**
 * Polynomial-specific helper functions
 */
export const polynomialHelpers = {
  parseCoefficients: (expression) => {
    try {
      const node = math.parse(expression);
      const coefficients = {};
      
      node.traverse(n => {
        if (n.isOperatorNode && n.op === '^') {
          const base = n.args[0];
          const exponent = n.args[1];
          if (base.isSymbolNode && exponent.isConstantNode) {
            coefficients[`x^${exponent.value}`] = 1;
          }
        }
      });
      
      return coefficients;
    } catch {
      return null;
    }
  },
  
  degree: (expression) => {
    const coeffs = polynomialHelpers.parseCoefficients(expression);
    return coeffs ? Math.max(...Object.keys(coeffs).map(k => parseInt(k.split('^')[1]))) : 0;
  }
};

// Enhanced example expressions with polynomial focus
export const exampleExpressions = [
  { label: "Quadratic", value: "x^2", hint: "Parabola" },
  { label: "Cubic", value: "x^3 - 2x", hint: "Inflection point" },
  { label: "Quartic", value: "x^4 - 3x^2 + 1", hint: "W-shaped curve" },
  { label: "Linear", value: "2x + 1", hint: "Straight line" },
  { label: "Absolute Value", value: "abs(x)", hint: "V-shape" },
  { label: "Rational", value: "1/(x+0.1)", hint: "Hyperbola" },
  { label: "Exponential", value: "e^x", hint: "Growth curve" },
  { label: "Trigonometric", value: "sin(x) + cos(2x)", hint: "Wave pattern" },
];
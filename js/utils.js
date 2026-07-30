// Linear interpolation
export function lerp(a, b, t) { 
  return a + (b - a) * t; 
}

// Clamp value between min and max
export function clamp(val, min, max) { 
  return Math.min(Math.max(val, min), max); 
}

// Map a value from one range to another
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

// Easing functions
export function easeOutCubic(t) { 
  return 1 - Math.pow(1 - t, 3); 
}

export function easeInOutQuad(t) { 
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; 
}

export function easeOutExpo(t) { 
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); 
}

// Debounce function
export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Throttle using requestAnimationFrame
export function rafThrottle(fn) {
  let isRunning = false;
  let lastArgs = null;
  
  return function (...args) {
    lastArgs = args;
    if (!isRunning) {
      isRunning = true;
      requestAnimationFrame(() => {
        fn.apply(this, lastArgs);
        isRunning = false;
      });
    }
  };
}

// Get scroll progress of an element (0 = top hits viewport bottom, 1 = bottom hits viewport top)
export function getScrollProgress(element) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  // Element starts entering viewport when top hits windowHeight
  // Element completely leaves viewport when bottom hits 0
  const totalDistance = windowHeight + rect.height;
  const traveledDistance = windowHeight - rect.top;
  
  const progress = traveledDistance / totalDistance;
  return clamp(progress, 0, 1);
}

// Pad number with leading zeros
export function padNumber(num, size) { 
  return String(num).padStart(size, '0'); 
}

/**
 * Generates a deterministic, beautiful HSL color based on a string (agent ID or name).
 * Returns an object with CSS classes for background and text.
 */
export const getAgentColor = (identifier: string | number | undefined | null) => {
  if (!identifier) return {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-500 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700'
  };

  // Premium, distinct colors for agents
  const colors = [
    { h: 220, s: 80, l: 60 }, // Royal Blue
    { h: 260, s: 70, l: 65 }, // Purple
    { h: 320, s: 75, l: 60 }, // Pink/Magenta
    { h: 140, s: 60, l: 45 }, // Emerald Green
    { h: 20, s: 85, l: 60 },  // Orange
    { h: 190, s: 80, l: 45 }, // Cyan/Teal
    { h: 280, s: 60, l: 55 }, // Violet
    { h: 340, s: 80, l: 55 }, // Crimson
    { h: 210, s: 90, l: 50 }, // Deep Sky Blue
    { h: 160, s: 70, l: 40 }, // Sea Green
  ];

  const str = String(identifier);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const color = colors[Math.abs(hash) % colors.length];
  
  return {
    // Light Mode - More contrast, darker text
    bg: `hsla(${color.h}, ${color.s}%, 92%, 1)`,
    text: `hsla(${color.h}, ${color.s}%, 30%, 1)`,
    border: `hsla(${color.h}, ${color.s}%, 80%, 1)`,
    
    // Dark Mode - Glowing feel
    bgDark: `hsla(${color.h}, ${color.s}%, 15%, 0.45)`,
    textDark: `hsla(${color.h}, ${color.s}%, 75%, 1)`,
    borderDark: `hsla(${color.h}, ${color.s}%, 35%, 1)`,
    
    // Raw base color
    raw: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`
  };
};

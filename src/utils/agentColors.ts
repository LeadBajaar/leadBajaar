/**
 * Generates a deterministic, vibrant, solid saturated color based on an identifier.
 * Ensures high contrast with white text for avatars, badges, and agent indicators.
 */
export const getAgentColor = (identifier: string | number | undefined | null) => {
  if (!identifier) return {
    bg: '#475569', // Solid Slate-600
    text: '#FFFFFF',
    border: '#334155',
    bgDark: '#334155',
    textDark: '#FFFFFF',
    borderDark: '#1E293B',
    raw: '#475569'
  };

  // High-contrast, solid saturated vibrant palette (all designed for crisp white text)
  const palette = [
    { bg: '#4F46E5', text: '#FFFFFF', border: '#4338CA', bgDark: '#4338CA', textDark: '#FFFFFF', borderDark: '#3730A3', raw: '#4F46E5' }, // Indigo
    { bg: '#2563EB', text: '#FFFFFF', border: '#1D4ED8', bgDark: '#1D4ED8', textDark: '#FFFFFF', borderDark: '#1E40AF', raw: '#2563EB' }, // Blue
    { bg: '#7C3AED', text: '#FFFFFF', border: '#6D28D9', bgDark: '#6D28D9', textDark: '#FFFFFF', borderDark: '#5B21B6', raw: '#7C3AED' }, // Purple
    { bg: '#059669', text: '#FFFFFF', border: '#047857', bgDark: '#047857', textDark: '#FFFFFF', borderDark: '#065F46', raw: '#059669' }, // Emerald
    { bg: '#D97706', text: '#FFFFFF', border: '#B45309', bgDark: '#B45309', textDark: '#FFFFFF', borderDark: '#92400E', raw: '#D97706' }, // Amber
    { bg: '#DC2626', text: '#FFFFFF', border: '#B91C1C', bgDark: '#B91C1C', textDark: '#FFFFFF', borderDark: '#991B1B', raw: '#DC2626' }, // Red
    { bg: '#0891B2', text: '#FFFFFF', border: '#0E7490', bgDark: '#0E7490', textDark: '#FFFFFF', borderDark: '#155E75', raw: '#0891B2' }, // Cyan
    { bg: '#9333EA', text: '#FFFFFF', border: '#7E22CE', bgDark: '#7E22CE', textDark: '#FFFFFF', borderDark: '#6B21A8', raw: '#9333EA' }, // Violet
    { bg: '#E11D48', text: '#FFFFFF', border: '#BE123C', bgDark: '#BE123C', textDark: '#FFFFFF', borderDark: '#9F1239', raw: '#E11D48' }, // Rose
    { bg: '#0D9488', text: '#FFFFFF', border: '#0F766E', bgDark: '#0F766E', textDark: '#FFFFFF', borderDark: '#115E59', raw: '#0D9488' }, // Teal
  ];

  const str = String(identifier);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const chosen = palette[Math.abs(hash) % palette.length];
  return chosen;
};

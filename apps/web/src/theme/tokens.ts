export const cssVariables = {
  '--bg-main': '#020617',
  '--bg-card': 'rgba(15, 23, 42, 0.7)',
  '--bg-panel': 'rgba(15, 23, 42, 0.5)',
  '--border-color': 'rgba(51, 65, 85, 0.8)',
  '--border-soft': 'rgba(51, 65, 85, 0.6)',
  '--border-light': 'rgba(71, 85, 105, 0.4)',
  '--text-strong': '#fff',
  '--text-main': '#f8fafc',
  '--text-body': '#cbd5e1',
  '--text-muted': '#94a3b8',
  '--text-subtle': '#64748b',
  '--primary': '#4f46e5',
  '--primary-hover': '#4338ca',
  '--primary-light': '#818cf8',
  '--accent-cyan': '#22d3ee',
  '--success': '#34d399',
} as const;

export const tokens = {
  ...cssVariables,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  '--gradient-logo': 'linear-gradient(135deg, #4f46e5, #3b82f6)',
  '--gradient-hero': 'linear-gradient(90deg, #818cf8, #60a5fa, #2dd4bf)',
  '--gradient-blue': 'linear-gradient(135deg, #2563eb, #4f46e5)',
  '--gradient-purple': 'linear-gradient(135deg, #7c3aed, #9333ea)',
  '--gradient-teal': 'linear-gradient(135deg, #059669, #0d9488)',
  '--bg-header': 'rgba(2, 6, 23, 0.85)',
  '--bg-nav': 'rgba(15, 23, 42, 0.9)',
  '--bg-user': '#0f172a',
  '--bg-tag': '#1e293b',
  '--bg-hover': 'rgba(51, 65, 85, 0.4)',
  '--bg-secondary': 'rgba(30, 41, 59, 0.6)',
  '--bg-secondary-hover': 'rgba(51, 65, 85, 0.6)',
  '--bg-secondary-hover-strong': 'rgba(30, 41, 59, 0.7)',
  '--bg-check': 'rgba(2, 6, 23, 0.6)',
  '--bg-done': 'rgba(49, 46, 129, 0.25)',
  '--bg-pill': 'rgba(79, 70, 229, 0.12)',
  '--bg-pill-strong': 'rgba(79, 70, 229, 0.2)',
  '--border-pill': 'rgba(79, 70, 229, 0.25)',
  '--border-topic': 'rgba(51, 65, 85, 0.5)',
  '--border-accent-soft': 'rgba(99, 102, 241, 0.35)',
  '--border-accent': 'rgba(99, 102, 241, 0.4)',
  '--border-accent-strong': 'rgba(99, 102, 241, 0.5)',
  '--border-script': 'rgba(51, 65, 85, 0.7)',
  '--shadow-logo': '0 4px 14px rgba(79, 70, 229, 0.3)',
  '--shadow-primary': '0 4px 15px rgba(79, 70, 229, 0.3)',
  '--shadow-active': '0 4px 12px rgba(79, 70, 229, 0.35)',
  '--shadow-card': '0 12px 30px rgba(0, 0, 0, 0.4)',
  '--glow': 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
  '--bg-script': 'rgba(15, 23, 42, 0.6)',
  '--text-subtopic': '#f1f5f9',
  '--text-script': '#e2e8f0',
} as const;

export function applyTokens(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const [name, value] of Object.entries(tokens)) {
    if (name.startsWith('--')) root.style.setProperty(name, value);
  }
  root.style.setProperty('--font-family', tokens.fontFamily);
}

export const ACCENT_COLORS = {
  indigo: { name: 'Indigo',    value: '#6366f1', hover: '#4f46e5', glow: 'rgba(99,102,241,0.25)' },
  purple: { name: 'Binafsha',  value: '#a855f7', hover: '#9333ea', glow: 'rgba(168,85,247,0.25)' },
  blue:   { name: "Ko'k",     value: '#3b82f6', hover: '#2563eb', glow: 'rgba(59,130,246,0.25)' },
  green:  { name: 'Yashil',   value: '#10b981', hover: '#059669', glow: 'rgba(16,185,129,0.25)' },
  orange: { name: 'To\'q sariq', value: '#f97316', hover: '#ea580c', glow: 'rgba(249,115,22,0.25)' },
  pink:   { name: 'Pushti',   value: '#ec4899', hover: '#db2777', glow: 'rgba(236,72,153,0.25)' },
  teal:   { name: 'Moviy',    value: '#14b8a6', hover: '#0d9488', glow: 'rgba(20,184,166,0.25)' },
  red:    { name: 'Qizil',    value: '#ef4444', hover: '#dc2626', glow: 'rgba(239,68,68,0.25)' },
};

export const BG_PRESETS = {
  dark:     { name: 'Qoʻngʻir',  primary: '#0b0f19', secondary: '#111827', sidebar: '#1f2937', card: '#1f2937', border: '#374151' },
  darker:   { name: 'Toʻq',      primary: '#060912', secondary: '#0d1117', sidebar: '#0d1117', card: '#161b22', border: '#21262d' },
  midnight: { name: 'Tungi',     primary: '#010104', secondary: '#06060a', sidebar: '#0a0a10', card: '#0a0a10', border: '#18181b' },
  charcoal: { name: 'Kulrang',   primary: '#111111', secondary: '#1a1a1a', sidebar: '#222222', card: '#222222', border: '#333333' },
};

export const RADIUS_PRESETS = {
  rounded: { name: 'Yumaloq',   card: '18px', btn: '12px', input: '10px' },
  normal:  { name: 'Oddiy',     card: '12px', btn: '8px',  input: '8px'  },
  sharp:   { name: 'Burchakli', card: '4px',  btn: '4px',  input: '4px'  },
};

export const FONT_PRESETS = {
  small:  { name: 'Kichik', size: '13px' },
  normal: { name: 'Oddiy',  size: '14px' },
  large:  { name: 'Katta',  size: '15.5px' },
};

export function getTheme() {
  try {
    return JSON.parse(localStorage.getItem('tartib_theme')) || defaultTheme();
  } catch { return defaultTheme(); }
}

export function defaultTheme() {
  return { accent: 'indigo', bg: 'dark', radius: 'rounded', font: 'normal' };
}

export function saveTheme(theme) {
  localStorage.setItem('tartib_theme', JSON.stringify(theme));
  applyTheme(theme);
}

export function applyTheme(theme) {
  const root = document.documentElement;
  const accent = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.indigo;
  const bg     = BG_PRESETS[theme.bg]        || BG_PRESETS.dark;
  const radius = RADIUS_PRESETS[theme.radius] || RADIUS_PRESETS.rounded;
  const font   = FONT_PRESETS[theme.font]     || FONT_PRESETS.normal;

  root.style.setProperty('--color-accent',       accent.value);
  root.style.setProperty('--color-accent-hover', accent.hover);
  root.style.setProperty('--color-glow',         accent.glow);

  root.style.setProperty('--bg-primary',   bg.primary);
  root.style.setProperty('--bg-secondary', bg.secondary);
  root.style.setProperty('--bg-sidebar',   bg.sidebar);
  root.style.setProperty('--bg-card',      bg.card);
  root.style.setProperty('--border-color', bg.border);

  root.style.setProperty('--card-radius',  radius.card);
  root.style.setProperty('--btn-radius',   radius.btn);
  root.style.setProperty('--input-radius', radius.input);

  root.style.setProperty('--font-size-base', font.size);
}

export const ACCENT_COLORS = {
  indigo: { name: 'Indigo',      value: '#6366f1', hover: '#4f46e5', glow: 'rgba(99,102,241,0.25)' },
  purple: { name: 'Binafsha',    value: '#a855f7', hover: '#9333ea', glow: 'rgba(168,85,247,0.25)' },
  blue:   { name: "Ko'k",       value: '#3b82f6', hover: '#2563eb', glow: 'rgba(59,130,246,0.25)' },
  green:  { name: 'Yashil',     value: '#10b981', hover: '#059669', glow: 'rgba(16,185,129,0.25)' },
  orange: { name: "To'q sariq", value: '#f97316', hover: '#ea580c', glow: 'rgba(249,115,22,0.25)' },
  pink:   { name: 'Pushti',     value: '#ec4899', hover: '#db2777', glow: 'rgba(236,72,153,0.25)' },
  teal:   { name: 'Moviy',      value: '#14b8a6', hover: '#0d9488', glow: 'rgba(20,184,166,0.25)' },
  red:    { name: 'Qizil',      value: '#ef4444', hover: '#dc2626', glow: 'rgba(239,68,68,0.25)' },
};

// Each preset also declares text/border colours for that mode
export const BG_PRESETS = {
  // ── Dark ────────────────────────────────────────────────────────────────────
  dark: {
    name: 'Qoʻngʻir', dark: true,
    primary: '#0b0f19', secondary: '#111827', sidebar: '#1f2937', card: '#1f2937', border: '#374151',
    borderHover: '#4b5563',
    textPrimary: '#f9fafb', textSecondary: '#cbd5e1', textMuted: '#6b7280',
  },
  darker: {
    name: 'Toʻq', dark: true,
    primary: '#060912', secondary: '#0d1117', sidebar: '#0d1117', card: '#161b22', border: '#21262d',
    borderHover: '#30363d',
    textPrimary: '#e6edf3', textSecondary: '#8b949e', textMuted: '#484f58',
  },
  midnight: {
    name: 'Tungi', dark: true,
    primary: '#010104', secondary: '#06060a', sidebar: '#0a0a10', card: '#0a0a10', border: '#18181b',
    borderHover: '#27272a',
    textPrimary: '#fafafa', textSecondary: '#a1a1aa', textMuted: '#52525b',
  },
  charcoal: {
    name: 'Kulrang', dark: true,
    primary: '#111111', secondary: '#1a1a1a', sidebar: '#222222', card: '#222222', border: '#333333',
    borderHover: '#444444',
    textPrimary: '#f5f5f5', textSecondary: '#a3a3a3', textMuted: '#525252',
  },
  // ── Light ───────────────────────────────────────────────────────────────────
  light: {
    name: 'Oq', dark: false,
    primary: '#f8fafc', secondary: '#f1f5f9', sidebar: '#ffffff', card: '#ffffff', border: '#e2e8f0',
    borderHover: '#cbd5e1',
    textPrimary: '#0f172a', textSecondary: '#475569', textMuted: '#94a3b8',
  },
  white: {
    name: 'Toza oq', dark: false,
    primary: '#ffffff', secondary: '#f9fafb', sidebar: '#f3f4f6', card: '#ffffff', border: '#e5e7eb',
    borderHover: '#d1d5db',
    textPrimary: '#111827', textSecondary: '#4b5563', textMuted: '#9ca3af',
  },
  cream: {
    name: 'Sariqish', dark: false,
    primary: '#fefce8', secondary: '#fef9c3', sidebar: '#ffffff', card: '#ffffff', border: '#fde68a',
    borderHover: '#fcd34d',
    textPrimary: '#1c1917', textSecondary: '#57534e', textMuted: '#a8a29e',
  },
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
    const saved = JSON.parse(localStorage.getItem('tartib_theme'));
    // v2 migration: old saves had bg:'dark' as default — reset to light once
    if (!saved || (!saved._v && saved.bg === 'dark')) {
      const fresh = defaultTheme();
      localStorage.setItem('tartib_theme', JSON.stringify(fresh));
      return fresh;
    }
    return saved;
  } catch { return defaultTheme(); }
}

export function defaultTheme() {
  return { accent: 'indigo', bg: 'light', radius: 'rounded', font: 'normal', _v: 2 };
}

export function saveTheme(theme) {
  localStorage.setItem('tartib_theme', JSON.stringify({ ...theme, _v: 2 }));
  applyTheme(theme);
}

export function applyTheme(theme) {
  const root   = document.documentElement;
  const accent = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.indigo;
  const bg     = BG_PRESETS[theme.bg]        || BG_PRESETS.dark;
  const radius = RADIUS_PRESETS[theme.radius] || RADIUS_PRESETS.rounded;
  const font   = FONT_PRESETS[theme.font]     || FONT_PRESETS.normal;

  // Accent
  root.style.setProperty('--color-accent',       accent.value);
  root.style.setProperty('--color-accent-hover', accent.hover);
  root.style.setProperty('--color-glow',         accent.glow);

  // Backgrounds
  root.style.setProperty('--bg-primary',   bg.primary);
  root.style.setProperty('--bg-secondary', bg.secondary);
  root.style.setProperty('--bg-sidebar',   bg.sidebar);
  root.style.setProperty('--bg-card',      bg.card);

  // Borders
  root.style.setProperty('--border-color',       bg.border);
  root.style.setProperty('--border-color-hover', bg.borderHover);

  // Text — the critical part for light mode
  root.style.setProperty('--text-primary',   bg.textPrimary);
  root.style.setProperty('--text-secondary', bg.textSecondary);
  root.style.setProperty('--text-muted',     bg.textMuted);

  // Shadow adapts to brightness
  const s = bg.dark
    ? 'rgba(0,0,0,0.3)'
    : 'rgba(0,0,0,0.08)';
  root.style.setProperty('--shadow-sm', `0 1px 3px ${s}`);
  root.style.setProperty('--shadow-md', `0 4px 12px ${s}`);

  // Shape & font
  root.style.setProperty('--card-radius',    radius.card);
  root.style.setProperty('--btn-radius',     radius.btn);
  root.style.setProperty('--input-radius',   radius.input);
  root.style.setProperty('--font-size-base', font.size);

  // Mark body so CSS can target light vs dark without class juggling
  if (bg.dark) {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
}

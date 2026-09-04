export type Theme = 'dark' | 'light';

const THEME_KEY = 'ayinz_theme';

export const getStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' ? 'light' : 'dark';
  } catch { return 'dark'; }
};

export const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
};

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { applyTheme, getStoredTheme, type Theme } from '../utils/theme';

export default function ThemeToggle({ variant = 'mobile' }: { variant?: 'mobile' | 'desktop' }) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme());

  useEffect(() => { applyTheme(theme); }, [theme]);

  const buttonClass = variant === 'mobile'
    ? 'w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 bg-[var(--surface-hover)] border border-[var(--line-2)] text-[var(--fg2)]'
    : 'w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 bg-[var(--surface-hover)] border border-[var(--line-2)] text-[var(--fg2)] hover:text-[var(--fg0)]';

  return (
    <button
      onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      className={buttonClass}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';

export type VisualStyle = 
  | 'glacier' 
  | 'sahara' 
  | 'bento' 
  | 'pastel' 
  | 'nebula' 
  | 'carbon' 
  | 'sunset' 
  | 'matcha';

export type ThemeName = VisualStyle;

export interface ThemeOption {
  id: VisualStyle;
  name: string;
  label: string;
  category: 'Dark' | 'Light';
  description: string;
  previewColor: string;
  accentColor: string;
  color: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'glacier',
    name: 'Glacier',
    label: 'Glacier',
    category: 'Dark',
    description: 'Arctic blue glassmorphism with high contrast glow',
    previewColor: '#0a0e1a',
    accentColor: '#7dd3fc',
    color: '#7dd3fc'
  },
  {
    id: 'nebula',
    name: 'Nebula',
    label: 'Nebula',
    category: 'Dark',
    description: 'Deep cosmic violet aurora with radiant neon',
    previewColor: '#0c0818',
    accentColor: '#a78bfa',
    color: '#a78bfa'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    label: 'Sunset',
    category: 'Dark',
    description: 'Warm ember twilight with coral amber gradients',
    previewColor: '#180c14',
    accentColor: '#fb923c',
    color: '#fb923c'
  },
  {
    id: 'carbon',
    name: 'Carbon',
    label: 'Carbon',
    category: 'Dark',
    description: 'Minimalist high-density monospace engineering console',
    previewColor: '#0a0a0a',
    accentColor: '#f59e0b',
    color: '#f59e0b'
  },
  {
    id: 'sahara',
    name: 'Sahara',
    label: 'Sahara',
    category: 'Light',
    description: 'Warm editorial paper aesthetic with serif headlines',
    previewColor: '#faf5ee',
    accentColor: '#c2652a',
    color: '#c2652a'
  },
  {
    id: 'bento',
    name: 'Bento',
    label: 'Bento',
    category: 'Light',
    description: 'Clean modern SaaS layout with crisp borders',
    previewColor: '#f6f8fb',
    accentColor: '#0f172a',
    color: '#0f172a'
  },
  {
    id: 'matcha',
    name: 'Matcha',
    label: 'Matcha',
    category: 'Light',
    description: 'Botanical sage palette with soothing organic tones',
    previewColor: '#f4f7f0',
    accentColor: '#168054',
    color: '#168054'
  },
  {
    id: 'pastel',
    name: 'Pastel',
    label: 'Pastel',
    category: 'Light',
    description: 'Soft lavender and indigo with rounded card geometry',
    previewColor: '#fdfafd',
    accentColor: '#6366f1',
    color: '#6366f1'
  }
];

interface StyleContextType {
  style: VisualStyle;
  setStyle: (style: VisualStyle) => void;
  themes: ThemeOption[];
  theme: VisualStyle;
  setTheme: (theme: VisualStyle) => void;
  themeOptions: ThemeOption[];
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [style, setStyleState] = useState<VisualStyle>(() => {
    const saved = localStorage.getItem('foundersignal-theme') || localStorage.getItem('foundersignal-style');
    const valid = THEME_OPTIONS.some(t => t.id === saved);
    return (valid ? saved : 'glacier') as VisualStyle;
  });

  const setStyle = (newStyle: VisualStyle) => {
    setStyleState(newStyle);
    localStorage.setItem('foundersignal-theme', newStyle);
    localStorage.setItem('foundersignal-style', newStyle);
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Set data-theme attribute
    root.setAttribute('data-theme', style);

    // Remove old classes and add new
    THEME_OPTIONS.forEach(t => body.classList.remove(`theme-${t.id}`));
    body.classList.add(`theme-${style}`);
  }, [style]);

  return (
    <StyleContext.Provider value={{ 
      style, 
      setStyle, 
      themes: THEME_OPTIONS,
      theme: style,
      setTheme: setStyle,
      themeOptions: THEME_OPTIONS
    }}>
      {children}
    </StyleContext.Provider>
  );
};

export const useStyle = () => {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
};

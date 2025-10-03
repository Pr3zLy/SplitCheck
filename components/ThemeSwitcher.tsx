import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface ThemeSwitcherProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    language: 'it' | 'en';
}

const translations = {
    it: {
        label: (theme: string) => `Passa alla modalità ${theme === 'light' ? 'scura' : 'chiara'}`,
    },
    en: {
        label: (theme: string) => `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`,
    }
};

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, toggleTheme, language }) => {
    const t = translations[language];
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
            aria-label={t.label(theme)}
        >
            {theme === 'light' ? (
                <MoonIcon className="w-5 h-5" />
            ) : (
                <SunIcon className="w-5 h-5" />
            )}
        </button>
    );
};

export default ThemeSwitcher;

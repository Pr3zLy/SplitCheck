import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface ThemeSwitcherProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
            aria-label={`Passa alla modalità ${theme === 'light' ? 'scura' : 'chiara'}`}
        >
            {theme === 'light' ? (
                <MoonIcon className="w-6 h-6" />
            ) : (
                <SunIcon className="w-6 h-6" />
            )}
        </button>
    );
};

export default ThemeSwitcher;
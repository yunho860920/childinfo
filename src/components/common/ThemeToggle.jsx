// src/components/common/ThemeToggle.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ darkMode, setDarkMode }) => (
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="p-2 text-brand-gray-500 dark:text-brand-gray-400 hover:bg-brand-gray-100 dark:hover:bg-white/10 rounded-full transition-all active:scale-90"
    aria-label="Toggle theme"
  >
    {darkMode ? <Sun size={22} /> : <Moon size={22} />}
  </button>
);

export default ThemeToggle;

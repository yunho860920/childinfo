// src/components/common/ThemeToggle.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ darkMode, setDarkMode }) => (
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="p-2 rounded-full hover:bg-brand-gray-100  transition-all active:scale-90"
    aria-label="Toggle theme"
  >
    {darkMode ? <Sun className="text-white" size={24} /> : <Moon className="text-brand-gray-800" size={24} />}
  </button>
);

export default ThemeToggle;

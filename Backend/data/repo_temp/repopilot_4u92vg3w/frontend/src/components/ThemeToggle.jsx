// components/ThemeToggle.jsx

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeProvider"; // Adjust path if needed

export default function ThemeToggle() {
  const { darkMode, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 relative flex items-center px-1 transition-all duration-300 shadow-inner hover:shadow-md focus:outline-none"
      aria-label="Toggle dark mode"
    >
      <div
        className={`absolute w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 transform ${
          darkMode
            ? "translate-x-6 bg-blue-600"
            : "translate-x-0 bg-yellow-500"
        }`}
      >
        {darkMode ? (
          <Moon className="w-4 h-4 text-white" />
        ) : (
          <Sun className="w-4 h-4 text-white" />
        )}
      </div>
    </button>
  );
}


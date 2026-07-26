import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center gap-2 rounded-full  bg-white px-1 py-1 text-sm font-medium text-slate-700 cursor-pointer  focus:outline-none mx-2 ${className}`}
    >
      {isDark ? (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.8A9 9 0 1111.2 3a7 7 0 109.8 9.8z" />
          </svg>
        
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8-9h1M3 12H2m14.95 6.95l.7.7M5.35 5.35l.7.7m0 12.9l-.7.7M18.65 5.35l-.7.7M12 7a5 5 0 100 10 5 5 0 000-10z" />
          </svg>
          
        </>
      )}
    </button>
  );
};

export default ThemeToggle;

/* theme.js
   Dark mode toggle – persists preference to localStorage.
*/

(function () {
  const THEME_KEY = 'et_theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(saved);

    document.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById('theme-toggle');
      if (btn) btn.addEventListener('click', toggleTheme);
      applyTheme(saved); // re-apply after DOM ready so button updates
    });
  }

  initTheme();

  window.theme = { toggle: toggleTheme, apply: applyTheme };
})();

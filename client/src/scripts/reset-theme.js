// Reset theme state
function resetTheme() {
  // Clear stored theme
  localStorage.removeItem('de-lacream-at-theme');
  
  // Remove theme classes
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  
  // Set system theme
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.classList.add(systemTheme);
  
  // Force reload
  window.location.reload();
}

// Execute reset
resetTheme(); 
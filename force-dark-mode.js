// Script to force dark mode ONLY on the store page
// Copy and paste this into your browser console when on the store page

// Check if we're on the store page
if (window.location.pathname === '/store') {
  // Save the current theme before changing it
  const currentTheme = localStorage.getItem("de-lacream-at-theme") || "system";
  localStorage.setItem("previous-theme", currentTheme);
  
  // Set theme to dark in localStorage
  localStorage.setItem("de-lacream-at-theme", "dark");
  
  // Apply dark mode to the HTML element
  document.documentElement.classList.remove("light", "system");
  document.documentElement.classList.add("dark");
  
  console.log("Dark mode has been forced on for the store page.");
} else {
  console.log("This script only works on the store page. Navigate to /store first.");
} 
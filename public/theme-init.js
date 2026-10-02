// public/theme-init.js
// Dijalankan di <head> sebelum first paint untuk mencegah FOUC (Flash of Unstyled/Light Content).
// Menggunakan key 'tc_theme' yang PERSIS sama dengan ThemeContext.jsx.
;(function () {
  try {
    var storedTheme = localStorage.getItem('tc_theme')
    var theme = storedTheme === 'light' ? 'light' : 'dark'
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  } catch (e) {
    document.documentElement.classList.add('dark')
  }
})()


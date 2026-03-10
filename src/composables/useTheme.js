import { ref } from 'vue'

const isDark = ref(false)

export function useTheme() {
  function applyTheme(dark) {
    isDark.value = dark
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  function toggleTheme() {
    applyTheme(!isDark.value)
  }

  function initTheme() {
    const saved = localStorage.getItem('theme')
    const preferDark = saved ? saved === 'dark' : true
    applyTheme(preferDark)
  }

  return {
    isDark,
    applyTheme,
    toggleTheme,
    initTheme
  }
}

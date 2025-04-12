export const useTheme = () => {
  const theme = useState('theme', () => 'light') // 'light' or 'dark'

  onMounted(() => {
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme) {
      theme.value = storedTheme
    }
    updateThemeClass()
  })

  watch(theme, () => {
    localStorage.setItem('theme', theme.value)
    updateThemeClass()
  })

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const updateThemeClass = () => {
    if (process) {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme.value)
    }
  }

  return {
    theme,
    toggleTheme,
  }
}

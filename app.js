// Wait for DOM content to load completely
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    // 1. Check Saved Theme Preference or System Default
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            enableDarkMode();
        } else {
            enableLightMode();
        }
    }

    // 2. Enable Dark Mode
    function enableDarkMode() {
        htmlElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    // 3. Enable Light Mode
    function enableLightMode() {
        htmlElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    // 4. Toggle Button Event Listener
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark')) {
                enableLightMode();
            } else {
                enableDarkMode();
            }
        });
    }

    // Initialize Theme on Load
    initTheme();
});
const apikey = "ad703d3bc1bf4002b7970547262507";
const baseUrl = "https://api.weatherapi.com/v1";

document.addEventListener('DOMContentLoaded', () => {
    // ---------------- THEME TOGGLE LOGIC ----------------
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            enableDarkMode();
        } else {
            enableLightMode();
        }
    }

    function enableDarkMode() {
        htmlElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    function enableLightMode() {
        htmlElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            htmlElement.classList.contains('dark') ? enableLightMode() : enableDarkMode();
        });
    }

    initTheme();

    // ---------------- GEOLOCATION & DEFAULT FETCH ----------------
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherData(`${position.coords.latitude},${position.coords.longitude}`);
            },
            () => fetchWeatherData("Galle")
        );
    } else {
        fetchWeatherData("Galle");
    }

    // Enter key search handler
    const searchInput = document.getElementById("testSearch");
    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") btnsearchOnAction();
        });
    }
});

// ---------------- WEATHER FETCH FUNCTION (Forecast + AQI) ----------------
function fetchWeatherData(query) {
    
    fetch(`${baseUrl}/forecast.json?key=${apikey}&q=${query}&days=1&aqi=yes`)
        .then(res => {
            if (!res.ok) throw new Error("City not found");
            return res.json();
        })
        .then(data => {
            renderLeftSidebarUI(data);
            renderHighlightsUI(data);
        })
        .catch(err => alert(err.message));
}

// 1. Left Sidebar (Current Weather) Dynamic UI
function renderLeftSidebarUI(data) {
    const localTimeStr = data.location.localtime;
    const dateObj = new Date(localTimeStr);

    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const monthAndDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeFormatted = localTimeStr.split(' ')[1];

    document.getElementById("contentSection").innerHTML = `
        <div class="my-6 flex justify-center py-4">
            <div class="relative animate-float flex items-center justify-center">
                <img src="https:${data.current.condition.icon}" alt="${data.current.condition.text}" class="w-28 h-28 object-contain drop-shadow-lg" />
            </div>
        </div>

        <div class="mt-8">
            <h1 class="text-7xl font-light tracking-tight text-gray-900 dark:text-white">
                ${Math.round(data.current.temp_c)}<span class="text-4xl align-top font-extralight">°C</span>
            </h1>
        </div>

        <div class="mt-6 pb-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-baseline">
            <span class="text-2xl font-semibold text-gray-800 dark:text-gray-100">${data.location.name}</span>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                ${dayName}, <span class="text-gray-400 dark:text-gray-500">${monthAndDay}</span>
            </span>
        </div>

        <div class="mt-6 space-y-3">
            <div class="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <i class="fa-solid fa-cloud-sun-rain text-gray-400 dark:text-gray-500 w-5"></i>
                <span class="text-sm font-medium">${data.current.condition.text}</span>
            </div>
            <div class="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <i class="fa-regular fa-clock text-gray-400 dark:text-gray-500 w-5"></i>
                <span class="text-sm font-medium">${timeFormatted}</span>
            </div>
        </div>
    `;
}

// 2. Right Side - Today's Highlights Real-time UI
function renderHighlightsUI(data) {
    const current = data.current;
    const astronomy = data.forecast.forecastday[0].astro;
    
    // Air Quality Index (US EPA Standard) calculation
    const aqiIndex = current.air_quality ? Math.round(current.air_quality["us-epa-index"] || 0) : "N/A";
    let aqiStatus = "Good";
    if (aqiIndex > 2) aqiStatus = "Moderate";
    if (aqiIndex > 4) aqiStatus = "Unhealthy";

    const highlightsContainer = document.querySelector(".grid.grid-cols-1.md\\:grid-cols-3.gap-5");

    if (highlightsContainer) {
        highlightsContainer.innerHTML = `
            <!-- UV Index -->
            <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 border border-gray-100 dark:border-gray-700/50">
                <span class="text-xs font-semibold text-gray-400">UV Index</span>
                <div class="flex flex-col items-center my-auto">
                    <span class="text-4xl font-light text-gray-800 dark:text-gray-100">${current.uv}</span>
                </div>
                <div class="flex justify-center items-center space-x-1.5 text-[10px] text-gray-300 font-bold">
                    <span>1</span><span>2</span><span>3</span><span class="text-blue-500 dark:text-blue-400 text-sm">${current.uv}</span><span>5</span><span>6</span><span>7+</span>
                </div>
            </div>

            <!-- Wind Status -->
            <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 border border-gray-100 dark:border-gray-700/50">
                <span class="text-xs font-semibold text-gray-400">Wind Status</span>
                <div class="flex items-baseline my-auto">
                    <span class="text-4xl font-light text-gray-800 dark:text-gray-100">${current.wind_kph}</span>
                    <span class="text-xs text-gray-500 ml-1">km/h</span>
                </div>
                <div class="flex items-center text-xs text-gray-400">
                    <i class="fa-solid fa-compass mr-2 text-blue-400"></i>
                    <span>${current.wind_dir}</span>
                </div>
            </div>

            <!-- Sunrise & Sunset -->
            <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 border border-gray-100 dark:border-gray-700/50">
                <span class="text-xs font-semibold text-gray-400">Sunrise & Sunset</span>
                <div class="space-y-3 my-auto">
                    <div class="flex items-center space-x-3">
                        <i class="fa-solid fa-arrow-up text-amber-500 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-full text-xs"></i>
                        <p class="text-xs font-bold text-gray-800 dark:text-gray-200">${astronomy.sunrise}</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <i class="fa-solid fa-arrow-down text-orange-500 bg-orange-50 dark:bg-orange-900/30 p-2 rounded-full text-xs"></i>
                        <p class="text-xs font-bold text-gray-800 dark:text-gray-200">${astronomy.sunset}</p>
                    </div>
                </div>
            </div>

            <!-- Humidity -->
            <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 border border-gray-100 dark:border-gray-700/50">
                <span class="text-xs font-semibold text-gray-400">Humidity</span>
                <div class="flex items-baseline my-auto">
                    <span class="text-4xl font-light text-gray-800 dark:text-gray-100">${current.humidity}</span>
                    <span class="text-xs text-gray-500 ml-0.5">%</span>
                </div>
                <div class="flex items-center text-xs text-gray-400">
                    <i class="fa-solid fa-droplet mr-2 text-blue-400"></i>
                    <span>${current.humidity > 60 ? 'High' : 'Normal'}</span>
                </div>
            </div>

            <!-- Visibility -->
            <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 border border-gray-100 dark:border-gray-700/50">
                <span class="text-xs font-semibold text-gray-400">Visibility</span>
                <div class="flex items-baseline my-auto">
                    <span class="text-4xl font-light text-gray-800 dark:text-gray-100">${current.vis_km}</span>
                    <span class="text-xs text-gray-500 ml-1">km</span>
                </div>
                <div class="flex items-center text-xs text-gray-400">
                    <i class="fa-solid fa-eye mr-2 text-emerald-400"></i>
                    <span>${current.vis_km >= 10 ? 'Clear sky' : 'Hazy'}</span>
                </div>
            </div>

            <!-- Air Quality -->
            <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 border border-gray-100 dark:border-gray-700/50">
                <span class="text-xs font-semibold text-gray-400">Air Quality</span>
                <div class="flex items-baseline my-auto">
                    <span class="text-4xl font-light text-gray-800 dark:text-gray-100">${aqiIndex}</span>
                    <span class="text-xs text-gray-400 ml-2">US EPA</span>
                </div>
                <div class="flex items-center text-xs font-medium text-amber-500">
                    <i class="fa-solid fa-leaf mr-2"></i>
                    <span>${aqiStatus}</span>
                </div>
            </div>
        `;
    }
}

// ---------------- SEARCH ACTION ----------------
function btnsearchOnAction() {
    const searchVal = document.getElementById("testSearch").value.trim();
    if (searchVal) fetchWeatherData(searchVal);
}
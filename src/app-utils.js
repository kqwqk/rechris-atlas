import {
  MODES,
  VIEWS,
  WEATHER_ICON_FILES,
  WEATHER_CACHE_KEY,
  WEATHER_CITY_KEY,
  WMO_WEATHER_ZH
} from './app-constants.js';

export function viewFromHash() {
  const hash = window.location.hash.replace(/^#/, '');
  return VIEWS.some((item) => item.id === hash) ? hash : 'home';
}

export function applyBodyTheme(mode) {
  MODES.forEach((item) => document.body.classList.remove(item.id));
  document.body.classList.remove('light', 'leaves');
  if (mode === 'day') document.body.classList.add('light');
  if (mode === 'sunny') document.body.classList.add('light', 'leaves');
  if (['night', 'midnight', 'rain', 'snow'].includes(mode)) document.body.classList.add(mode);
}

export function syncSceneEffects(mode, effects) {
  effects?.stars?.stop?.();
  effects?.rain?.stop?.();
  effects?.snow?.stop?.();
  if (mode === 'midnight') effects?.stars?.start?.();
  if (mode === 'rain') effects?.rain?.start?.();
  if (mode === 'snow') effects?.snow?.start?.();

  const leaves = document.getElementById('leaves-video');
  if (!leaves) return;
  if (mode === 'sunny') {
    leaves.play().catch(() => {});
    return;
  }
  leaves.pause();
  leaves.currentTime = 0;
}

export function formatClock() {
  return new Date().toLocaleString('zh-CN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function weatherCodeToZh(code) {
  return WMO_WEATHER_ZH[code] !== null && WMO_WEATHER_ZH[code] !== undefined
    ? WMO_WEATHER_ZH[code]
    : '天气';
}

export function weatherCodeToIconSlug(code, isDay) {
  const night = isDay === 0 || isDay === false;
  if (code === 0 || code === 1) return night ? 'moon' : 'sun';
  if (code === 2) return night ? 'partly-cloudy-night' : 'partly-cloudy-day';
  if (code === 3 || code === 45 || code === 48) return 'clouds';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if (code === 95) return 'storm';
  if (code === 96 || code === 99) return 'hail';
  return 'clouds';
}

export function inferThemeFromWeather(code, isDay) {
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99))
    return 'rain';
  const night =
    isDay === 0 ||
    isDay === false ||
    (isDay === null && (new Date().getHours() < 6 || new Date().getHours() >= 18));
  if (code === 0 || code === 1) return night ? 'midnight' : 'sunny';
  return night ? 'night' : 'day';
}

export function weatherViewModel(data, cityName) {
  const current = data.current || {};
  const code = current.weather_code;
  const slug = weatherCodeToIconSlug(code, current.is_day);
  const pieces = [];
  if (typeof current.relative_humidity_2m === 'number')
    pieces.push(`湿度 ${current.relative_humidity_2m}%`);
  if (typeof current.wind_speed_10m === 'number')
    pieces.push(`风速 ${Math.round(current.wind_speed_10m)} km/h`);
  return {
    temp:
      typeof current.temperature_2m === 'number' ? `${Math.round(current.temperature_2m)}°` : '—',
    desc: weatherCodeToZh(code),
    meta: pieces.join(' · '),
    city: cityName || '杭州',
    icon: WEATHER_ICON_FILES[slug] || WEATHER_ICON_FILES.clouds
  };
}

export function cachedWeather() {
  try {
    const cache = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || 'null');
    if (!cache || !cache.savedAt || Date.now() - cache.savedAt > 1000 * 60 * 60 * 6) return null;
    return { ...cache, meta: cache.meta ? `${cache.meta} · 缓存` : '缓存' };
  } catch {
    return null;
  }
}

export function storedWeatherCity() {
  try {
    const city = JSON.parse(localStorage.getItem(WEATHER_CITY_KEY) || 'null');
    if (city && typeof city.lat === 'number' && typeof city.lon === 'number') return city;
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
    timezone: 'auto'
  });
  return fetchJsonWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);
}

export function geocodeCity(name) {
  const params = new URLSearchParams({ name, count: '1', language: 'zh', format: 'json' });
  return fetchJsonWithTimeout(`https://geocoding-api.open-meteo.com/v1/search?${params}`).then(
    (data) => {
      const first = data.results?.[0];
      if (!first) throw new Error('city not found');
      return {
        name: [first.name, first.admin1].filter(Boolean).join(' · ') || first.name,
        lat: first.latitude,
        lon: first.longitude
      };
    }
  );
}

function fetchJsonWithTimeout(url) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 9000);
  return fetch(url, { signal: controller.signal })
    .finally(() => window.clearTimeout(timer))
    .then((response) => {
      if (!response.ok) throw new Error('request failed');
      return response.json();
    });
}

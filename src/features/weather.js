import { useEffect, useState } from 'react';
import {
  HANGZHOU_COORDS,
  THEME_LOCK_KEY,
  WEATHER_CACHE_KEY,
  WEATHER_CITY_KEY,
  WEATHER_ICON_FILES
} from '../app-constants.js';
import {
  cachedWeather,
  fetchWeather,
  geocodeCity,
  inferThemeFromWeather,
  storedWeatherCity,
  weatherViewModel
} from '../app-utils.js';

export function useWeather({ setMode, showToast }) {
  const [weather, setWeather] = useState(
    () =>
      cachedWeather() || {
        temp: '—',
        desc: '加载中…',
        meta: '',
        city: storedWeatherCity()?.name || '杭州',
        icon: WEATHER_ICON_FILES.clouds
      }
  );

  useEffect(() => {
    let cancelled = false;
    const city = storedWeatherCity() || HANGZHOU_COORDS;
    fetchWeather(city.lat, city.lon)
      .then((data) => {
        if (cancelled) return;
        const next = weatherViewModel(data, city.name);
        setWeather(next);
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ ...next, savedAt: Date.now() }));
        if (localStorage.getItem(THEME_LOCK_KEY) !== '1') {
          setMode(inferThemeFromWeather(data.current?.weather_code, data.current?.is_day));
        }
      })
      .catch(() => {
        if (!cancelled && !cachedWeather()) {
          setWeather((current) => ({ ...current, desc: '天气获取失败', meta: '' }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [setMode]);

  const changeCity = () => {
    const current = storedWeatherCity()?.name || '杭州';
    const name = window.prompt('天气城市', current);
    if (name === null) return;
    const cityName = name.trim();
    if (!cityName) {
      localStorage.removeItem(WEATHER_CITY_KEY);
      showToast('已恢复杭州天气');
      return;
    }
    geocodeCity(cityName)
      .then((city) => {
        localStorage.setItem(WEATHER_CITY_KEY, JSON.stringify(city));
        return fetchWeather(city.lat, city.lon).then((data) => {
          const next = weatherViewModel(data, city.name);
          setWeather(next);
          localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ ...next, savedAt: Date.now() }));
          showToast('天气城市已更新');
        });
      })
      .catch(() => showToast('未找到城市'));
  };

  return { ...weather, changeCity };
}

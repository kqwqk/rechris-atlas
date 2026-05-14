import siteConfig from '../site-config.json';

export const SITE_URL = String(siteConfig.siteUrl || 'https://kqwqk.pw').replace(/\/+$/, '');

export const MODES = [
  { id: 'day', label: 'Day', hotkey: 'D' },
  { id: 'sunny', label: 'Sunny', hotkey: 'S' },
  { id: 'night', label: 'Night', hotkey: 'N' },
  { id: 'midnight', label: 'Moonlight', hotkey: 'M' },
  { id: 'rain', label: 'Rainy', hotkey: 'R' },
  { id: 'snow', label: 'Snowy', hotkey: 'W' }
];

export const VIEWS = [
  { id: 'home', label: '首页' },
  { id: 'tools', label: '收藏' },
  { id: 'life', label: '摄影' },
  { id: 'devlog', label: '开发日志' }
];

export const THEME_STORAGE_KEY = 'themeLaunchMode';
export const THEME_LOCK_KEY = 'themeManualLock';
export const WEATHER_CITY_KEY = 'themeWeatherCity';
export const WEATHER_CACHE_KEY = 'themeWeatherCache';
export const HANGZHOU_COORDS = { lat: 30.2741, lon: 120.1551, name: '杭州' };

export const CATEGORY_LABELS = {
  all: '全部',
  design: '设计',
  ai: 'AI',
  dev: '开发',
  media: '媒体',
  life: '生活',
  ops: '运维',
  other: '其他'
};

export const CATEGORY_ORDER = ['all', 'design', 'ai', 'dev', 'media', 'life', 'ops', 'other'];
export const EDITABLE_CATEGORY_IDS = CATEGORY_ORDER.filter((id) => id !== 'all');

export const WEATHER_ICON_FILES = {
  sun: 'assets/icons/weather/sun.svg',
  moon: 'assets/icons/weather/moon.svg',
  clouds: 'assets/icons/weather/cloud.svg',
  'partly-cloudy-day': 'assets/icons/weather/cloud.svg',
  'partly-cloudy-night': 'assets/icons/weather/cloud.svg',
  'fog-day': 'assets/icons/weather/cloud.svg',
  'light-rain': 'assets/icons/weather/rain.svg',
  rain: 'assets/icons/weather/rain.svg',
  'heavy-rain': 'assets/icons/weather/rain.svg',
  sleet: 'assets/icons/weather/snow.svg',
  snowflake: 'assets/icons/weather/snow.svg',
  snow: 'assets/icons/weather/snow.svg',
  storm: 'assets/icons/weather/storm.svg',
  hail: 'assets/icons/weather/hail.svg'
};

export const WMO_WEATHER_ZH = {
  0: '晴朗',
  1: '大部晴朗',
  2: '多云',
  3: '阴',
  45: '雾',
  48: '雾',
  51: '小毛毛雨',
  53: '毛毛雨',
  55: '强毛毛雨',
  56: '冻毛毛雨',
  57: '冻毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  66: '冻雨',
  67: '冻雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  77: '雪粒',
  80: '阵雨',
  81: '强阵雨',
  82: '暴雨',
  85: '阵雪',
  86: '强阵雪',
  95: '雷暴',
  96: '雷暴伴冰雹',
  99: '强雷暴冰雹'
};

export const THEME_IMAGE_FILES = {
  day: 'assets/generated/display/about-duck-day.jpg',
  sunny: 'assets/generated/display/about-duck-sunny.jpg',
  night: 'assets/generated/display/about-duck-night.jpg',
  midnight: 'assets/generated/display/about-duck-moonlight.jpg',
  rain: 'assets/generated/display/about-duck-rainy.jpg',
  snow: 'assets/generated/display/about-duck-snowy.jpg'
};

export const SITE_SHARE_IMAGE = `${SITE_URL}/${THEME_IMAGE_FILES.day}`;

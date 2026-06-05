import { useEffect, useState } from 'react';
import { MODES, THEME_IMAGE_FILES, VIEWS } from './app-constants.js';
import { formatClock } from './app-utils.js';
import { useWeather } from './features/weather.js';
import '../enhancements.css';
import '../inspiration-system.css';

export function SceneOverlays() {
  return (
    <>
      <div id="moon-overlay">
        <div className="moon-light-beam" />
        <div className="stars">
          <canvas id="stars-canvas" />
        </div>
        <div className="moon-canvas-wrap">
          <canvas id="moon-canvas" width="480" height="480" />
        </div>
      </div>
      <div id="leaves-overlay">
        <video id="leaves-video" src="assets/leaves.mp4" muted loop playsInline />
      </div>
      <div id="rain-overlay">
        <div className="rain-fog" />
        <canvas id="rain-canvas" />
      </div>
      <div id="snow-overlay">
        <div className="snow-glow" />
        <canvas id="snow-canvas" />
      </div>
    </>
  );
}

export function ModeIndicator({ mode, onMode }) {
  return (
    <div className="mode-indicator">
      {MODES.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`mode-dot ${mode === item.id ? 'active' : ''}`}
          data-mode={item.id}
          title={`${item.label} (${item.hotkey})`}
          aria-label={item.label}
          onClick={() => onMode(item.id)}
        />
      ))}
    </div>
  );
}

export function Header({ view, onView }) {
  return (
    <header className="header">
      <div className="logo">RECHRIS ATLAS</div>
      <nav className="site-nav" aria-label="站点导航">
        {VIEWS.map((item) =>
          item.external ? (
            <a
              key={item.id}
              className="nav-item"
              href={item.href}
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          ) : (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => onView(item.id)}
            >
              {item.label}
            </button>
          )
        )}
      </nav>
    </header>
  );
}

export function Hero({ mode, setMode, showToast }) {
  const clock = useClock();
  const greeting = useGreeting();
  const weather = useWeather({ setMode, showToast, mode });
  return (
    <section className="hero">
      <div className="hero-primary">
        <h1 id="greeting">{greeting}</h1>
        <p className="hero-kicker">Design Atlas · Photo Journal · Daily Systems</p>
        <p className="hero-copy">
          把收藏、作品集和生活记录收进同一个安静的界面。白天处理设计协作，夜里收藏灵感，也给日常留一点空气。
        </p>
        <p className="hero-time" id="clock" aria-live="polite">
          {clock}
        </p>
      </div>
      <aside className="hero-weather" id="hero-weather" aria-label="天气">
        <div className="weather-body">
          <div className="weather-head-row">
            <div className="weather-icon-wrap" aria-hidden="true">
              <img
                className="weather-icon"
                id="weather-icon"
                src={weather.icon}
                alt=""
                width="36"
                height="36"
                decoding="async"
              />
            </div>
            <div className="weather-text-stack">
              <div className="weather-temp" id="weather-temp">
                {weather.temp}
              </div>
              <div className="weather-desc" id="weather-desc">
                {weather.desc}
              </div>
            </div>
          </div>
          <div className="weather-meta" id="weather-meta">
            <button className="weather-city-trigger" type="button" onClick={weather.changeCity}>
              {weather.city}
            </button>
            {weather.meta ? ` · ${weather.meta}` : ''}
          </div>
        </div>
      </aside>
    </section>
  );
}

export function Home({ mode }) {
  return (
    <div
      className="about-visual home-immersive-visual"
      aria-label="生活在杭州、每天努力工作的 UI 设计师主题插画"
    >
      <img
        className="about-duck-scene"
        id="about-duck-scene"
        src={THEME_IMAGE_FILES[mode] || THEME_IMAGE_FILES.day}
        width="1200"
        height="720"
        alt="生活在杭州、每天努力工作的 UI 设计师主题插画"
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}

export function SectionHead({ title, note }) {
  return (
    <div className="section-head">
      <div className="section-title">{title}</div>
      <div className="section-note">{note}</div>
    </div>
  );
}

export function EnhancementPanel({ showToast }) {
  const [particles, setParticles] = useState(
    () => localStorage.getItem('cursorParticlesEnabled') === 'true'
  );
  return (
    <div className="enhancements-panel">
      <button
        type="button"
        className="enhancement-toggle"
        data-tooltip="智能主题"
        title="智能主题"
        onClick={() => showToast('智能主题已由天气自动处理')}
      >
        <img src="assets/icons/ui/ai.svg" alt="智能主题" className="enhancement-icon" />
      </button>
      <button
        type="button"
        className={`enhancement-toggle ${particles ? 'active' : ''}`}
        data-tooltip="光标粒子"
        title="光标粒子"
        onClick={() => {
          const next = !particles;
          setParticles(next);
          localStorage.setItem('cursorParticlesEnabled', String(next));
          showToast(next ? '光标粒子已启用' : '光标粒子已关闭');
        }}
      >
        <img src="assets/icons/ui/sparkles.svg" alt="光标粒子" className="enhancement-icon" />
      </button>
    </div>
  );
}

function useClock() {
  const [value, setValue] = useState(() => formatClock());
  useEffect(() => {
    const id = window.setInterval(() => setValue(formatClock()), 30000);
    return () => window.clearInterval(id);
  }, []);
  return value;
}

function useGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '早上好';
  if (hour >= 12 && hour < 18) return '下午好';
  if (hour >= 18 && hour < 22) return '晚上好';
  return '夜深了';
}

import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import '../styles.css';
import '../visual-enhancements.css';
import { MODES, THEME_LOCK_KEY, THEME_STORAGE_KEY, VIEWS } from './app-constants.js';
import { applyBodyTheme, syncSceneEffects, viewFromHash } from './app-utils.js';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { trackPageView, trackEvent } from './utils/performance.js';
import { updatePageMeta } from './utils/seo.js';
import {
  EnhancementPanel,
  Header,
  Hero,
  Home,
  ModeIndicator,
  SceneOverlays
} from './layout.jsx';

const PhotoJournalApp = lazy(() => import('./photo-module/main.jsx'));
const Devlog = lazy(() => import('./features/devlog.jsx').then((m) => ({ default: m.Devlog })));
const Shortcuts = lazy(() =>
  import('./features/shortcuts.jsx').then((m) => ({ default: m.Shortcuts }))
);
const Worklog = lazy(() => import('./features/worklog.jsx').then((m) => ({ default: m.Worklog })));

function App() {
  const [view, setView] = useState(() => viewFromHash());
  const [mode, setModeState] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) || 'day');
  const [toast, setToast] = useState('');
  const showToast = useToast(setToast);
  const effectsRef = useRef(null);
  const effectsLoadingRef = useRef(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    window.showToast = showToast;
    return () => {
      delete window.showToast;
    };
  }, [showToast]);

  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('view-home', view === 'home');
    VIEWS.forEach((item) => document.body.classList.toggle(`view-${item.id}`, view === item.id));
    if (window.location.hash.replace(/^#/, '') !== view) {
      window.history.replaceState(null, '', `#${view}`);
    }

    // 更新页面元数据
    updatePageMeta(view);

    // 追踪页面浏览
    const viewLabel = VIEWS.find((v) => v.id === view)?.label || view;
    trackPageView(viewLabel);
  }, [view]);

  useEffect(() => {
    return () => {
      effectsRef.current?.stars?.stop?.();
      effectsRef.current?.rain?.stop?.();
      effectsRef.current?.snow?.stop?.();
    };
  }, []);

  useEffect(() => {
    let active = true;
    modeRef.current = mode;
    applyBodyTheme(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);

    const needsCanvasEffect = ['midnight', 'rain', 'snow'].includes(mode);
    if (!needsCanvasEffect) {
      syncSceneEffects(mode, effectsRef.current);
      return undefined;
    }

    if (!effectsLoadingRef.current) {
      effectsLoadingRef.current = Promise.all([
        import('./features/canvas-effects/stars.js'),
        import('./features/canvas-effects/moon.js'),
        import('./features/canvas-effects/rain.js'),
        import('./features/canvas-effects/snow.js')
      ])
        .then(([stars, moon, rain, snow]) => {
          const effects = {
            stars: stars.createStarsEffect(),
            rain: rain.createRainEffect(),
            snow: snow.createSnowEffect()
          };
          moon.createMoonEffect();
          effectsRef.current = effects;
          return effects;
        })
        .catch(() => null);
    }

    effectsLoadingRef.current.then((effects) => {
      if (active && effects) syncSceneEffects(modeRef.current, effects);
    });

    return () => {
      active = false;
    };
  }, [mode]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      const match = MODES.find((item) => item.hotkey.toLowerCase() === event.key.toLowerCase());
      if (match) {
        localStorage.setItem(THEME_LOCK_KEY, '1');
        setModeState(match.id);
        showToast(match.label);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showToast]);

  const setMode = (nextMode, fromUser = true) => {
    if (fromUser) localStorage.setItem(THEME_LOCK_KEY, '1');
    setModeState(nextMode);
    const modeLabel = MODES.find((item) => item.id === nextMode)?.label || nextMode;
    showToast(modeLabel);

    // 追踪主题切换
    if (fromUser) {
      trackEvent('theme_change', { theme: nextMode, label: modeLabel });
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        跳转到主内容
      </a>
      <SceneOverlays />
      <ModeIndicator mode={mode} onMode={setMode} />
      <div className="page">
        <Header view={view} onView={setView} />
        <Hero mode={mode} setMode={setModeState} showToast={showToast} />
        <div className="divider" />
        <main id="main-content">
          <section
            className={`section view-panel ${view === 'home' ? 'active' : ''}`}
            data-view-panel="home"
            aria-label="首页"
          >
            <Home mode={mode} />
          </section>
          <section
            className={`section view-panel ${view === 'tools' ? 'active' : ''}`}
            data-view-panel="tools"
            aria-label="设计收藏"
          >
            {view === 'tools' && (
              <Suspense
                fallback={
                  <div className="panel-loading" role="status" aria-live="polite">
                    收藏内容加载中
                  </div>
                }
              >
                <Shortcuts showToast={showToast} />
              </Suspense>
            )}
          </section>
          <section
            className={`section view-panel ${view === 'life' ? 'active' : ''}`}
            data-view-panel="life"
            aria-label="摄影作品"
          >
            {view === 'life' && (
              <>
                <Suspense
                  fallback={
                    <div className="panel-loading" role="status" aria-live="polite">
                      摄影内容加载中
                    </div>
                  }
                >
                  <PhotoJournalApp />
                </Suspense>
              </>
            )}
          </section>
          <section
            className={`section view-panel ${view === 'work' ? 'active' : ''}`}
            data-view-panel="work"
            aria-label="工作记录"
          >
            {view === 'work' && (
              <Suspense
                fallback={
                  <div className="panel-loading" role="status" aria-live="polite">
                    工作记录加载中
                  </div>
                }
              >
                <Worklog showToast={showToast} />
              </Suspense>
            )}
          </section>
          <section
            className={`section view-panel ${view === 'devlog' ? 'active' : ''}`}
            data-view-panel="devlog"
            aria-label="开发日志"
          >
            {view === 'devlog' && (
              <Suspense
                fallback={
                  <div className="panel-loading" role="status" aria-live="polite">
                    开发日志加载中
                  </div>
                }
              >
                <Devlog />
              </Suspense>
            )}
          </section>
        </main>
        <footer className="footer">静态页面 · React · Open-Meteo · CSS Houdini</footer>
      </div>
      <div
        className={`mode-toast ${toast ? 'visible' : ''}`}
        id="toast"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toast}
      </div>
      <EnhancementPanel showToast={showToast} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

function useToast(setToast) {
  const timerRef = useRef(0);
  return (message) => {
    setToast(message);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setToast(''), 1600);
  };
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

/**
 * 性能监控工具
 * 用于追踪和报告 Web Vitals 指标
 */

export function reportWebVitals(metric) {
  const { name, value, id, rating } = metric;

  // 记录到控制台（开发环境）
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[Web Vitals] ${name}:`, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      rating,
      id
    });
  }

  // 发送到 Google Analytics（如果已配置）
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true
    });
  }

  // 发送到 Vercel Analytics（自动处理）
  // @vercel/speed-insights 会自动收集这些指标
}

/**
 * 追踪自定义事件
 */
export function trackEvent(eventName, eventData = {}) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[Event] ${eventName}:`, eventData);
  }

  // Vercel Analytics 事件追踪
  if (typeof window !== 'undefined' && window.va) {
    window.va('event', eventName, eventData);
  }

  // Google Analytics 事件追踪
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventData);
  }
}

/**
 * 追踪页面浏览
 */
export function trackPageView(pageName) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[Page View] ${pageName}`);
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.hash
    });
  }
}

/**
 * 追踪资源加载时间
 */
export function trackResourceTiming(resourceName, duration) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[Resource Timing] ${resourceName}: ${duration}ms`);
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: resourceName,
      value: Math.round(duration),
      event_category: 'Resource Loading'
    });
  }
}

/**
 * 记录错误
 */
export function logError(error, context = {}) {
  console.error('[Error]', error, context);

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error.message || error.toString(),
      fatal: context.fatal || false,
      ...context
    });
  }
}

/**
 * 与 app.js 中逻辑一致：仅使用 Icons8 CDN，按主机名匹配 slug。
 * rebuild-default-shortcuts.mjs 引用。
 */

export function shortcutHostname(rawUrl) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./i, '').toLowerCase();
  } catch (e) {
    return '';
  }
}

export function icons8SlugForShortcut(s, cfg) {
  const hosts = (cfg && cfg.hosts) || {};
  const defaultSlug = (cfg && cfg.defaultSlug) || 'internet';
  const ipRules = (cfg && cfg.ipTitleContains) || [];
  const host = shortcutHostname(s.url);

  if (!host || /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    const title = (s.title || '').toLowerCase();
    for (let i = 0; i < ipRules.length; i++) {
      const c = (ipRules[i].contains || '').toLowerCase();
      if (c && title.indexOf(c) >= 0) return ipRules[i].slug;
    }
    return defaultSlug;
  }

  if (hosts[host]) return hosts[host];

  const segments = host.split('.');
  for (let start = 1; start <= segments.length - 2; start++) {
    const parent = segments.slice(start).join('.');
    if (hosts[parent]) return hosts[parent];
  }

  return defaultSlug;
}

/** 规范地址（无填色 hex 段），与 app.js 中 icons8Color96Url 一致 */
export function icons8Color96Url(slug, cfg) {
  const bp = (cfg && cfg.basePath) || 'ios-filled/96';
  return 'https://img.icons8.com/' + bp + '/' + slug + '.png';
}

export function defaultIcons8UrlForShortcut(s, cfg) {
  return icons8Color96Url(icons8SlugForShortcut(s, cfg), cfg);
}

export function isIcons8IconUrl(u) {
  return /^https?:\/\/img\.icons8\.com\//i.test((u || '').trim());
}

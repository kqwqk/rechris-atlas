/**
 * Dev Log Module
 * Timeline visualization for project development and maintenance
 */

let devLogEntries = [];
const DEVLOG_STORAGE_KEY = 'devLogEntries';

/**
 * Initialize Dev Log module
 */
async function initDevLog() {
  await loadDevLogData();
  renderDevLog();
}

/**
 * Load dev log data from localStorage or site-content.json
 */
async function loadDevLogData() {
  // Try localStorage first
  try {
    const stored = localStorage.getItem(DEVLOG_STORAGE_KEY);
    if (stored) {
      devLogEntries = JSON.parse(stored);
      return;
    }
  } catch (e) {
    console.error('Failed to load dev log from localStorage:', e);
  }

  // Fallback to site-content.json
  try {
    const response = await fetch('site-content.json');
    const data = await response.json();

    if (data.devLog && Array.isArray(data.devLog)) {
      devLogEntries = data.devLog;
    } else {
      // Use default entries if not in JSON
      devLogEntries = getDefaultDevLogEntries();
    }

    saveToLocalStorage();
  } catch (error) {
    console.error('Failed to load dev log data:', error);
    devLogEntries = getDefaultDevLogEntries();
  }
}

/**
 * Get default dev log entries
 */
function getDefaultDevLogEntries() {
  return [
    {
      id: 'devlog-1',
      date: '2026-04-28',
      title: 'Phase 1 重构完成',
      category: 'milestone',
      description: '完成模块化架构重构，实现性能优化系统，迁移所有 Canvas 特效',
      tags: ['重构', '性能优化', 'Canvas'],
      details: [
        '创建 7 个独立模块（1,875 行代码）',
        '实现智能性能检测和自适应优化',
        '迁移 Stars/Moon/Rain/Snow 特效',
        '编写 16,000 字完整文档',
        '通过 30 个自动化测试'
      ],
      impact: 'high'
    },
    {
      id: 'devlog-2',
      date: '2026-04-28',
      title: '性能监控系统上线',
      category: 'feature',
      description: '实现实时 FPS 监控、设备检测和自动降级机制',
      tags: ['性能', '监控'],
      details: [
        '自动检测设备性能（CPU/内存/屏幕）',
        '实时 FPS 监控和历史记录',
        'FPS < 45 自动降级',
        '三种性能模式（auto/high/low）'
      ],
      impact: 'high'
    },
    {
      id: 'devlog-3',
      date: '2026-04-28',
      title: 'Canvas 特效模块化',
      category: 'refactor',
      description: '将所有 Canvas 特效从单文件拆分为独立模块',
      tags: ['Canvas', '模块化'],
      details: [
        'Stars Effect - 星空动画（200 行）',
        'Moon Effect - 月球渲染（180 行）',
        'Rain Effect - 雨滴动画（220 行）',
        'Snow Effect - 雪花动画（320 行）'
      ],
      impact: 'medium'
    },
    {
      id: 'devlog-4',
      date: '2026-04-27',
      title: '灵感收藏系统',
      category: 'feature',
      description: '实现图片上传、标签管理、灯箱预览功能',
      tags: ['灵感', 'IndexedDB'],
      details: [
        '支持拖拽上传图片',
        'IndexedDB 本地存储',
        '标签筛选和搜索',
        '灯箱预览和编辑'
      ],
      impact: 'medium'
    },
    {
      id: 'devlog-5',
      date: '2026-04-26',
      title: '主题系统优化',
      category: 'enhancement',
      description: '6 种主题模式，CSS Houdini 平滑过渡',
      tags: ['主题', 'CSS'],
      details: [
        '夜色、月光、白昼、晴朗、雨天、雪天',
        'CSS Houdini @property 颜色过渡',
        '键盘快捷键支持',
        '主题状态持久化'
      ],
      impact: 'medium'
    }
  ];
}

/**
 * Save to localStorage
 */
function saveToLocalStorage() {
  try {
    localStorage.setItem(DEVLOG_STORAGE_KEY, JSON.stringify(devLogEntries));
  } catch (e) {
    console.error('Failed to save dev log to localStorage:', e);
  }
}

/**
 * Render dev log timeline
 */
function renderDevLog() {
  const container = document.getElementById('devlog-timeline');
  if (!container) return;

  // Sort by date (newest first)
  const sorted = [...devLogEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Group by month
  const grouped = groupByMonth(sorted);

  container.innerHTML = Object.keys(grouped).map(month => {
    const entries = grouped[month];
    return `
      <div class="devlog-month">
        <div class="devlog-month-header">${month}</div>
        <div class="devlog-entries">
          ${entries.map(entry => renderDevLogEntry(entry)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Group entries by month
 */
function groupByMonth(entries) {
  const grouped = {};

  entries.forEach(entry => {
    const date = new Date(entry.date);
    const monthKey = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(entry);
  });

  return grouped;
}

/**
 * Render a single dev log entry
 */
function renderDevLogEntry(entry) {
  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

  const categoryLabels = {
    milestone: '里程碑',
    feature: '新功能',
    enhancement: '优化',
    refactor: '重构',
    bugfix: 'Bug 修复',
    maintenance: '维护'
  };

  const impactClass = entry.impact || 'medium';

  return `
    <div class="devlog-entry" data-impact="${impactClass}">
      <div class="devlog-entry-marker"></div>
      <div class="devlog-entry-content">
        <div class="devlog-entry-header">
          <div class="devlog-entry-date">${dateStr}</div>
          <div class="devlog-entry-category ${entry.category}">${categoryLabels[entry.category] || entry.category}</div>
        </div>
        <h3 class="devlog-entry-title">${escapeHtml(entry.title)}</h3>
        <p class="devlog-entry-description">${escapeHtml(entry.description)}</p>

        ${entry.details && entry.details.length > 0 ? `
          <ul class="devlog-entry-details">
            ${entry.details.map(detail => `<li>${escapeHtml(detail)}</li>`).join('')}
          </ul>
        ` : ''}

        ${entry.tags && entry.tags.length > 0 ? `
          <div class="devlog-entry-tags">
            ${entry.tags.map(tag => `<span class="devlog-tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Filter dev log by category
 */
function filterDevLog(category) {
  const container = document.getElementById('devlog-timeline');
  if (!container) return;

  const entries = container.querySelectorAll('.devlog-entry');

  if (category === 'all') {
    entries.forEach(entry => {
      entry.style.display = '';
    });
  } else {
    entries.forEach(entry => {
      const categoryEl = entry.querySelector('.devlog-entry-category');
      if (!categoryEl) return;

      const entryCategory = categoryEl.classList[1];
      entry.style.display = entryCategory === category ? '' : 'none';
    });
  }

  // Hide month headers if all entries are hidden
  const months = container.querySelectorAll('.devlog-month');
  months.forEach(month => {
    const visibleEntries = month.querySelectorAll('.devlog-entry:not([style*="display: none"])');
    month.style.display = visibleEntries.length > 0 ? '' : 'none';
  });
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initDevLog, filterDevLog };
}

// Expose globally
window.initDevLog = initDevLog;
window.filterDevLog = filterDevLog;

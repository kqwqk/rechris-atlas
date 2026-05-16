/**
 * 可访问性工具函数
 */

/**
 * 焦点陷阱 - 在模态框中锁定焦点
 * @param {HTMLElement} container - 容器元素
 * @param {boolean} isActive - 是否激活焦点陷阱
 * @returns {Function} 清理函数
 */
export function useFocusTrap(container, isActive) {
  if (!isActive || !container) return () => {};

  const focusableSelector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  const focusableElements = Array.from(container.querySelectorAll(focusableSelector));
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // 保存之前的焦点元素
  const previousActiveElement = document.activeElement;

  // 聚焦到第一个元素
  firstElement?.focus();

  const handleTab = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  document.addEventListener('keydown', handleTab);

  // 返回清理函数
  return () => {
    document.removeEventListener('keydown', handleTab);
    // 恢复之前的焦点
    if (previousActiveElement instanceof HTMLElement) {
      previousActiveElement.focus();
    }
  };
}

/**
 * ESC 键关闭处理
 * @param {Function} onClose - 关闭回调
 * @param {boolean} isActive - 是否激活
 * @returns {Function} 清理函数
 */
export function useEscapeKey(onClose, isActive) {
  if (!isActive) return () => {};

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  document.addEventListener('keydown', handleEscape);

  return () => {
    document.removeEventListener('keydown', handleEscape);
  };
}

/**
 * 键盘导航支持
 * @param {Object} options - 配置选项
 * @returns {Object} 键盘事件处理器
 */
export function useKeyboardNavigation({ onNext, onPrev, onClose, isActive }) {
  if (!isActive) return {};

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        onNext?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onPrev?.();
        break;
      case 'Escape':
        e.preventDefault();
        onClose?.();
        break;
      default:
        break;
    }
  };

  return { onKeyDown: handleKeyDown };
}

/**
 * 跳过导航链接
 * @returns {JSX.Element}
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="skip-to-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 999,
        padding: '1em',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        textDecoration: 'none',
        ':focus': {
          left: '0',
          top: '0'
        }
      }}
    >
      跳转到主内容
    </a>
  );
}

/**
 * 检查颜色对比度是否符合 WCAG AA 标准
 * @param {string} foreground - 前景色 (hex)
 * @param {string} background - 背景色 (hex)
 * @returns {Object} 对比度信息
 */
export function checkColorContrast(foreground, background) {
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;

    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: ratio.toFixed(2),
    passAA: ratio >= 4.5,
    passAAA: ratio >= 7,
    passAALarge: ratio >= 3
  };
}

/**
 * 为屏幕阅读器提供实时更新通知
 * @param {string} message - 通知消息
 * @param {string} priority - 优先级 ('polite' | 'assertive')
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * 仅对屏幕阅读器可见的样式
 */
export const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0'
};

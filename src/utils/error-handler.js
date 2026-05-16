/**
 * 错误处理工具
 */

/**
 * 应用错误基类
 */
export class AppError extends Error {
  /**
   * @param {string} message - 错误消息
   * @param {string} code - 错误代码
   * @param {Object} [context] - 错误上下文
   */
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * 网络请求错误
 */
export class NetworkError extends AppError {
  /**
   * @param {string} message - 错误消息
   * @param {Object} [context] - 错误上下文
   */
  constructor(message, context = {}) {
    super(message, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

/**
 * 数据验证错误
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message - 错误消息
   * @param {Object} [context] - 错误上下文
   */
  constructor(message, context = {}) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

/**
 * 存储错误
 */
export class StorageError extends AppError {
  /**
   * @param {string} message - 错误消息
   * @param {Object} [context] - 错误上下文
   */
  constructor(message, context = {}) {
    super(message, 'STORAGE_ERROR', context);
    this.name = 'StorageError';
  }
}

/**
 * 统一错误处理函数
 * @param {Error} error - 错误对象
 * @param {Function} [showToast] - Toast 显示函数
 * @param {Function} [trackError] - 错误追踪函数
 */
export function handleError(error, showToast, trackError) {
  console.error('Error caught:', error);

  // 追踪错误
  if (trackError && typeof trackError === 'function') {
    trackError(error);
  }

  // 显示用户友好的错误消息
  let userMessage = '发生了意外错误，请稍后重试';

  if (error instanceof NetworkError) {
    userMessage = '网络连接失败，请检查网络设置';
  } else if (error instanceof ValidationError) {
    userMessage = error.message;
  } else if (error instanceof StorageError) {
    userMessage = '数据保存失败，请检查浏览器存储权限';
  } else if (error instanceof AppError) {
    userMessage = error.message;
  }

  if (showToast && typeof showToast === 'function') {
    showToast(userMessage);
  }
}

/**
 * 安全的 JSON 解析
 * @param {string} json - JSON 字符串
 * @param {*} [defaultValue=null] - 默认值
 * @returns {*} 解析结果或默认值
 */
export function safeJsonParse(json, defaultValue = null) {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.warn('JSON parse failed:', error);
    return defaultValue;
  }
}

/**
 * 安全的 localStorage 读取
 * @param {string} key - 存储键
 * @param {*} [defaultValue=null] - 默认值
 * @returns {*} 存储值或默认值
 */
export function safeLocalStorageGet(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.warn(`localStorage get failed for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * 安全的 localStorage 写入
 * @param {string} key - 存储键
 * @param {*} value - 存储值
 * @returns {boolean} 是否成功
 */
export function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`localStorage set failed for key "${key}":`, error);
    throw new StorageError('数据保存失败', { key, error: error.message });
  }
}

/**
 * 安全的 fetch 请求
 * @param {string} url - 请求 URL
 * @param {RequestInit} [options] - fetch 选项
 * @param {number} [timeout=9000] - 超时时间（毫秒）
 * @returns {Promise<Response>} fetch 响应
 */
export async function safeFetch(url, options = {}, timeout = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new NetworkError(`请求失败: ${response.status}`, {
        url,
        status: response.status,
        statusText: response.statusText
      });
    }

    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new NetworkError('请求超时', { url, timeout });
    }
    if (error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError('网络请求失败', { url, error: error.message });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 重试函数
 * @param {Function} fn - 要重试的函数
 * @param {number} [maxRetries=3] - 最大重试次数
 * @param {number} [delay=1000] - 重试延迟（毫秒）
 * @returns {Promise<*>} 函数执行结果
 */
export async function retry(fn, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}

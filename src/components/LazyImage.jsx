import { useEffect, useRef, useState } from 'react';

/**
 * 懒加载图片组件
 * 使用 Intersection Observer 实现图片懒加载
 */
export function LazyImage({ src, alt, className, onLoad, onError, placeholder = '' }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  const handleLoad = (event) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  const handleError = (event) => {
    setIsLoaded(true);
    onError?.(event);
  };

  return (
    <img
      ref={imgRef}
      src={isInView ? src : placeholder}
      alt={alt}
      className={`${className || ''} ${isLoaded ? 'loaded' : ''}`}
      loading="lazy"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

/**
 * 懒加载背景图片组件
 */
export function LazyBackgroundImage({ src, children, className, style = {} }) {
  const [isInView, setIsInView] = useState(false);
  const divRef = useRef(null);

  useEffect(() => {
    if (!divRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    observer.observe(divRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={divRef}
      className={className}
      style={{
        ...style,
        backgroundImage: isInView ? `url(${src})` : 'none'
      }}
    >
      {children}
    </div>
  );
}

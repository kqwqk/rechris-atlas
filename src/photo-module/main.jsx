import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Panzoom from '@panzoom/panzoom';
import { PHOTO_RECORDS } from '../../photo-records-data.js';
import { trackEvent } from '../utils/performance.js';
import '../../life-records.css';
import './photo-module.css';

const STORAGE_KEY = 'rechris_life_records';

async function checkLocalEditAvailable() {
  if (!import.meta.env.DEV) return false;
  try {
    const response = await fetch('/__local-admin/status', { cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

async function savePhotoRecordToProject(record) {
  const response = await fetch('/__local-admin/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || '保存失败');
  }
  return response.json();
}

function getFileRecords() {
  return Array.isArray(PHOTO_RECORDS) ? PHOTO_RECORDS.map((record) => ({ ...record })) : [];
}

function isLegacyDefaultRecord(record) {
  return (
    record &&
    ['life-001', 'life-002', 'life-003', 'life-004', 'life-005'].includes(record.id) &&
    !record.createdAt
  );
}

function getStoredRecords() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const records = value ? JSON.parse(value) : [];
    return Array.isArray(records) ? records.filter((record) => !isLegacyDefaultRecord(record)) : [];
  } catch {
    return [];
  }
}

function getRecords() {
  const fileRecords = getFileRecords();
  const fileIds = new Set(fileRecords.map((record) => record.id));
  const localRecords = getStoredRecords().filter((record) => !fileIds.has(record.id));
  return [...localRecords, ...fileRecords];
}

function getPublishedTime(record) {
  const value = record.publishedAt || record.updatedAt || record.createdAt;
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortRecordsByFreshness(records) {
  return records
    .map((record, index) => ({ record, index }))
    .sort((a, b) => {
      const timeDiff = getPublishedTime(b.record) - getPublishedTime(a.record);
      if (timeDiff !== 0) return timeDiff;
      return b.index - a.index;
    })
    .map(({ record }) => record);
}

function getPreviewImage(record, index, fallback) {
  return [record.thumbnails?.[index], record.images?.[index], fallback].find(Boolean);
}

function getOriginalImage(record, index, fallback) {
  return [record.images?.[index], fallback].find(Boolean);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today - recordDate) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays === 2) return '前天';
  if (diffDays < 7) return `${diffDays}天前`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDetailTime(record) {
  const parts = [];
  if (record.date) {
    const date = new Date(record.date);
    if (!Number.isNaN(date.getTime())) {
      parts.push(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`);
    }
  }
  if (record.time) parts.push(record.time);
  return parts.join(' ') || '未记录';
}

function formatExifDate(value) {
  if (!value) return '';
  const date =
    value instanceof Date
      ? value
      : new Date(String(value).replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatDisplayValue(value) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date) return formatExifDate(value);
  if (Array.isArray(value)) return value.map(formatDisplayValue).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(
        ([, entryValue]) =>
          entryValue !== null &&
          entryValue !== undefined &&
          entryValue !== '' &&
          typeof entryValue !== 'object'
      )
      .map(([key, entryValue]) => `${key}: ${entryValue}`)
      .join(' · ');
  }
  return String(value);
}

function parseLensFallback(lens = '') {
  const text = String(lens || '');
  return {
    focal: text.match(/(\d+(?:\.\d+)?)\s*mm/i)?.[0] || '',
    aperture: text.match(/f\/?\s*(\d+(?:\.\d+)?)/i)?.[0]?.replace(/\s+/g, '') || '',
    iso: text.match(/ISO\s*(\d+)/i)?.[1] || '',
    shutter: text.match(/(?:^|[ ·])(\d+\/\d+\s*s?|\d+(?:\.\d+)?\s*s)(?:$|[ ·])/i)?.[1] || ''
  };
}

function mergeExif(record, exifData) {
  const fallback = parseLensFallback(record.lens);
  return {
    aperture: exifData?.aperture || fallback.aperture,
    shutter: exifData?.shutter || fallback.shutter,
    iso: exifData?.iso || fallback.iso,
    focal: exifData?.focal || fallback.focal,
    camera: exifData?.camera || record.camera || '',
    lens: exifData?.lens || record.lens || '',
    dateTime: exifData?.dateTime || '',
    exposureMode: exifData?.exposureMode || '',
    exposureProgram: exifData?.exposureProgram || '',
    meteringMode: exifData?.meteringMode || '',
    whiteBalance: exifData?.whiteBalance || '',
    exposureBias: exifData?.exposureBias || '',
    flash: exifData?.flash || '',
    colorSpace: exifData?.colorSpace || '',
    software: exifData?.software || '',
    gps: exifData?.gps || null
  };
}

export default function PhotoJournalApp() {
  const [records, setRecords] = useState(getRecords);
  const [activePhoto, setActivePhoto] = useState(null);
  const [localEditEnabled, setLocalEditEnabled] = useState(false);

  useEffect(() => {
    checkLocalEditAvailable().then(setLocalEditEnabled);
  }, []);

  const displayRecords = useMemo(
    () => sortRecordsByFreshness(records.filter((record) => record.images?.length)),
    [records]
  );

  return (
    <>
      <div className="life-grid" aria-label="摄影发布">
        {displayRecords.length === 0 ? (
          <div className="life-empty">
            <div className="life-empty-text">还没有发布照片，先上传一组画面吧</div>
          </div>
        ) : (
          displayRecords.map((record) => (
            <PhotoCard
              key={record.id}
              record={record}
              photoOnly
              onOpen={(index) => setActivePhoto({ record, index })}
            />
          ))
        )}
      </div>

      {activePhoto && (
        <PhotoDetailModal
          record={activePhoto.record}
          imageIndex={activePhoto.index}
          onClose={() => setActivePhoto(null)}
          localEditEnabled={localEditEnabled}
          onSaveRecord={(nextRecord) => {
            setRecords((current) =>
              current.map((record) => (record.id === nextRecord.id ? nextRecord : record))
            );
            setActivePhoto((current) =>
              current && current.record.id === nextRecord.id
                ? { ...current, record: nextRecord }
                : current
            );
          }}
        />
      )}
    </>
  );
}

function PhotoCard({ record, photoOnly, onOpen }) {
  const dateText = formatDate(record.date);
  const images = record.images || [];

  return (
    <article
      className={`life-card ${photoOnly ? 'life-card--photo-only' : ''}`}
      data-id={record.id}
    >
      <div className={`life-card-images life-card-images-${Math.min(images.length, 3)}`}>
        {images.slice(0, 9).map((image, index) => {
          const preview = getPreviewImage(record, index, image);
          const label = record.title ? `打开照片：${record.title}` : `打开照片 ${index + 1}`;
          return (
            <button
              key={`${record.id}-${index}`}
              type="button"
              className="photo-card-button"
              aria-label={label}
              onClick={() => {
                onOpen(index);
                trackEvent('photo_open', {
                  photo_id: record.id,
                  photo_title: record.title || 'untitled',
                  index
                });
              }}
            >
              <img
                src={preview}
                alt={record.title || ''}
                className="life-card-image photo-card-image"
                loading="lazy"
                onLoad={(event) => event.currentTarget.classList.add('loaded')}
                onError={(event) => event.currentTarget.classList.add('loaded')}
              />
            </button>
          );
        })}
      </div>

      {!photoOnly && (
        <>
          <div className="life-card-header">
            <div className="life-card-type">
              <span className="life-card-type-label">{record.type || 'PHOTO'}</span>
            </div>
            <div className="life-card-date">{dateText}</div>
          </div>
          <div className="life-card-body">
            <h3 className="life-card-title">{record.title}</h3>
            <p className="life-card-content">{record.content}</p>
            {record.tags?.length ? (
              <div className="life-card-tags">
                {record.tags.map((tag) => (
                  <span key={tag} className="life-card-tag">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </>
      )}
    </article>
  );
}

function PhotoDetailModal({ record, imageIndex, onClose, localEditEnabled, onSaveRecord }) {
  const viewportRef = useRef(null);
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const panzoomRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 1, height: 1 });
  const [scale, setScale] = useState(1);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    title: record.title || '',
    content: record.content || '',
    date: record.date || '',
    time: record.time || '',
    location: record.location || '',
    lens: record.lens || ''
  });

  const fallback = record.images[imageIndex];
  const originalSrc = getOriginalImage(record, imageIndex, fallback);
  const previewSrc = getPreviewImage(record, imageIndex, fallback);
  const exifData =
    record.exif && typeof record.exif === 'object' && Object.keys(record.exif).length
      ? record.exif
      : null;
  const exifStatus = exifData ? 'ready' : 'unavailable';
  const merged = mergeExif(record, exifData);

  useEffect(() => {
    setLoaded(false);
    setNaturalSize(null);
    setStageSize({ width: 1, height: 1 });
    setScale(1);
    setEditing(false);
    setDraft({
      title: record.title || '',
      content: record.content || '',
      date: record.date || '',
      time: record.time || '',
      location: record.location || '',
      lens: record.lens || ''
    });
    panzoomRef.current?.destroy();
    panzoomRef.current = null;
  }, [
    originalSrc,
    record.title,
    record.content,
    record.date,
    record.time,
    record.location,
    record.lens
  ]);

  const saveDraft = async () => {
    const nextRecord = {
      ...record,
      title: draft.title.trim() || record.title || '未命名照片',
      content: draft.content.trim(),
      date: draft.date.trim(),
      time: draft.time.trim(),
      location: draft.location.trim(),
      lens: draft.lens.trim()
    };
    setSaving(true);
    try {
      await savePhotoRecordToProject(nextRecord);
      onSaveRecord(nextRecord);
      setEditing(false);
      window.showToast?.('照片信息已写入项目文件');
    } catch (error) {
      window.showToast?.(error.message || '照片信息保存失败');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    document.body.classList.add('life-detail-open');
    const handleKeydown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.body.classList.remove('life-detail-open');
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [onClose]);

  useEffect(() => {
    return () => {
      panzoomRef.current?.destroy();
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const computeFitStage = () => {
    const viewport = viewportRef.current;
    if (!viewport || !naturalSize) return { width: 1, height: 1, fitScale: 1 };
    const widthScale = viewport.clientWidth / naturalSize.width;
    const heightScale = viewport.clientHeight / naturalSize.height;
    const fitScale = Math.min(widthScale, heightScale, 1);
    return {
      width: Math.max(1, Math.round(naturalSize.width * fitScale)),
      height: Math.max(1, Math.round(naturalSize.height * fitScale)),
      fitScale
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fitImage = (animate = true) => {
    const next = computeFitStage();
    setStageSize({ width: next.width, height: next.height });
    window.requestAnimationFrame(() => {
      panzoomRef.current?.reset({ animate });
      setScale(1);
    });
  };

  const zoomActual = () => {
    if (!panzoomRef.current || !naturalSize) return;
    const fit = computeFitStage();
    const actualScale = Math.max(naturalSize.width / fit.width, naturalSize.height / fit.height);
    panzoomRef.current.zoom(actualScale, { animate: true });
    setScale(actualScale);
    trackEvent('photo_zoom', { zoom_level: '1:1', photo_id: record.id });
  };

  useEffect(() => {
    if (!loaded || !naturalSize || !viewportRef.current || !stageRef.current) return undefined;

    const fit = computeFitStage();
    setStageSize({ width: fit.width, height: fit.height });

    const stage = stageRef.current;
    panzoomRef.current?.destroy();
    const panzoom = Panzoom(stage, {
      minScale: 1,
      maxScale: Math.max(6, Math.ceil(1 / fit.fitScale) * 2),
      step: 0.28,
      cursor: 'grab',
      startScale: 1,
      animate: true
    });
    panzoomRef.current = panzoom;

    const viewport = viewportRef.current;
    const wheelHandler = panzoom.zoomWithWheel;
    const changeHandler = (event) => setScale(event.detail.scale || panzoom.getScale());
    viewport.addEventListener('wheel', wheelHandler, { passive: false });
    stage.addEventListener('panzoomchange', changeHandler);

    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = new ResizeObserver(() => fitImage(false));
    resizeObserverRef.current.observe(viewport);

    window.requestAnimationFrame(() => fitImage(false));

    return () => {
      viewport.removeEventListener('wheel', wheelHandler);
      stage.removeEventListener('panzoomchange', changeHandler);
      resizeObserverRef.current?.disconnect();
      panzoom.destroy();
      if (panzoomRef.current === panzoom) panzoomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, naturalSize?.width, naturalSize?.height, computeFitStage, fitImage, naturalSize]);

  const modal = (
    <div
      className="photo-detail-panel active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-detail-title"
    >
      <button
        className="life-detail-backdrop"
        type="button"
        onClick={onClose}
        aria-label="关闭照片详情"
      />
      <div className="photo-detail-shell">
        <button
          className="life-detail-close"
          type="button"
          onClick={onClose}
          aria-label="关闭照片详情"
        />
        <div
          className="photo-viewer-media"
          style={{
            '--photo-aspect-ratio': naturalSize
              ? `${naturalSize.width} / ${naturalSize.height}`
              : '3 / 2'
          }}
        >
          <div
            className={`photo-viewer-viewport ${loaded ? 'is-loaded' : 'is-loading'}`}
            ref={viewportRef}
          >
            <img className="photo-viewer-preview" src={previewSrc} alt="" aria-hidden="true" />
            <div
              className="photo-viewer-stage"
              ref={stageRef}
              style={{ width: `${stageSize.width}px`, height: `${stageSize.height}px` }}
            >
              <img
                ref={imageRef}
                className="photo-viewer-image"
                src={originalSrc}
                alt={record.title || '照片详情'}
                draggable={false}
                onLoad={(event) => {
                  const image = event.currentTarget;
                  setNaturalSize({ width: image.naturalWidth, height: image.naturalHeight });
                  setLoaded(true);
                }}
              />
            </div>
            {!loaded && (
              <div className="photo-viewer-loader">
                <span className="photo-viewer-loader-bar" />
              </div>
            )}
          </div>
          <div className="photo-viewer-toolbar" aria-label="图片缩放控制">
            <button type="button" onClick={() => panzoomRef.current?.zoomOut()}>
              -
            </button>
            <button type="button" onClick={() => fitImage(true)}>
              FIT
            </button>
            <button type="button" onClick={zoomActual}>
              1:1
            </button>
            <button type="button" onClick={() => panzoomRef.current?.zoomIn()}>
              +
            </button>
          </div>
          <div className="photo-viewer-scale">{scale.toFixed(1)}x</div>
        </div>
        <PhotoInfoPanel
          record={record}
          merged={merged}
          exifStatus={exifStatus}
          localEditEnabled={localEditEnabled}
          editing={editing}
          saving={saving}
          draft={draft}
          onDraftChange={setDraft}
          onEdit={() => setEditing(true)}
          onCancelEdit={() => {
            setDraft({
              title: record.title || '',
              content: record.content || '',
              date: record.date || '',
              time: record.time || '',
              location: record.location || '',
              lens: record.lens || ''
            });
            setEditing(false);
          }}
          onSave={saveDraft}
        />
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function PhotoInfoPanel({
  record,
  merged,
  exifStatus,
  localEditEnabled,
  editing,
  saving,
  draft,
  onDraftChange,
  onEdit,
  onCancelEdit,
  onSave
}) {
  const statusText =
    {
      loading: 'EXIF 读取中',
      ready: 'EXIF 已读取',
      unavailable: 'EXIF 不可用'
    }[exifStatus] || '';

  const parameterCards = [
    ['光圈', merged.aperture || '未记录', 'A'],
    ['快门', merged.shutter || '未记录', 'S'],
    ['ISO', merged.iso ? `ISO ${merged.iso}` : '未记录', 'I'],
    ['焦距', merged.focal || '未记录', 'F']
  ];

  const gpsRows = merged.gps
    ? [
        ['纬度', merged.gps.latitude],
        ['经度', merged.gps.longitude]
      ].filter(([, value]) => value)
    : [];
  const basicRows = [
    ['拍摄时间', merged.dateTime || formatDetailTime(record)],
    ['地点', record.location || '未记录'],
    ...gpsRows
  ];
  const deviceRows = [
    ['相机', merged.camera || '未记录'],
    ['镜头', merged.lens || '未记录']
  ];

  return (
    <aside className="photo-detail-info">
      <div className="life-detail-header">
        <div className="life-detail-kicker">
          {(record.type || 'PHOTO').toUpperCase()} · {statusText}
        </div>
        <h3 className="life-detail-title" id="photo-detail-title">
          {record.title || '未命名照片'}
        </h3>
        {!editing && record.content ? (
          <p className="life-detail-summary">{record.content}</p>
        ) : null}
        {localEditEnabled && !editing ? (
          <button className="photo-local-edit-btn" type="button" onClick={onEdit}>
            编辑信息
          </button>
        ) : null}
      </div>
      {editing ? (
        <form
          className="photo-local-edit-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <label>
            <span>名称</span>
            <input
              value={draft.title}
              onChange={(event) =>
                onDraftChange((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>
          <label>
            <span>说明</span>
            <textarea
              rows="4"
              value={draft.content}
              onChange={(event) =>
                onDraftChange((current) => ({ ...current, content: event.target.value }))
              }
            />
          </label>
          <div className="photo-local-edit-row">
            <label>
              <span>日期</span>
              <input
                type="date"
                value={draft.date}
                onChange={(event) =>
                  onDraftChange((current) => ({ ...current, date: event.target.value }))
                }
              />
            </label>
            <label>
              <span>时间</span>
              <input
                type="time"
                value={draft.time}
                onChange={(event) =>
                  onDraftChange((current) => ({ ...current, time: event.target.value }))
                }
              />
            </label>
          </div>
          <label>
            <span>地点</span>
            <input
              value={draft.location}
              placeholder="例如：杭州 · 曲院风荷"
              onChange={(event) =>
                onDraftChange((current) => ({ ...current, location: event.target.value }))
              }
            />
          </label>
          <label>
            <span>镜头</span>
            <input
              value={draft.lens}
              placeholder="例如：NIKKOR Z 24-120mm f/4 S"
              onChange={(event) =>
                onDraftChange((current) => ({ ...current, lens: event.target.value }))
              }
            />
          </label>
          <div className="photo-local-edit-actions">
            <button type="button" onClick={onCancelEdit} disabled={saving}>
              取消
            </button>
            <button type="submit" disabled={saving}>
              {saving ? '保存中' : '保存到项目文件'}
            </button>
          </div>
        </form>
      ) : null}
      <div className="life-param-grid">
        {parameterCards.map(([label, value, icon]) => (
          <div className="life-param-card" key={label}>
            <span className="life-param-icon">{icon}</span>
            <span className="life-param-label">{label}</span>
            <strong className="life-param-value">{value}</strong>
          </div>
        ))}
      </div>
      <InfoSection title="基本信息" rows={basicRows} />
      <InfoSection title="设备信息" rows={deviceRows} />
    </aside>
  );
}

function InfoSection({ title, rows }) {
  return (
    <section className="life-detail-section">
      <h4>{title}</h4>
      <dl className="life-detail-meta">
        {rows.map(([label, value]) => (
          <div className="life-detail-meta-row" key={label}>
            <dt>{label}</dt>
            <dd>{formatDisplayValue(value) || '未记录'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import defaultShortcuts from '../../default-shortcuts.json';
import { CATEGORY_LABELS, CATEGORY_ORDER, EDITABLE_CATEGORY_IDS } from '../app-constants.js';

export function Shortcuts({ showToast }) {
  const [shortcuts, setShortcuts] = useState(() => readDefaultShortcuts());
  const [category, setCategory] = useState('all');
  const [sortMode, setSortMode] = useState(
    () => localStorage.getItem('shortcutsSortMode') || 'default'
  );
  const [localEdit, setLocalEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [dragId, setDragId] = useState('');
  const importInputRef = useRef(null);

  useEffect(() => {
    checkLocalEditAvailable().then((ok) => {
      setLocalEdit(ok);
      document.body.classList.toggle('local-edit-enabled', ok);
    });
  }, []);

  const categories = useMemo(() => {
    const used = new Set(shortcuts.map(shortcutCategory));
    return CATEGORY_ORDER.filter((id) => id === 'all' || used.has(id));
  }, [shortcuts]);

  const visible = useMemo(() => {
    let list =
      category === 'all'
        ? shortcuts
        : shortcuts.filter((item) => shortcutCategory(item) === category);
    if (sortMode === 'name') {
      list = [...list].sort((a, b) => shortcutLabel(a).localeCompare(shortcutLabel(b), 'zh-CN'));
    }
    return list;
  }, [shortcuts, category, sortMode]);

  const grouped = useMemo(() => {
    return visible.reduce((acc, item) => {
      const key = shortcutCategory(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [visible]);

  const saveProject = async (next) => {
    setShortcuts(next);
    if (!localEdit) return;
    try {
      const response = await fetch('/__local-admin/shortcuts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortcuts: next })
      });
      if (!response.ok) throw new Error('save failed');
      showToast('已写入项目文件');
    } catch {
      showToast('项目文件保存失败');
    }
  };

  const onDrop = (targetId) => {
    if (!dragId || dragId === targetId) return;
    const from = shortcuts.findIndex((item) => item.id === dragId);
    const to = shortcuts.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...shortcuts];
    const [item] = next.splice(from, 1);
    next.splice(from < to ? to - 1 : to, 0, item);
    saveProject(next);
  };

  const exportShortcuts = () => {
    const blob = new Blob([JSON.stringify(shortcuts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rechris-shortcuts.json';
    link.click();
    URL.revokeObjectURL(url);
    showToast('收藏数据已导出');
  };

  const importShortcuts = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data)) throw new Error('invalid');
      await saveProject(data);
      showToast(`已导入 ${data.length} 个收藏`);
    } catch {
      showToast('导入文件格式不正确');
    } finally {
      event.target.value = '';
    }
  };

  const submitShortcut = (draft) => {
    const normalized = normalizeUrl(draft.url);
    if (!normalized) {
      showToast('请填写有效网址');
      return;
    }
    const nextItem = {
      id: draft.id || `bm-${Date.now()}`,
      title: draft.title.trim(),
      url: normalized,
      iconEmoji: draft.iconEmoji.trim() || '·',
      iconUrl: draft.iconUrl.trim(),
      iconDataUrl: draft.iconDataUrl || '',
      category: EDITABLE_CATEGORY_IDS.includes(draft.category)
        ? draft.category
        : shortcutCategory(draft)
    };
    const next = draft.id
      ? shortcuts.map((item) => (item.id === draft.id ? nextItem : item))
      : [...shortcuts, nextItem];
    saveProject(next);
    setEditing(null);
  };

  const deleteShortcut = (id) => {
    const next = shortcuts.filter((item) => item.id !== id);
    saveProject(next);
    setEditing(null);
  };

  return (
    <>
      <div className="section-head section-head--tools">
        <div className="tool-filters" role="tablist" aria-label="收藏分类">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`tool-filter ${category === item ? 'active' : ''}`}
              onClick={() => setCategory(item)}
            >
              {CATEGORY_LABELS[item] || item}
            </button>
          ))}
        </div>
        <div className="tools-actions">
          <button
            type="button"
            className="tools-sort-btn"
            onClick={() => {
              const next = sortMode === 'default' ? 'name' : 'default';
              setSortMode(next);
              localStorage.setItem('shortcutsSortMode', next);
            }}
          >
            排序
          </button>
          {localEdit && (
            <>
              <button
                type="button"
                className="tools-export-btn local-edit-only"
                onClick={exportShortcuts}
              >
                导出
              </button>
              <button
                type="button"
                className="tools-import-btn local-edit-only"
                onClick={() => importInputRef.current?.click()}
              >
                导入
              </button>
              <button
                type="button"
                className="tools-add-link local-edit-only"
                onClick={() => setEditing(emptyShortcut(category === 'all' ? 'other' : category))}
              >
                新增
              </button>
            </>
          )}
        </div>
      </div>
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={importShortcuts}
      />
      {!visible.length ? (
        <div className="launch-empty">暂无快捷方式</div>
      ) : (
        <div className="launch-grid" role="navigation" aria-label="快捷方式网格，可拖动调整顺序">
          {(category === 'all' ? CATEGORY_ORDER.filter((id) => id !== 'all') : [category]).map(
            (groupId) => {
              const items = grouped[groupId] || [];
              if (!items.length) return null;
              return (
                <section className="launch-group" key={groupId}>
                  <div className="launch-group-head">
                    <div className="launch-group-title">{CATEGORY_LABELS[groupId] || groupId}</div>
                    <div className="tool-group-count">{String(items.length).padStart(2, '0')}</div>
                  </div>
                  <div className="launch-group-grid">
                    {items.map((item) => (
                      <ShortcutTile
                        key={item.id}
                        item={item}
                        canEdit={localEdit}
                        onEdit={() => setEditing(item)}
                        onDragStart={() => setDragId(item.id)}
                        onDrop={() => onDrop(item.id)}
                      />
                    ))}
                  </div>
                </section>
              );
            }
          )}
        </div>
      )}
      {editing && (
        <ShortcutEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={submitShortcut}
          onDelete={editing.id ? deleteShortcut : null}
        />
      )}
    </>
  );
}

function ShortcutTile({ item, canEdit, onEdit, onDragStart, onDrop }) {
  const label = shortcutLabel(item);
  const icon = item.iconDataUrl || item.iconUrl;
  return (
    <button
      type="button"
      className="launch-tile"
      draggable
      title={canEdit ? '单击打开 · 拖动排序 · 右键编辑' : '单击打开'}
      onClick={() => window.open(normalizeUrl(item.url), '_blank', 'noopener,noreferrer')}
      onContextMenu={(event) => {
        if (!canEdit) return;
        event.preventDefault();
        onEdit();
      }}
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
    >
      <div className="launch-icon">
        {icon ? (
          <img
            className={isMonochromeShortcutIcon(icon) ? 'is-monochrome-icon' : undefined}
            src={icon}
            alt=""
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : (
          item.iconEmoji || '·'
        )}
      </div>
      <div className="launch-name">{label}</div>
    </button>
  );
}

function ShortcutEditor({ initial, onClose, onSubmit, onDelete }) {
  const [draft, setDraft] = useState({
    id: initial.id || '',
    title: initial.title || '',
    url: initial.url || '',
    iconEmoji: initial.iconEmoji || '·',
    iconUrl: initial.iconUrl || '',
    iconDataUrl: initial.iconDataUrl || '',
    category: initial.category || shortcutCategory(initial)
  });
  return (
    <div className="edit-panel open" aria-hidden="false">
      <button className="edit-panel-backdrop" type="button" onClick={onClose} aria-label="关闭" />
      <div
        className="edit-panel-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-edit-title"
      >
        <div className="edit-panel-header">
          <h2 id="shortcut-edit-title" className="edit-title">
            {draft.id ? '编辑快捷方式' : '新增快捷方式'}
          </h2>
          <button type="button" className="ghost-btn" onClick={() => onSubmit(draft)}>
            保存
          </button>
        </div>
        <p className="edit-hint">React 本地编辑模式会把收藏写回项目文件，名称和网址必填。</p>
        <form
          className="shortcut-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(draft);
          }}
        >
          <label className="shortcut-form-label">名称</label>
          <input
            className="shortcut-form-input"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          />
          <label className="shortcut-form-label">网址</label>
          <input
            className="shortcut-form-input"
            value={draft.url}
            onChange={(event) => setDraft({ ...draft, url: event.target.value })}
          />
          <label className="shortcut-form-label">分类</label>
          <select
            className="shortcut-form-input"
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value })}
          >
            {EDITABLE_CATEGORY_IDS.map((id) => (
              <option key={id} value={id}>
                {CATEGORY_LABELS[id] || id}
              </option>
            ))}
          </select>
          <label className="shortcut-form-label">Emoji 图标</label>
          <input
            className="shortcut-form-input"
            value={draft.iconEmoji}
            onChange={(event) => setDraft({ ...draft, iconEmoji: event.target.value })}
          />
          <label className="shortcut-form-label">图片地址</label>
          <input
            className="shortcut-form-input"
            value={draft.iconUrl}
            onChange={(event) => setDraft({ ...draft, iconUrl: event.target.value })}
          />
          <div className="shortcut-form-actions">
            <button type="submit" className="ghost-btn">
              保存
            </button>
            {onDelete && (
              <button type="button" className="ghost-btn danger" onClick={() => onDelete(draft.id)}>
                删除此项
              </button>
            )}
            <button type="button" className="ghost-btn" onClick={onClose}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function readDefaultShortcuts() {
  return Array.isArray(defaultShortcuts) ? defaultShortcuts : [];
}

async function checkLocalEditAvailable() {
  if (!import.meta.env.DEV) return false;
  try {
    const response = await fetch('/__local-admin/status', { cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

function shortcutLabel(shortcut) {
  if (shortcut.title?.trim()) return shortcut.title.trim();
  try {
    return new URL(normalizeUrl(shortcut.url)).hostname.replace(/^www\./, '');
  } catch {
    return '未命名';
  }
}

function isMonochromeShortcutIcon(value = '') {
  const text = String(value).toLowerCase();
  return text.includes('img.icons8.com/ios-filled') || text.includes('img.icons8.com/ios-glyphs');
}

function normalizeUrl(value = '') {
  const text = String(value).trim();
  if (!text) return '';
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
}

function shortcutCategory(shortcut) {
  if (shortcut.category && EDITABLE_CATEGORY_IDS.includes(shortcut.category))
    return shortcut.category;
  const text = `${shortcut.title || ''} ${shortcut.url || ''}`.toLowerCase();
  if (/figma|iconfont|pinterest|freepik|recraft|lovart|color|palette|设计|素材/.test(text))
    return 'design';
  if (/ai|chatgpt|gemini|grok|minimax|bot|agent|meshy|人工智能/.test(text)) return 'ai';
  if (/github|vercel|xda|cloud|server|host|vpn|api|dev|code/.test(text)) return 'dev';
  if (/gif|mp3|music|download|video|ncm|tts|语音|音乐|压缩/.test(text)) return 'media';
  if (/tennis|giffgaff|sim|paywall|rocket|丘|网球/.test(text)) return 'life';
  if (/禅道|task|workflow|chandao/.test(text)) return 'ops';
  return 'other';
}

function emptyShortcut(category = 'other') {
  return { title: '', url: '', iconEmoji: '·', iconUrl: '', iconDataUrl: '', category };
}

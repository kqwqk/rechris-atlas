// ═══════════════════════════════════════════════════════════════
// Inspiration System - 灵感收藏系统
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ── IndexedDB Setup ──
  const DB_NAME = 'InspirationDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'inspirations';
  let db = null;

  // Initialize IndexedDB
  function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
      };
    });
  }

  // ── Data Operations ──
  function addInspiration(data) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function getAllInspirations() {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function updateInspiration(id, data) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ ...data, id });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function deleteInspiration(id) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ── State ──
  let inspirations = [];
  let currentFilter = 'all';
  let editingId = null;

  // ── DOM Elements ──
  const uploadZone = document.getElementById('inspiration-upload-zone');
  const fileInput = document.getElementById('inspiration-file-input');
  const grid = document.getElementById('inspiration-grid');
  const emptyState = document.getElementById('inspiration-empty');
  const filtersContainer = document.getElementById('inspiration-filters');
  const lightbox = document.getElementById('inspiration-lightbox');
  const editPanel = document.getElementById('inspiration-edit-panel');

  // ── Upload Handling ──
  uploadZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
  });

  // Drag & Drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast('只支持图片文件');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast('图片大小不能超过 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;

        // Create thumbnail
        const thumbnail = await createThumbnail(imageData);

        const inspiration = {
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: '',
          tags: [],
          imageData: imageData,
          thumbnail: thumbnail,
          createdAt: Date.now()
        };

        try {
          await addInspiration(inspiration);
          await loadInspirations();
          showToast('上传成功');
        } catch (error) {
          console.error('Upload error:', error);
          showToast('上传失败');
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function createThumbnail(imageData) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxWidth = 400;
        const maxHeight = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }

  // ── Render Functions ──
  async function loadInspirations() {
    try {
      inspirations = await getAllInspirations();
      inspirations.sort((a, b) => b.createdAt - a.createdAt);
      renderFilters();
      renderGrid();
    } catch (error) {
      console.error('Load error:', error);
    }
  }

  function renderFilters() {
    const allTags = new Set();
    inspirations.forEach(item => {
      item.tags.forEach(tag => allTags.add(tag));
    });

    const filterLabel = filtersContainer.querySelector('.filter-label');
    filtersContainer.innerHTML = '';
    filtersContainer.appendChild(filterLabel);

    const allFilter = document.createElement('div');
    allFilter.className = 'filter-tag' + (currentFilter === 'all' ? ' active' : '');
    allFilter.textContent = '全部';
    allFilter.dataset.tag = 'all';
    allFilter.addEventListener('click', () => filterByTag('all'));
    filtersContainer.appendChild(allFilter);

    Array.from(allTags).sort().forEach(tag => {
      const tagEl = document.createElement('div');
      tagEl.className = 'filter-tag' + (currentFilter === tag ? ' active' : '');
      tagEl.textContent = tag;
      tagEl.dataset.tag = tag;
      tagEl.addEventListener('click', () => filterByTag(tag));
      filtersContainer.appendChild(tagEl);
    });
  }

  function filterByTag(tag) {
    currentFilter = tag;
    renderFilters();
    renderGrid();
  }

  function renderGrid() {
    const filtered = currentFilter === 'all'
      ? inspirations
      : inspirations.filter(item => item.tags.includes(currentFilter));

    if (filtered.length === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    grid.innerHTML = '';

    filtered.forEach(item => {
      const card = createCard(item);
      grid.appendChild(card);
    });
  }

  function createCard(item) {
    const card = document.createElement('div');
    card.className = 'inspiration-card';

    const img = document.createElement('img');
    img.className = 'inspiration-card-image';
    img.src = item.thumbnail || item.imageData;
    img.alt = item.title;
    img.loading = 'lazy';

    const content = document.createElement('div');
    content.className = 'inspiration-card-content';

    const title = document.createElement('div');
    title.className = 'inspiration-card-title';
    title.textContent = item.title || '未命名';

    const desc = document.createElement('div');
    desc.className = 'inspiration-card-desc';
    desc.textContent = item.description || '暂无描述';

    const tags = document.createElement('div');
    tags.className = 'inspiration-card-tags';
    item.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'inspiration-tag';
      tagEl.textContent = tag;
      tagEl.addEventListener('click', (e) => {
        e.stopPropagation();
        filterByTag(tag);
      });
      tags.appendChild(tagEl);
    });

    const meta = document.createElement('div');
    meta.className = 'inspiration-card-meta';
    const date = new Date(item.createdAt);
    meta.textContent = date.toLocaleDateString('zh-CN');

    const actions = document.createElement('div');
    actions.className = 'inspiration-card-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'inspiration-action-btn';
    editBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    editBtn.title = '编辑';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditPanel(item);
    });

    actions.appendChild(editBtn);

    content.appendChild(title);
    if (item.description) content.appendChild(desc);
    if (item.tags.length > 0) content.appendChild(tags);
    content.appendChild(meta);

    card.appendChild(img);
    card.appendChild(content);
    card.appendChild(actions);

    card.addEventListener('click', () => openLightbox(item));

    return card;
  }

  // ── Lightbox ──
  function openLightbox(item) {
    document.getElementById('lightbox-image').src = item.imageData;
    document.getElementById('lightbox-title').textContent = item.title || '未命名';
    document.getElementById('lightbox-desc').textContent = item.description || '暂无描述';

    const tagsContainer = document.getElementById('lightbox-tags');
    tagsContainer.innerHTML = '';
    item.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'inspiration-tag';
      tagEl.textContent = tag;
      tagsContainer.appendChild(tagEl);
    });

    const date = new Date(item.createdAt);
    document.getElementById('lightbox-meta').textContent =
      `创建于 ${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN')}`;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // ── Edit Panel ──
  function openEditPanel(item) {
    editingId = item.id;
    document.getElementById('edit-title').value = item.title || '';
    document.getElementById('edit-desc').value = item.description || '';
    document.getElementById('edit-tags').value = item.tags.join(', ');
    editPanel.classList.add('active');
  }

  function closeEditPanel() {
    editPanel.classList.remove('active');
    editingId = null;
  }

  document.getElementById('edit-panel-close').addEventListener('click', closeEditPanel);

  document.getElementById('edit-save-btn').addEventListener('click', async () => {
    if (!editingId) return;

    const item = inspirations.find(i => i.id === editingId);
    if (!item) return;

    const title = document.getElementById('edit-title').value.trim();
    const description = document.getElementById('edit-desc').value.trim();
    const tagsInput = document.getElementById('edit-tags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

    const updated = {
      ...item,
      title: title || '未命名',
      description,
      tags
    };

    try {
      await updateInspiration(editingId, updated);
      await loadInspirations();
      closeEditPanel();
      showToast('保存成功');
    } catch (error) {
      console.error('Update error:', error);
      showToast('保存失败');
    }
  });

  document.getElementById('edit-delete-btn').addEventListener('click', async () => {
    if (!editingId) return;
    if (!confirm('确定要删除这个灵感吗？')) return;

    try {
      await deleteInspiration(editingId);
      await loadInspirations();
      closeEditPanel();
      showToast('删除成功');
    } catch (error) {
      console.error('Delete error:', error);
      showToast('删除失败');
    }
  });

  // ── Toast ──
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 2000);
    }
  }

  // ── Keyboard Shortcuts ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox.classList.contains('active')) {
        closeLightbox();
      } else if (editPanel.classList.contains('active')) {
        closeEditPanel();
      }
    }
  });

  // ── Initialize ──
  initDB().then(() => {
    loadInspirations();
  }).catch(error => {
    console.error('DB init error:', error);
    showToast('数据库初始化失败');
  });

  // Export for debugging
  window.InspirationSystem = {
    loadInspirations,
    getAllInspirations,
    db: () => db
  };

})();

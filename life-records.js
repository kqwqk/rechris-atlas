/**
 * 摄影发布系统
 * Photo Publishing System
 *
 * 功能：发布照片、地点与拍摄说明
 * 类型：摄影、城市、旅行、日常、作品、自然、归档
 */

class LifeRecordsManager {
  constructor() {
    this.storageKey = 'rechris_life_records';
    this.records = this.loadRecords();
    this.currentFilter = 'all';
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    this.createDetailPanel();
    this.bindEvents();
    this.render();
  }

  /**
   * 从 localStorage 加载记录
   */
  loadRecords() {
    const fileRecords = this.getFileRecords();

    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return fileRecords;
      }

      return this.mergeRecords(fileRecords, this.migrateRecords(JSON.parse(data)));
    } catch (error) {
      console.error('加载生活记录失败:', error);
      return fileRecords;
    }
  }

  /**
   * 从项目内照片数据文件读取记录
   */
  getFileRecords() {
    if (Array.isArray(window.PHOTO_RECORDS) && window.PHOTO_RECORDS.length > 0) {
      return window.PHOTO_RECORDS.map(record => ({ ...record }));
    }
    return this.getDefaultRecords();
  }

  /**
   * 合并项目照片与浏览器本地草稿
   */
  mergeRecords(fileRecords, storedRecords) {
    const fileIds = new Set(fileRecords.map(record => record.id));
    const localRecords = (Array.isArray(storedRecords) ? storedRecords : [])
      .filter(record => !fileIds.has(record.id))
      .filter(record => !this.isLegacyDefaultRecord(record));

    return [...localRecords, ...fileRecords];
  }

  /**
   * 识别旧版内置示例，避免与项目照片重复展示
   */
  isLegacyDefaultRecord(record) {
    const legacyDefaultIds = ['life-001', 'life-002', 'life-003', 'life-004', 'life-005'];
    return record && legacyDefaultIds.includes(record.id) && !record.createdAt;
  }

  /**
   * 将旧版默认生活记录替换为摄影示例，不覆盖用户自己发布的内容
   */
  migrateRecords(records) {
    if (!Array.isArray(records) || records.length === 0) {
      return this.getDefaultRecords();
    }

    const legacySeedRecords = records.filter(record => {
      return this.isLegacyDefaultRecord(record) &&
        ['reading', 'sport', 'food', 'music', 'movie'].includes(record.type) &&
        (!record.images || record.images.length === 0);
    });

    if (legacySeedRecords.length === records.length) {
      return this.getDefaultRecords();
    }

    if (legacySeedRecords.length > 0) {
      const userRecords = records.filter(record => !legacySeedRecords.includes(record));
      return [...userRecords, ...this.getDefaultRecords()];
    }

    const defaultRecords = this.getDefaultRecords();
    return records.map(record => {
      const defaultRecord = defaultRecords.find(item => item.id === record.id);
      if (!defaultRecord) return record;
      return {
        ...defaultRecord,
        ...record,
        time: record.time || defaultRecord.time,
        lens: record.lens || defaultRecord.lens
      };
    });
  }

  /**
   * 保存记录到 localStorage
   */
  saveRecords() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.records));
      return true;
    } catch (error) {
      console.error('保存生活记录失败:', error);
      return false;
    }
  }

  /**
   * 获取默认示例数据
   */
  getDefaultRecords() {
    return [
      {
        id: 'life-001',
        type: 'photo',
        title: '午后的工作台',
        content: '把一天里最安静的光留下来，屏幕、纸张和窗边的影子刚好在同一个节奏里。',
        images: ['assets/generated/about-duck-day.png'],
        tags: ['光线', '工作台', '日常'],
        date: '2026-04-28',
        time: '14:20',
        location: '杭州 · 家',
        lens: '35mm · f/2.8 · ISO 200',
        mood: 'peaceful'
      },
      {
        id: 'life-002',
        type: 'city',
        title: '雨后街角',
        content: '路面还带着一点反光，城市的颜色被雨水压低，行人经过时像短暂的剪影。',
        images: ['assets/generated/about-duck-rainy.png'],
        tags: ['街拍', '雨天', '城市'],
        date: '2026-04-27',
        time: '17:45',
        location: '杭州',
        lens: '50mm · f/1.8 · ISO 400',
        mood: 'focused'
      },
      {
        id: 'life-003',
        type: 'travel',
        title: '湖边散步',
        content: '春天的风很轻，水面和树影都适合慢慢拍，照片不急着讲故事，只留一个片刻。',
        images: ['assets/generated/about-duck-hangzhou.png'],
        tags: ['杭州', '湖边', '旅行'],
        date: '2026-04-25',
        time: '16:10',
        location: '杭州 · 西湖',
        lens: '24mm · f/5.6 · ISO 100',
        mood: 'inspired'
      },
      {
        id: 'life-004',
        type: 'nature',
        title: '夜色里的蓝',
        content: '夜晚的色温比白天更克制，画面里只留下轮廓、月光和一点点安静。',
        images: ['assets/generated/about-duck-moonlight.png'],
        tags: ['夜景', '蓝调', '自然光'],
        date: '2026-04-24',
        time: '21:30',
        location: '杭州',
        lens: '85mm · f/2 · ISO 800',
        mood: 'peaceful'
      }
    ];
  }

  /**
   * 添加新记录
   */
  addRecord(record) {
    const newRecord = {
      id: `life-${Date.now()}`,
      type: record.type || 'photo',
      title: record.title || '',
      content: record.content || '',
      images: record.images || [],
      tags: record.tags || [],
      date: record.date || new Date().toISOString().split('T')[0],
      time: record.time || '',
      location: record.location || '',
      lens: record.lens || '',
      mood: record.mood || '',
      rating: record.rating || 0,
      createdAt: Date.now()
    };

    this.records.unshift(newRecord);
    this.saveRecords();
    this.render();
    return newRecord;
  }

  /**
   * 更新记录
   */
  updateRecord(id, updates) {
    const index = this.records.findIndex(r => r.id === id);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...updates };
      this.saveRecords();
      this.render();
      return true;
    }
    return false;
  }

  /**
   * 删除记录
   */
  deleteRecord(id) {
    const index = this.records.findIndex(r => r.id === id);
    if (index !== -1) {
      this.records.splice(index, 1);
      this.saveRecords();
      this.render();
      return true;
    }
    return false;
  }

  /**
   * 获取记录类型的标签
   */
  getTypeInfo(type) {
    const types = {
      photo: { label: 'PHOTO' },
      city: { label: 'CITY' },
      travel: { label: 'TRAVEL' },
      daily: { label: 'DAILY' },
      work: { label: 'WORK' },
      nature: { label: 'NATURE' },
      archive: { label: 'ARCHIVE' },
      other: { label: 'PHOTO' },
      reading: { label: 'ARCHIVE' },
      music: { label: 'ARCHIVE' },
      sport: { label: 'ARCHIVE' },
      food: { label: 'ARCHIVE' },
      movie: { label: 'ARCHIVE' }
    };
    return types[type] || types.photo;
  }

  /**
   * 获取心情文字
   */
  getMoodText(mood) {
    const moods = {
      happy: 'Happy',
      sad: 'Sad',
      excited: 'Excited',
      peaceful: 'Peaceful',
      energetic: 'Energetic',
      tired: 'Tired',
      focused: 'Focused',
      satisfied: 'Satisfied',
      inspired: 'Inspired'
    };
    return moods[mood] || '';
  }

  /**
   * 格式化日期
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = today - recordDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays === 2) return '前天';
    if (diffDays < 7) return `${diffDays}天前`;

    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  }

  /**
   * 格式化详情页时间
   */
  formatDetailTime(record) {
    const parts = [];
    if (record.date) {
      const date = new Date(record.date);
      if (!Number.isNaN(date.getTime())) {
        parts.push(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`);
      }
    }
    if (record.time) {
      parts.push(record.time);
    }
    return parts.join(' ') || '未记录';
  }

  /**
   * 基础文本转义
   */
  escapeHTML(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  /**
   * 按月份分组记录
   */
  groupByMonth(records) {
    const groups = {};

    records.forEach(record => {
      const date = new Date(record.date);
      const key = `${date.getFullYear()}年${date.getMonth() + 1}月`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(record);
    });

    return groups;
  }

  /**
   * 筛选记录
   */
  filterRecords(type) {
    this.currentFilter = type;
    this.render();
  }

  /**
   * 获取筛选后的记录
   */
  getFilteredRecords() {
    if (this.currentFilter === 'all') {
      return this.records.filter(record => record.images && record.images.length > 0);
    }
    if (this.currentFilter === 'archive') {
      const legacyTypes = ['reading', 'music', 'sport', 'food', 'movie', 'other', 'archive'];
      return this.records.filter(r => legacyTypes.includes(r.type));
    }
    return this.records.filter(r => r.type === this.currentFilter);
  }

  /**
   * 渲染记录列表
   */
  render() {
    const container = document.getElementById('life-grid');
    if (!container) return;

    const filteredRecords = this.getFilteredRecords();
    container.dataset.filter = this.currentFilter;

    if (filteredRecords.length === 0) {
      container.innerHTML = `
        <div class="life-empty">
          <div class="life-empty-text">还没有发布照片，先上传一组画面吧</div>
          <button class="life-add-btn" id="btn-add-life-record">PUBLISH PHOTO</button>
        </div>
      `;
      return;
    }

    if (this.currentFilter === 'all') {
      container.innerHTML = filteredRecords
        .map(record => this.renderRecordCard(record, true))
        .join('');
      return;
    }

    const groups = this.groupByMonth(filteredRecords);

    let html = '';

    Object.keys(groups).forEach(monthKey => {
      html += `<div class="life-month-group">`;
      html += `<div class="life-month-title">${monthKey}</div>`;

      groups[monthKey].forEach(record => {
        html += this.renderRecordCard(record);
      });

      html += `</div>`;
    });

    container.innerHTML = html;
  }

  /**
   * 渲染单个记录卡片
   */
  renderRecordCard(record, photoOnly = false) {
    const typeInfo = this.getTypeInfo(record.type);
    const moodText = this.getMoodText(record.mood);
    const dateText = this.formatDate(record.date);

    let imagesHtml = '';
    if (record.images && record.images.length > 0) {
      imagesHtml = `
        <div class="life-card-images life-card-images-${Math.min(record.images.length, 3)}">
          ${record.images.slice(0, 9).map((img, index) => `
            <img src="${img}" alt="" class="life-card-image" data-image-index="${index}" loading="lazy" />
          `).join('')}
        </div>
      `;
    } else {
      imagesHtml = `<div class="life-photo-placeholder">NO PHOTO</div>`;
    }

    if (photoOnly) {
      return `
        <div class="life-card life-card--photo-only" data-id="${record.id}">
          ${imagesHtml}
        </div>
      `;
    }

    let tagsHtml = '';
    if (record.tags && record.tags.length > 0) {
      tagsHtml = `
        <div class="life-card-tags">
          ${record.tags.map(tag => `<span class="life-card-tag">${tag}</span>`).join('')}
        </div>
      `;
    }

    let ratingHtml = '';
    if (record.rating && record.rating > 0) {
      ratingHtml = `<div class="life-card-rating">${'★'.repeat(record.rating)}</div>`;
    }

    let locationHtml = '';
    if (record.location) {
      locationHtml = `<span class="life-card-location">${record.location}</span>`;
    }

    let moodHtml = '';
    if (moodText) {
      moodHtml = `<span class="life-card-mood-text">${moodText}</span>`;
    }

    return `
      <div class="life-card" data-id="${record.id}">
        ${imagesHtml}

        <div class="life-card-header">
          <div class="life-card-type">
            <span class="life-card-type-label">${typeInfo.label}</span>
          </div>
          <div class="life-card-date">${dateText}</div>
        </div>

        <div class="life-card-body">
          <h3 class="life-card-title">${record.title}</h3>
          <p class="life-card-content">${record.content}</p>
          ${tagsHtml}
        </div>

        <div class="life-card-footer">
          <div class="life-card-meta">
            ${moodHtml}
            ${locationHtml}
            ${ratingHtml}
          </div>
          <div class="life-card-actions">
            <button class="life-card-action-btn" data-action="edit" title="编辑"></button>
            <button class="life-card-action-btn" data-action="delete" title="删除"></button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染筛选按钮
   */
  renderFilters() {
    const container = document.querySelector('.life-filters');
    if (!container) return;

    const types = [
      { value: 'all', label: 'ALL' },
      { value: 'photo', label: 'PHOTO' },
      { value: 'city', label: 'CITY' },
      { value: 'travel', label: 'TRAVEL' },
      { value: 'daily', label: 'DAILY' },
      { value: 'work', label: 'WORK' },
      { value: 'nature', label: 'NATURE' },
      { value: 'archive', label: 'ARCHIVE' }
    ];

    const html = types.map(type => `
      <button
        class="life-filter-btn ${this.currentFilter === type.value ? 'active' : ''}"
        data-filter="${type.value}"
      >
        ${type.label}
      </button>
    `).join('');

    container.innerHTML = html;
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 使用事件委托处理卡片操作
    document.addEventListener('click', (e) => {
      // 编辑按钮
      if (e.target.closest('[data-action="edit"]')) {
        const card = e.target.closest('.life-card');
        const id = card.dataset.id;
        this.openEditPanel(id);
        return;
      }

      // 删除按钮
      if (e.target.closest('[data-action="delete"]')) {
        const card = e.target.closest('.life-card');
        const id = card.dataset.id;
        if (confirm('确定要删除这条记录吗？')) {
          this.deleteRecord(id);
        }
        return;
      }

      // 照片详情
      if (e.target.closest('.life-card-image')) {
        const image = e.target.closest('.life-card-image');
        const card = e.target.closest('.life-card');
        if (card) {
          this.openPhotoDetail(card.dataset.id, parseInt(image.dataset.imageIndex, 10) || 0);
        }
        return;
      }

      // 筛选按钮
      if (e.target.closest('.life-filter-btn')) {
        const btn = e.target.closest('.life-filter-btn');
        const filter = btn.dataset.filter;
        this.filterRecords(filter);
        this.renderFilters();
        return;
      }

      // 添加记录按钮
      if (e.target.closest('#btn-add-life-record') || e.target.closest('.life-add-fab')) {
        this.openAddPanel();
        return;
      }

      if (e.target.closest('[data-life-detail-close]')) {
        this.closePhotoDetail();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closePhotoDetail();
      }
    });
  }

  /**
   * 创建照片详情层
   */
  createDetailPanel() {
    if (document.getElementById('life-detail-panel')) return;

    const html = `
      <div class="life-detail-panel" id="life-detail-panel" aria-hidden="true">
        <button class="life-detail-backdrop" type="button" data-life-detail-close aria-label="关闭照片详情"></button>
        <div class="life-detail-shell" role="dialog" aria-modal="true" aria-labelledby="life-detail-title">
          <button class="life-detail-close" type="button" data-life-detail-close></button>
          <div class="life-detail-media">
            <img id="life-detail-image" class="life-detail-image" alt="" />
          </div>
          <div class="life-detail-info">
            <div class="life-detail-kicker" id="life-detail-type"></div>
            <h3 class="life-detail-title" id="life-detail-title"></h3>
            <dl class="life-detail-meta">
              <div class="life-detail-meta-row">
                <dt>TIME</dt>
                <dd id="life-detail-time"></dd>
              </div>
              <div class="life-detail-meta-row">
                <dt>LOCATION</dt>
                <dd id="life-detail-location"></dd>
              </div>
              <div class="life-detail-meta-row">
                <dt>LENS</dt>
                <dd id="life-detail-lens"></dd>
              </div>
            </dl>
            <p class="life-detail-description" id="life-detail-description"></p>
            <div class="life-detail-tags" id="life-detail-tags"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  }

  /**
   * 打开照片详情
   */
  openPhotoDetail(id, imageIndex = 0) {
    const record = this.records.find(r => r.id === id);
    if (!record || !record.images || record.images.length === 0) return;

    const index = Math.max(0, Math.min(imageIndex, record.images.length - 1));
    const panel = document.getElementById('life-detail-panel');
    if (!panel) return;

    const image = document.getElementById('life-detail-image');
    const type = document.getElementById('life-detail-type');
    const title = document.getElementById('life-detail-title');
    const time = document.getElementById('life-detail-time');
    const location = document.getElementById('life-detail-location');
    const lens = document.getElementById('life-detail-lens');
    const description = document.getElementById('life-detail-description');
    const tags = document.getElementById('life-detail-tags');

    image.src = record.images[index];
    image.alt = record.title || '照片详情';
    type.textContent = this.getTypeInfo(record.type).label;
    title.textContent = record.title || '未命名照片';
    time.textContent = this.formatDetailTime(record);
    location.textContent = record.location || '未记录';
    lens.textContent = record.lens || '未记录';
    description.textContent = record.content || '暂无说明';
    tags.innerHTML = (record.tags || [])
      .map(tag => `<span class="life-detail-tag">${this.escapeHTML(tag)}</span>`)
      .join('');

    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('life-detail-open');
  }

  /**
   * 关闭照片详情
   */
  closePhotoDetail() {
    const panel = document.getElementById('life-detail-panel');
    if (!panel || !panel.classList.contains('active')) return;
    panel.classList.remove('active');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('life-detail-open');
  }

  /**
   * 打开添加面板
   */
  openAddPanel() {
    if (this.formComponent) {
      this.formComponent.openAddPanel();
    }
  }

  /**
   * 打开编辑面板
   */
  openEditPanel(id) {
    const record = this.records.find(r => r.id === id);
    if (record && this.formComponent) {
      this.formComponent.openEditPanel(record);
    }
  }

  /**
   * 设置表单组件
   */
  setFormComponent(formComponent) {
    this.formComponent = formComponent;
  }

  /**
   * 导出数据
   */
  exportData() {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      records: this.records
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-records-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 导入数据
   */
  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.records && Array.isArray(data.records)) {
          this.records = data.records;
          this.saveRecords();
          this.render();
          alert('导入成功！');
        } else {
          alert('数据格式错误');
        }
      } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  }

  /**
   * 获取统计数据
   */
  getStats() {
    const stats = {
      total: this.records.length,
      byType: {},
      byMonth: {},
      recentDays: 0
    };

    // 按类型统计
    this.records.forEach(record => {
      stats.byType[record.type] = (stats.byType[record.type] || 0) + 1;
    });

    // 按月份统计
    this.records.forEach(record => {
      const date = new Date(record.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      stats.byMonth[key] = (stats.byMonth[key] || 0) + 1;
    });

    // 最近30天的记录数
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    stats.recentDays = this.records.filter(r => new Date(r.date) >= thirtyDaysAgo).length;

    return stats;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LifeRecordsManager;
}

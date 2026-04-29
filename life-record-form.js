/**
 * 摄影发布表单组件
 * Photo Publishing Form Component
 */

class LifeRecordForm {
  constructor(manager) {
    this.manager = manager;
    this.currentRecord = null;
    this.uploadedImages = [];
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    this.createFormHTML();
    this.bindEvents();
  }

  /**
   * 创建表单 HTML
   */
  createFormHTML() {
    const formHTML = `
      <!-- 摄影发布编辑面板 -->
      <div class="life-edit-panel" id="life-edit-panel">
        <div class="life-edit-panel-content">
          <div class="life-edit-panel-header">
            <h3 class="life-edit-panel-title" id="life-panel-title">发布照片</h3>
            <button class="life-edit-panel-close" id="life-panel-close">×</button>
          </div>

          <div class="life-edit-panel-body">
            <form id="life-record-form">
              <!-- 类型选择 -->
              <div class="life-form-group">
                <label class="life-form-label">照片分类</label>
                <div class="life-type-selector" id="life-type-selector">
                  <div class="life-type-option" data-type="photo">
                    <span class="life-type-option-label">PHOTO</span>
                  </div>
                  <div class="life-type-option" data-type="city">
                    <span class="life-type-option-label">CITY</span>
                  </div>
                  <div class="life-type-option" data-type="travel">
                    <span class="life-type-option-label">TRAVEL</span>
                  </div>
                  <div class="life-type-option" data-type="daily">
                    <span class="life-type-option-label">DAILY</span>
                  </div>
                  <div class="life-type-option" data-type="work">
                    <span class="life-type-option-label">WORK</span>
                  </div>
                  <div class="life-type-option" data-type="nature">
                    <span class="life-type-option-label">NATURE</span>
                  </div>
                </div>
              </div>

              <!-- 标题 -->
              <div class="life-form-group">
                <label class="life-form-label" for="life-title">标题 *</label>
                <input
                  type="text"
                  class="life-form-input"
                  id="life-title"
                  placeholder="给这组照片起个标题"
                  required
                />
              </div>

              <!-- 内容 -->
              <div class="life-form-group">
                <label class="life-form-label" for="life-content">说明</label>
                <textarea
                  class="life-form-textarea"
                  id="life-content"
                  placeholder="记录拍摄背景、光线或当时的感受..."
                  rows="5"
                ></textarea>
              </div>

              <!-- 图片上传 -->
              <div class="life-form-group">
                <label class="life-form-label">照片（最多9张）</label>
                <div class="life-image-upload" id="life-image-upload">
                  <div class="life-image-add" id="life-image-add-btn">+</div>
                </div>
                <input
                  type="file"
                  id="life-image-input"
                  accept="image/*"
                  multiple
                  style="display: none;"
                />
              </div>

              <!-- 标签 -->
              <div class="life-form-group">
                <label class="life-form-label" for="life-tags">标签（用逗号分隔）</label>
                <input
                  type="text"
                  class="life-form-input"
                  id="life-tags"
                  placeholder="例如：杭州, 街拍, 光影"
                />
              </div>

              <!-- 日期 -->
              <div class="life-form-group">
                <label class="life-form-label" for="life-date">日期</label>
                <input
                  type="date"
                  class="life-form-input"
                  id="life-date"
                />
              </div>

              <!-- 时间 -->
              <div class="life-form-group">
                <label class="life-form-label" for="life-time">拍摄时间（可选）</label>
                <input
                  type="time"
                  class="life-form-input"
                  id="life-time"
                />
              </div>

              <!-- 地点 -->
              <div class="life-form-group">
                <label class="life-form-label" for="life-location">地点（可选）</label>
                <input
                  type="text"
                  class="life-form-input"
                  id="life-location"
                  placeholder="例如：杭州 · 西湖"
                />
              </div>

              <!-- 镜头信息 -->
              <div class="life-form-group">
                <label class="life-form-label" for="life-lens">镜头信息（可选）</label>
                <input
                  type="text"
                  class="life-form-input"
                  id="life-lens"
                  placeholder="例如：35mm · f/2.8 · ISO 200"
                />
              </div>

              <!-- 心情 -->
              <div class="life-form-group">
                <label class="life-form-label" for="life-mood">状态（可选）</label>
                <select class="life-form-select" id="life-mood">
                  <option value="">选择心情</option>
                  <option value="happy">Happy</option>
                  <option value="excited">Excited</option>
                  <option value="peaceful">Peaceful</option>
                  <option value="energetic">Energetic</option>
                  <option value="focused">Focused</option>
                  <option value="satisfied">Satisfied</option>
                  <option value="inspired">Inspired</option>
                  <option value="tired">Tired</option>
                  <option value="sad">Sad</option>
                </select>
              </div>

              <!-- 评分（保留给旧数据兼容） -->
              <div class="life-form-group" id="life-rating-group" style="display: none;">
                <label class="life-form-label" for="life-rating">评分（可选）</label>
                <select class="life-form-select" id="life-rating">
                  <option value="0">不评分</option>
                  <option value="1">★</option>
                  <option value="2">★★</option>
                  <option value="3">★★★</option>
                  <option value="4">★★★★</option>
                  <option value="5">★★★★★</option>
                </select>
              </div>

              <!-- 按钮 -->
              <div class="life-form-actions">
                <button type="button" class="life-form-btn life-form-btn-secondary" id="life-form-cancel">
                  CANCEL
                </button>
                <button type="submit" class="life-form-btn life-form-btn-primary" id="life-form-submit">
                  SAVE
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 悬浮添加按钮 -->
      <button class="life-add-fab" id="life-add-fab" title="发布照片"></button>
    `;

    // 插入到页面中
    document.body.insertAdjacentHTML('beforeend', formHTML);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 打开添加面板
    document.getElementById('life-add-fab')?.addEventListener('click', () => {
      this.openAddPanel();
    });

    // 关闭面板
    document.getElementById('life-panel-close')?.addEventListener('click', () => {
      this.closePanel();
    });

    document.getElementById('life-form-cancel')?.addEventListener('click', () => {
      this.closePanel();
    });

    // 点击背景关闭
    document.getElementById('life-edit-panel')?.addEventListener('click', (e) => {
      if (e.target.id === 'life-edit-panel') {
        this.closePanel();
      }
    });

    // 类型选择
    document.getElementById('life-type-selector')?.addEventListener('click', (e) => {
      const option = e.target.closest('.life-type-option');
      if (option) {
        document.querySelectorAll('.life-type-option').forEach(opt => {
          opt.classList.remove('active');
        });
        option.classList.add('active');

        const ratingGroup = document.getElementById('life-rating-group');
        if (ratingGroup) {
          ratingGroup.style.display = 'none';
        }
      }
    });

    // 图片上传
    document.getElementById('life-image-add-btn')?.addEventListener('click', () => {
      document.getElementById('life-image-input')?.click();
    });

    document.getElementById('life-image-input')?.addEventListener('change', (e) => {
      this.handleImageUpload(e.target.files);
    });

    // 表单提交
    document.getElementById('life-record-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  /**
   * 打开添加面板
   */
  openAddPanel() {
    this.currentRecord = null;
    this.uploadedImages = [];
    this.resetForm();

    document.getElementById('life-panel-title').textContent = '发布照片';
    document.getElementById('life-edit-panel').classList.add('active');

    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('life-date').value = today;

    // 默认选中第一个类型
    document.querySelector('.life-type-option')?.classList.add('active');
  }

  /**
   * 打开编辑面板
   */
  openEditPanel(record) {
    this.currentRecord = record;
    this.resetForm();
    this.uploadedImages = [...(record.images || [])];

    document.getElementById('life-panel-title').textContent = '编辑照片';
    document.getElementById('life-edit-panel').classList.add('active');

    // 填充表单数据
    document.getElementById('life-title').value = record.title || '';
    document.getElementById('life-content').value = record.content || '';
    document.getElementById('life-tags').value = (record.tags || []).join(', ');
    document.getElementById('life-date').value = record.date || '';
    document.getElementById('life-time').value = record.time || '';
    document.getElementById('life-location').value = record.location || '';
    document.getElementById('life-lens').value = record.lens || '';
    document.getElementById('life-mood').value = record.mood || '';
    document.getElementById('life-rating').value = record.rating || 0;

    // 选中类型
    document.querySelectorAll('.life-type-option').forEach(opt => {
      opt.classList.remove('active');
      if (opt.dataset.type === record.type) {
        opt.classList.add('active');
      }
    });
    if (!document.querySelector('.life-type-option.active')) {
      document.querySelector('.life-type-option')?.classList.add('active');
    }

    const ratingGroup = document.getElementById('life-rating-group');
    if (ratingGroup) {
      ratingGroup.style.display = 'none';
    }

    // 渲染已有图片
    this.renderImages();
  }

  /**
   * 关闭面板
   */
  closePanel() {
    document.getElementById('life-edit-panel').classList.remove('active');
    setTimeout(() => {
      this.resetForm();
    }, 300);
  }

  /**
   * 重置表单
   */
  resetForm() {
    document.getElementById('life-record-form')?.reset();
    document.querySelectorAll('.life-type-option').forEach(opt => {
      opt.classList.remove('active');
    });
    this.uploadedImages = [];
    this.renderImages();
    const ratingGroup = document.getElementById('life-rating-group');
    if (ratingGroup) {
      ratingGroup.style.display = 'none';
    }
  }

  /**
   * 处理图片上传
   */
  handleImageUpload(files) {
    if (!files || files.length === 0) return;

    const maxImages = 9;
    const remainingSlots = maxImages - this.uploadedImages.length;

    if (remainingSlots <= 0) {
      alert('最多只能上传9张图片');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('只能上传图片文件');
        return;
      }

      // 检查文件大小（5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImages.push(e.target.result);
        this.renderImages();
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * 渲染图片预览
   */
  renderImages() {
    const container = document.getElementById('life-image-upload');
    if (!container) return;

    let html = '';

    this.uploadedImages.forEach((img, index) => {
      html += `
        <div class="life-image-preview">
          <img src="${img}" alt="预览图 ${index + 1}" />
          <button class="life-image-remove" data-index="${index}">×</button>
        </div>
      `;
    });

    if (this.uploadedImages.length < 9) {
      html += '<div class="life-image-add" id="life-image-add-btn">+</div>';
    }

    container.innerHTML = html;

    // 绑定删除按钮事件
    container.querySelectorAll('.life-image-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.uploadedImages.splice(index, 1);
        this.renderImages();
      });
    });

    // 重新绑定添加按钮
    document.getElementById('life-image-add-btn')?.addEventListener('click', () => {
      document.getElementById('life-image-input')?.click();
    });
  }

  /**
   * 处理表单提交
   */
  handleSubmit() {
    // 获取选中的类型
    const selectedType = document.querySelector('.life-type-option.active');
    if (!selectedType) {
      alert('请选择记录类型');
      return;
    }

    const type = selectedType.dataset.type;
    const title = document.getElementById('life-title').value.trim();
    const content = document.getElementById('life-content').value.trim();
    const tagsInput = document.getElementById('life-tags').value.trim();
    const date = document.getElementById('life-date').value;
    const time = document.getElementById('life-time').value;
    const location = document.getElementById('life-location').value.trim();
    const lens = document.getElementById('life-lens').value.trim();
    const mood = document.getElementById('life-mood').value;
    const rating = parseInt(document.getElementById('life-rating').value) || 0;

    if (!title) {
      alert('请输入标题');
      return;
    }

    if (!date) {
      alert('请选择日期');
      return;
    }

    if (this.uploadedImages.length === 0) {
      alert('请至少上传一张照片');
      return;
    }

    // 处理标签
    const tags = tagsInput
      .split(/[,，]/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const recordData = {
      type,
      title,
      content,
      images: this.uploadedImages,
      tags,
      date,
      time,
      location,
      lens,
      mood,
      rating
    };

    if (this.currentRecord) {
      // 更新记录
      this.manager.updateRecord(this.currentRecord.id, recordData);
    } else {
      // 添加新记录
      this.manager.addRecord(recordData);
    }

    this.closePanel();
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LifeRecordForm;
}

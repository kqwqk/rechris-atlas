window.DEVLOG_ENTRIES = [
  {
    "id": "devlog-1779507924135",
    "date": "2026-05-23",
    "title": "新增新安江山水画廊照片并清理摄影数据契约",
    "category": "feature",
    "description": "补充第 25 张摄影发布，移除历史 displayImages 字段，让数据与构建只依赖 thumbs 和原图。",
    "tags": [
      "摄影模块",
      "数据契约",
      "文档"
    ],
    "details": [
      "新增 assets/photos/新安江山水画廊.JPG 及对应缩略图",
      "photo-records-data.js 增至 25 条记录，补齐地点与 EXIF",
      "从全部记录及 sync/enrich 脚本移除 displayImages",
      "修正 DEVELOPMENT.md 与 HANDOFF 中的照片流程说明",
      "本地 npm run build 与资源预算检查通过"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1778759292492",
    "date": "2026-05-14",
    "title": "摄影详情页图片质量优化",
    "category": "enhancement",
    "description": "详情页改用原图，列表页使用轻量缩略图，平衡速度与画质",
    "tags": [
      "摄影模块",
      "图片优化",
      "性能优化"
    ],
    "details": [
      "列表页使用 720px 缩略图（thumbs/），从 7.9MB 降至 3.7MB",
      "详情页直接加载原图（138MB），保证最佳画质",
      "调整构建配置支持原图复制到 dist/assets/photos/",
      "更新资源预算至 280MB，构建产物总计 246.8MB"
    ],
    "impact": "high"
  },
  {
    "id": "devlog-1778118954574",
    "date": "2026-05-07",
    "title": "完成站点性能与稳定性优化",
    "category": "enhancement",
    "description": "按优化计划收口收藏数据源、摄影懒加载、动效日志清理和资源体积预算检查。",
    "tags": [
      "performance",
      "shortcuts",
      "photos",
      "build"
    ],
    "details": [
      "收藏页改为以项目默认文件作为入口数据源，避免浏览器旧缓存覆盖线上内容",
      "摄影模块与 Panzoom、EXIF 依赖拆到独立懒加载包，未进入摄影页前不加载",
      "天气主题动效改为动态加载并统一同步状态，生产环境不再输出调试日志",
      "构建流程新增收藏数据校验、未使用依赖检查和资源体积预算检查"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1778071325580",
    "date": "2026-05-06",
    "title": "完善收藏编辑弹窗",
    "category": "bugfix",
    "description": "修复收藏编辑弹窗位置、阴影和分类不可编辑的问题。",
    "tags": [
      "shortcuts",
      "editor",
      "category"
    ],
    "details": [
      "编辑弹窗从右侧抽屉改为居中对话框，去掉左侧多余投影",
      "新增收藏分类选择字段，保存时写入显式 category",
      "收藏列表优先读取显式分类，旧数据继续使用自动归类兜底",
      "新增收藏会默认使用当前筛选分类"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1778069934918",
    "date": "2026-05-06",
    "title": "优化深色主题收藏图标着色",
    "category": "bugfix",
    "description": "修复 Night、Moonlight、Rainy 深色主题下收藏页单色图标对比度不足的问题。",
    "tags": [
      "shortcuts",
      "icons",
      "dark-theme"
    ],
    "details": [
      "为 Icons8 单色收藏图标增加识别 class",
      "仅在 Night、Moonlight、Rainy 深色主题下把单色图标染成浅灰",
      "保留彩色或自定义图片原色，避免整体反色",
      "补回收藏图标基础尺寸和键盘焦点样式"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1778056982988",
    "date": "2026-05-06",
    "title": "修复收藏页图标显示",
    "category": "bugfix",
    "description": "收藏图标 DOM 存在但视觉不可见的问题已修复，避免被全局懒加载透明样式隐藏。",
    "tags": [
      "shortcuts",
      "icons",
      "react"
    ],
    "details": [
      "收藏快捷方式图标改为 eager 加载，不再匹配全局 img lazy 透明规则",
      "保留异步解码与 no-referrer，避免影响外链图标请求",
      "本地构建、摄影资源检查与站点冒烟检查均通过"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1778050518001",
    "date": "2026-05-06",
    "title": "项目更名为 RECHRIS ATLAS",
    "category": "maintenance",
    "description": "统一站点、代码包与部署项目命名，为新的个人图谱品牌做准备。",
    "tags": [
      "branding",
      "vercel",
      "codex"
    ],
    "details": [
      "站点 SEO、分享卡片和结构化信息改为 RECHRIS ATLAS",
      "React 顶部品牌和摄影模块说明同步更新",
      "包名调整为 rechris-atlas，并准备同步 Vercel 与本地目录名称"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1778048992364",
    "date": "2026-05-06",
    "title": "清理 React 重构遗留文件",
    "category": "maintenance",
    "description": "删除旧脚本、阶段性文档、测试页面、构建产物和误放的嵌套项目，让项目目录只保留当前 React 站点真源。",
    "tags": [
      "清理",
      "React",
      "维护"
    ],
    "details": [
      "删除不再加载的 app.js、weather-module.js、devlog-module.js、life-records.js 等 classic script",
      "删除旧测试页、阶段性总结文档、旧部署脚本和 package.json.new",
      "删除可重新生成的 dist 目录，并把 dist 与 .cursor 加入 .gitignore",
      "保留照片资源、React 源码、数据文件、Vibma 插件和开发日志工具",
      "清理后重新运行照片检查、冒烟检查和 Vite 构建"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1778048259885",
    "date": "2026-05-06",
    "title": "全站 React 重构",
    "category": "refactor",
    "description": "将站点从 index.html + classic script 迁移为 React 单入口，统一接管首页、收藏、摄影、开发日志、天气和主题切换。",
    "tags": [
      "React",
      "重构",
      "架构"
    ],
    "details": [
      "index.html 缩减为 SEO/meta、#root 和 src/main.jsx 入口",
      "src/main.jsx 统一渲染首页、收藏、摄影、开发日志和天气",
      "摄影模块改为 React 组件导出，由全站入口挂载",
      "移除页面对 app.js、weather-module.js、devlog-module.js、life-records.js 等旧脚本的依赖",
      "冒烟检查新增 React 接管与旧脚本移除约束"
    ],
    "impact": "high"
  },
  {
    "id": "devlog-1777607198643",
    "date": "2026-05-01",
    "title": "收藏页改为文件真源",
    "category": "bugfix",
    "description": "修复线上收藏页与本地不一致的问题，线上默认以项目文件中的收藏数据为准。",
    "tags": [
      "收藏",
      "部署",
      "数据源"
    ],
    "details": [
      "收藏页启动时优先读取 default-shortcuts.json",
      "关闭线上 /api/shortcuts 对页面数据的覆盖",
      "本地编辑后的收藏部署后可与线上保持一致"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777606983578",
    "date": "2026-05-01",
    "title": "摄影缩略图改为四列",
    "category": "enhancement",
    "description": "摄影发布页缩略图改为桌面四列布局，并统一缩略图间距为 1px。",
    "tags": [
      "摄影",
      "缩略图",
      "布局"
    ],
    "details": [
      "摄影网格改为桌面 4 列固定排布",
      "缩略图卡片间距统一为 1px",
      "平板降为 3 列，手机降为 2 列"
    ],
    "impact": "low"
  },
  {
    "id": "devlog-1777606629048",
    "date": "2026-05-01",
    "title": "摄影筛选条移除",
    "category": "enhancement",
    "description": "摄影发布页移除缩略图下方的筛选条，默认直接展示完整照片墙。",
    "tags": [
      "摄影",
      "界面简化",
      "照片墙"
    ],
    "details": [
      "移除摄影模块中的分类筛选按钮",
      "摄影页默认直接展示按同步时间排序后的全部照片",
      "清理对应的筛选状态逻辑"
    ],
    "impact": "low"
  },
  {
    "id": "devlog-1777605749588",
    "date": "2026-05-01",
    "title": "照片详情说明位置优化",
    "category": "enhancement",
    "description": "照片详情面板将说明文字上移到标题下方，取消独立说明分组标题。",
    "tags": [
      "摄影",
      "详情面板",
      "信息层级"
    ],
    "details": [
      "标题下方直接展示照片说明",
      "移除右侧面板底部的说明分组标题",
      "无说明时不再展示占位文案"
    ],
    "impact": "low"
  },
  {
    "id": "devlog-1777605524021",
    "date": "2026-05-01",
    "title": "摄影默认按同步时间排序",
    "category": "enhancement",
    "description": "摄影页面默认将最近同步进项目的照片排在前面。",
    "tags": [
      "摄影",
      "排序",
      "照片同步"
    ],
    "details": [
      "照片记录新增 publishedAt 用于区分同步时间",
      "摄影列表优先按 publishedAt/updatedAt/createdAt 倒序展示",
      "没有同步时间的旧记录按文件记录顺序倒排兜底",
      "后续 photos:sync 会自动写入同步时间"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777605361668",
    "date": "2026-05-01",
    "title": "摄影照片批量同步",
    "category": "enhancement",
    "description": "同步 photos 目录中的新照片，并移除摄影缩略图区域底部多余留白。",
    "tags": [
      "摄影",
      "照片同步",
      "布局"
    ],
    "details": [
      "新增 photos:sync 脚本串联预览图生成和照片记录追加",
      "为 12 张新原图生成预览图并写入 photo-records-data.js",
      "移除摄影网格底部 40px padding"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777604699528",
    "date": "2026-05-01",
    "title": "本地文件编辑模式上线",
    "category": "feature",
    "description": "在本地开发服务中编辑收藏和照片信息，并直接写回项目文件。",
    "tags": [
      "本地编辑",
      "摄影",
      "收藏"
    ],
    "details": [
      "Vite 本地接口写入 default-shortcuts.json",
      "照片详情编辑写入 photo-records-data.js",
      "线上隐藏收藏新增、导入、导出和编辑删除入口",
      "本地编辑无需管理员密码"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777603659852",
    "date": "2026-05-01",
    "title": "摄影信息面板层级精简",
    "category": "enhancement",
    "description": "精简照片详情右侧信息面板，减少低价值 EXIF 分组展示",
    "tags": [
      "摄影",
      "信息面板",
      "体验"
    ],
    "details": [
      "移除拍摄模式、位置信息、标签独立分组",
      "经纬度直接并入基本信息",
      "基本信息删除地点和类型条目"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777603270651",
    "date": "2026-05-01",
    "title": "摄影详情弹框布局优化",
    "category": "enhancement",
    "description": "统一摄影缩略图比例，并将照片详情弹框调整为 32px 全屏边距布局",
    "tags": [
      "摄影",
      "布局",
      "体验"
    ],
    "details": [
      "摄影页缩略图统一为 1:1 正方形裁切",
      "详情弹框撑满视口并保留 32px 四周间距",
      "左侧照片查看区域铺满可用空间，照片无法铺满时保持居中显示"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777538724370",
    "date": "2026-04-30",
    "title": "天气模块从主脚本拆分",
    "category": "refactor",
    "description": "将 Open-Meteo 天气与自动主题逻辑从 app.js 拆到独立模块",
    "tags": [
      "天气",
      "模块化",
      "维护"
    ],
    "details": [
      "新增 weather-module.js 暴露 ThemeWeather 接口",
      "app.js 通过模块接口刷新天气图标和定时更新",
      "构建流程复制天气模块并校验加载顺序",
      "主脚本减少约 420 行天气代码"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777538378530",
    "date": "2026-04-30",
    "title": "摄影数据模块化与预览图流水线",
    "category": "refactor",
    "description": "将摄影记录改为模块导出，并补充照片预览图生成脚本",
    "tags": [
      "摄影",
      "React",
      "维护"
    ],
    "details": [
      "摄影数据从 window 副作用迁移为 ESM 导出",
      "React 摄影模块直接导入照片记录",
      "新增 photos:previews 脚本用于生成照片预览图",
      "冒烟检查覆盖摄影数据模块化约束"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777538103294",
    "date": "2026-04-30",
    "title": "P0 维护护栏上线",
    "category": "maintenance",
    "description": "收紧构建、开发日志和快捷方式写入的基础安全检查",
    "tags": [
      "维护",
      "构建",
      "安全"
    ],
    "details": [],
    "impact": "medium"
  },
  {
    "id": "devlog-1777536504173",
    "date": "2026-04-30",
    "title": "摄影模块 React 大版本上线",
    "category": "milestone",
    "description": "摄影页面完成 React 重构并上线照片详情能力，集成 EXIF 读取、拍摄参数卡片、原图渐进加载和 Panzoom 缩放，同时修复部署后的图片加载、弹框定位和大屏布局问题。",
    "tags": [
      "摄影",
      "React",
      "EXIF",
      "Panzoom",
      "照片详情",
      "部署"
    ],
    "details": [
      "用 React 接管摄影照片墙和详情弹框",
      "集成 exifr 读取原图 EXIF 并展示光圈、快门、ISO、焦距参数卡片",
      "接入 Panzoom 支持 FIT、1:1、滚轮缩放和拖拽查看",
      "生成并接入预览图，照片墙使用缩略图，详情弹框加载原图",
      "修复生产构建脚本顺序导致照片为空的问题",
      "删除公开模式/私人模式入口，简化收藏页模式",
      "修复缩略图透明、EXIF 对象渲染崩溃、弹框 fixed 定位和 1440px 以上大屏黑边偏移问题",
      "完成多轮 Vercel 生产部署与线上验证"
    ],
    "impact": "high"
  },
  {
    "id": "devlog-1777465702046",
    "date": "2026-04-29",
    "title": "收紧开发日志条目边距",
    "category": "enhancement",
    "description": "移除标签展示后，优化开发日志条目内部和条目之间的下边距，让时间线更紧凑。",
    "tags": [
      "开发日志",
      "间距",
      "界面优化"
    ],
    "details": [
      "缩小日志条目之间的距离",
      "收紧卡片内边距与详情列表下边距",
      "为有详情的日志增加状态类以精确控制留白"
    ],
    "impact": "low"
  },
  {
    "id": "devlog-1777465615947",
    "date": "2026-04-29",
    "title": "修复部署照片路径",
    "category": "bugfix",
    "description": "修正摄影页照片数据引用不存在文件的问题，改为引用 assets/photos 中真实存在的图片，并增加资源路径检查。",
    "tags": [
      "摄影",
      "部署",
      "图片路径"
    ],
    "details": [
      "photo-records-data.js 改为真实 DSC 文件路径",
      "新增照片资源检查脚本避免缺失图片进入构建",
      "构建流程加入图片路径校验"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777465469534",
    "date": "2026-04-29",
    "title": "隐藏开发日志标签行",
    "category": "enhancement",
    "description": "移除开发日志时间线中每条日志底部的标签展示，让日志内容更简洁。",
    "tags": [
      "开发日志",
      "界面优化"
    ],
    "details": [
      "删除日志条目底部 tag 行渲染",
      "移除对应 tag 样式",
      "保留数据字段以兼容已有日志结构"
    ],
    "impact": "low"
  },
  {
    "id": "devlog-1777464852683",
    "date": "2026-04-29",
    "title": "摄影照片改为项目文件存储",
    "category": "enhancement",
    "description": "将摄影页照片来源迁移到 assets/photos 文件夹和 photo-records-data.js 数据文件，减少对浏览器 localStorage 的依赖。",
    "tags": [
      "摄影",
      "照片存储",
      "数据结构"
    ],
    "details": [
      "新增 assets/photos 作为项目内照片目录",
      "新增 photo-records-data.js 管理照片元数据",
      "摄影页优先读取项目照片记录并保留本地草稿兼容"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777464642969",
    "date": "2026-04-29",
    "title": "新增照片详情页",
    "category": "feature",
    "description": "为摄影页照片增加点击详情层，集中展示拍摄时间、地点、镜头信息、说明和标签。",
    "tags": [
      "摄影",
      "详情页",
      "镜头信息"
    ],
    "details": [
      "ALL 照片墙点击照片可打开详情",
      "发布表单新增拍摄时间和镜头信息字段",
      "旧示例照片自动补全默认拍摄参数"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777464366459",
    "date": "2026-04-29",
    "title": "修复摄影页文字覆盖",
    "category": "bugfix",
    "description": "移除旧版通用生活内容对摄影页的覆盖，确保 ALL 页面只由照片墙渲染。",
    "tags": [
      "摄影",
      "照片墙",
      "修复"
    ],
    "details": [
      "停止旧站点内容渲染器写入 life-grid",
      "保留摄影发布系统对照片流和分类页的控制"
    ],
    "impact": "low"
  },
  {
    "id": "devlog-1777464272017",
    "date": "2026-04-29",
    "title": "摄影 ALL 视图纯照片化",
    "category": "enhancement",
    "description": "优化摄影页 ALL 筛选结果，仅展示照片墙，隐藏月份、标题、说明、标签和操作文字。",
    "tags": [
      "摄影",
      "照片墙",
      "优化"
    ],
    "details": [
      "ALL 视图改为独立纯照片网格",
      "无照片的旧记录不再出现在 ALL 中",
      "分类视图保留照片说明与编辑入口"
    ],
    "impact": "low"
  },
  {
    "id": "devlog-1777464126132",
    "date": "2026-04-29",
    "title": "摄影发布页改版",
    "category": "feature",
    "description": "将生活页面调整为以照片发布为主的摄影页面，并优化照片卡片、分类筛选和发布表单。",
    "tags": [
      "摄影",
      "生活页面",
      "发布"
    ],
    "details": [
      "导航与页面标题改为摄影发布",
      "默认内容更换为照片优先的摄影样例",
      "发布表单要求上传照片并提供摄影分类"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777463588889",
    "date": "2026-04-29",
    "title": "修复开发日志页运行提示",
    "category": "bugfix",
    "description": "修复 file:// 验证时发现的鼠标移出事件报错，保持开发日志页运行干净。",
    "tags": [
      "开发日志",
      "交互",
      "修复"
    ],
    "details": [
      "为快捷入口 3D 倾斜的 mouseleave 事件增加安全判断"
    ],
    "impact": "low"
  },
  {
    "id": "devlog-1777463519248",
    "date": "2026-04-29",
    "title": "开发日志页面直写展示",
    "category": "bugfix",
    "description": "让开发日志页面直接加载日志数据，避免 file:// 打开时只写 JSON 但页面不显示。",
    "tags": [
      "开发日志",
      "展示",
      "修复"
    ],
    "details": [
      "新增 devlog-data.js 作为页面直接加载的数据源",
      "开发日志模块改为自启动并合并内置数据",
      "后续 add-devlog 会同步更新页面数据"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-1777463369386",
    "date": "2026-04-29",
    "title": "临时隐藏灵感页面",
    "category": "enhancement",
    "description": "暂时隐藏灵感导航和页面入口，保留代码结构以便后续重新设计。",
    "tags": [
      "灵感",
      "导航",
      "优化"
    ],
    "details": [
      "隐藏灵感导航按钮与页面面板",
      "访问旧的 #inspiration 链接时自动回到首页"
    ],
    "impact": "low"
  },
  {
    "id": "devlog-1777463272885",
    "date": "2026-04-29",
    "title": "Hero 间距调整与日志规则",
    "category": "enhancement",
    "description": "将 Hero 下边距归零，并明确后续改动同步补充开发日志。",
    "tags": [
      "Hero",
      "开发日志",
      "优化"
    ],
    "details": [
      "Hero 区域下边距从 40px 调整为 0px",
      "后续代码改动同步添加简短开发日志"
    ],
    "impact": "low"
  },
  {
    "id": "devlog-1777378909653",
    "date": "2026-04-28",
    "title": "完善开发日志系统和历史数据",
    "category": "enhancement",
    "description": "补充项目从初始化到现在的完整开发历史，添加自动化工具和使用文档",
    "tags": [
      "开发日志",
      "文档",
      "自动化"
    ],
    "details": [
      "在 site-content.json 添加 12 条历史开发日志",
      "创建 add-devlog.js 自动化脚本支持命令行和交互式两种模式",
      "编写 DEVLOG_GUIDE.md 完整使用指南",
      "记录所有重要功能和优化的时间线"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-001",
    "date": "2026-04-28",
    "title": "开发日志系统上线",
    "category": "feature",
    "description": "实现开发日志主菜单，展示项目功能开发和维护的时间线",
    "tags": [
      "开发日志",
      "时间线",
      "UI"
    ],
    "details": [
      "新增开发日志页面和导航入口",
      "实现 7 种类别筛选（全部、里程碑、新功能、优化、重构、Bug 修复、维护）",
      "添加时间线可视化样式，包括时间轴、标记点和悬停动画",
      "支持按月份分组显示",
      "数据支持 localStorage 和 JSON 文件双重存储"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-002",
    "date": "2026-04-28",
    "title": "移除 Now 模块优化站点结构",
    "category": "refactor",
    "description": "简化页面结构，移除冗余的 Now 模块，优化导航体验",
    "tags": [
      "重构",
      "优化"
    ],
    "details": [
      "移除 Now 模块相关代码",
      "更新站点导航结构",
      "优化页面布局和样式"
    ],
    "impact": "low"
  },
  {
    "id": "devlog-003",
    "date": "2026-04-27",
    "title": "快捷方式增强功能",
    "category": "feature",
    "description": "实现快捷方式排序、导入导出和增强交互功能",
    "tags": [
      "快捷方式",
      "导入导出",
      "排序"
    ],
    "details": [
      "添加按使用频率排序功能",
      "实现数据导出为 JSON 文件",
      "支持从 JSON 文件导入快捷方式",
      "优化拖拽排序体验",
      "添加批量操作功能"
    ],
    "impact": "high"
  },
  {
    "id": "devlog-004",
    "date": "2026-04-27",
    "title": "智能主题切换系统",
    "category": "feature",
    "description": "实现基于时间和天气的智能主题自动切换",
    "tags": [
      "主题",
      "智能切换",
      "AI"
    ],
    "details": [
      "根据当前时间自动切换主题（白天/夜晚/黄昏）",
      "集成天气 API，根据天气状况切换主题",
      "支持手动开关智能模式",
      "平滑的主题过渡动画",
      "状态持久化到 localStorage"
    ],
    "impact": "high"
  },
  {
    "id": "devlog-005",
    "date": "2026-04-27",
    "title": "光标粒子特效",
    "category": "feature",
    "description": "添加跟随光标的粒子特效，提升交互趣味性",
    "tags": [
      "特效",
      "交互",
      "Canvas"
    ],
    "details": [
      "实现光标跟随粒子动画",
      "支持开关控制",
      "性能优化，避免影响页面流畅度",
      "适配不同主题的粒子颜色"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-006",
    "date": "2026-04-26",
    "title": "灵感收藏系统",
    "category": "feature",
    "description": "实现图片上传、标签管理、灯箱预览的灵感收藏功能",
    "tags": [
      "灵感",
      "IndexedDB",
      "图片管理"
    ],
    "details": [
      "支持拖拽上传图片",
      "使用 IndexedDB 本地存储图片数据",
      "标签筛选和搜索功能",
      "灯箱预览和编辑功能",
      "支持批量删除和导出"
    ],
    "impact": "high"
  },
  {
    "id": "devlog-007",
    "date": "2026-04-26",
    "title": "主题页布局与收藏 UI 优化",
    "category": "enhancement",
    "description": "优化主题页面布局，提升收藏系统的用户体验",
    "tags": [
      "UI",
      "布局",
      "优化"
    ],
    "details": [
      "重新设计主题页布局",
      "优化收藏卡片样式",
      "改进响应式设计",
      "提升移动端体验",
      "统一视觉风格"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-008",
    "date": "2026-04-26",
    "title": "性能与安全优化",
    "category": "enhancement",
    "description": "实施性能优化和安全加固措施",
    "tags": [
      "性能",
      "安全",
      "CSP"
    ],
    "details": [
      "添加 Content Security Policy (CSP) 头",
      "实现资源缓存策略",
      "优化图片加载性能",
      "添加安全响应头（X-Frame-Options, X-Content-Type-Options）",
      "优化 JavaScript 执行性能"
    ],
    "impact": "high"
  },
  {
    "id": "devlog-009",
    "date": "2026-04-26",
    "title": "站点内容与插画资源",
    "category": "feature",
    "description": "添加站点内容管理和自定义插画资源",
    "tags": [
      "内容",
      "插画",
      "资源"
    ],
    "details": [
      "创建 site-content.json 内容配置文件",
      "添加自定义插画资源",
      "实现内容动态加载",
      "支持多语言内容配置"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-010",
    "date": "2026-04-10",
    "title": "主题启动页完整功能",
    "category": "milestone",
    "description": "完成主题启动页的核心功能开发",
    "tags": [
      "里程碑",
      "主题",
      "启动页"
    ],
    "details": [
      "实现 6 种主题模式（白昼/晴朗/夜色/月光/雨天/雪天）",
      "Canvas 特效系统（星空、月亮、雨、雪、落叶）",
      "天气 API 集成（Open-Meteo）",
      "快捷方式 CRUD 功能",
      "键盘快捷键支持（D/S/N/M/R/W）",
      "环境音效（森林音）"
    ],
    "impact": "high"
  },
  {
    "id": "devlog-011",
    "date": "2026-04-10",
    "title": "Vercel 部署配置",
    "category": "feature",
    "description": "配置 Vercel 部署环境和优化设置",
    "tags": [
      "部署",
      "Vercel",
      "配置"
    ],
    "details": [
      "创建 vercel.json 配置文件",
      "配置 CDN 缓存策略",
      "设置安全响应头",
      "配置 Clean URLs",
      "优化静态资源加载"
    ],
    "impact": "medium"
  },
  {
    "id": "devlog-012",
    "date": "2026-04-03",
    "title": "项目初始化",
    "category": "milestone",
    "description": "从 theme-switch.pages.dev 导入初始项目代码",
    "tags": [
      "里程碑",
      "初始化"
    ],
    "details": [
      "导入基础 HTML/CSS/JavaScript 代码",
      "建立项目文件结构",
      "初始化 Git 仓库",
      "配置基础开发环境"
    ],
    "impact": "high"
  }
];

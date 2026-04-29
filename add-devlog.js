#!/usr/bin/env node

/**
 * 开发日志自动生成工具
 * 用法: node add-devlog.js
 *
 * 这个脚本会引导你创建一条新的开发日志记录
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SITE_CONTENT_PATH = path.join(__dirname, 'site-content.json');

// 类别选项
const CATEGORIES = {
  '1': { key: 'milestone', label: '里程碑' },
  '2': { key: 'feature', label: '新功能' },
  '3': { key: 'enhancement', label: '优化' },
  '4': { key: 'refactor', label: '重构' },
  '5': { key: 'bugfix', label: 'Bug 修复' },
  '6': { key: 'maintenance', label: '维护' }
};

// 影响级别选项
const IMPACT_LEVELS = {
  '1': 'low',
  '2': 'medium',
  '3': 'high'
};

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateId() {
  const timestamp = Date.now();
  return `devlog-${timestamp}`;
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function collectDevLogData() {
  console.log('\n=== 创建新的开发日志 ===\n');

  // 标题
  const title = await question('标题: ');
  if (!title.trim()) {
    console.log('❌ 标题不能为空');
    process.exit(1);
  }

  // 类别
  console.log('\n选择类别:');
  Object.entries(CATEGORIES).forEach(([key, value]) => {
    console.log(`  ${key}. ${value.label}`);
  });
  const categoryChoice = await question('类别 (1-6): ');
  const category = CATEGORIES[categoryChoice];
  if (!category) {
    console.log('❌ 无效的类别选择');
    process.exit(1);
  }

  // 描述
  const description = await question('简短描述: ');
  if (!description.trim()) {
    console.log('❌ 描述不能为空');
    process.exit(1);
  }

  // 标签
  const tagsInput = await question('标签 (用逗号分隔): ');
  const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);

  // 详细信息
  console.log('\n详细信息 (每行一条，输入空行结束):');
  const details = [];
  while (true) {
    const detail = await question('  - ');
    if (!detail.trim()) break;
    details.push(detail.trim());
  }

  // 影响级别
  console.log('\n影响级别:');
  console.log('  1. Low (低)');
  console.log('  2. Medium (中)');
  console.log('  3. High (高)');
  const impactChoice = await question('影响级别 (1-3, 默认 2): ') || '2';
  const impact = IMPACT_LEVELS[impactChoice] || 'medium';

  // 日期
  const defaultDate = getCurrentDate();
  const dateInput = await question(`日期 (YYYY-MM-DD, 默认 ${defaultDate}): `);
  const date = dateInput.trim() || defaultDate;

  return {
    id: generateId(),
    date,
    title: title.trim(),
    category: category.key,
    description: description.trim(),
    tags,
    details,
    impact
  };
}

async function addDevLog(newEntry) {
  try {
    // 读取现有数据
    let siteContent = {};
    if (fs.existsSync(SITE_CONTENT_PATH)) {
      const content = fs.readFileSync(SITE_CONTENT_PATH, 'utf8');
      siteContent = JSON.parse(content);
    }

    // 确保 devLog 数组存在
    if (!Array.isArray(siteContent.devLog)) {
      siteContent.devLog = [];
    }

    // 添加新记录到开头
    siteContent.devLog.unshift(newEntry);

    // 写回文件
    fs.writeFileSync(
      SITE_CONTENT_PATH,
      JSON.stringify(siteContent, null, 2),
      'utf8'
    );

    console.log('\n✅ 开发日志已添加！');
    console.log('\n预览:');
    console.log('─'.repeat(50));
    console.log(`标题: ${newEntry.title}`);
    console.log(`类别: ${CATEGORIES[Object.keys(CATEGORIES).find(k => CATEGORIES[k].key === newEntry.category)].label}`);
    console.log(`日期: ${newEntry.date}`);
    console.log(`描述: ${newEntry.description}`);
    if (newEntry.tags.length > 0) {
      console.log(`标签: ${newEntry.tags.join(', ')}`);
    }
    if (newEntry.details.length > 0) {
      console.log('详细信息:');
      newEntry.details.forEach(d => console.log(`  - ${d}`));
    }
    console.log(`影响: ${newEntry.impact}`);
    console.log('─'.repeat(50));

    // 提示提交到 Git
    console.log('\n💡 别忘了提交更改:');
    console.log('  git add site-content.json');
    console.log(`  git commit -m "docs: 添加开发日志 - ${newEntry.title}"`);
    console.log('  git push origin main');

  } catch (error) {
    console.error('❌ 添加开发日志失败:', error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    const devLogData = await collectDevLogData();
    await addDevLog(devLogData);
  } catch (error) {
    console.error('❌ 发生错误:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 运行主程序
main();

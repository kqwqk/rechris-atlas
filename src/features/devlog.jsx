import React, { useMemo, useState } from 'react';
import siteContent from '../../site-content.json';
import '../../devlog-module.css';
import { SectionHead } from '../layout.jsx';

const FILTERS = [
  ['all', '全部'],
  ['milestone', '里程碑'],
  ['feature', '新功能'],
  ['enhancement', '优化'],
  ['refactor', '重构'],
  ['bugfix', 'Bug 修复'],
  ['maintenance', '维护']
];

const CATEGORY_LABELS = {
  milestone: '里程碑',
  feature: '新功能',
  enhancement: '优化',
  refactor: '重构',
  bugfix: 'Bug 修复',
  maintenance: '维护'
};

export function Devlog() {
  const [filter, setFilter] = useState('all');
  const entries = useMemo(() => {
    const list = Array.isArray(siteContent.devLog) ? siteContent.devLog : [];
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, []);
  const filtered = filter === 'all' ? entries : entries.filter((item) => item.category === filter);
  const grouped = groupByMonth(filtered);

  return (
    <>
      <SectionHead title="开发日志" note="Development Timeline / Features / Maintenance" />
      <div className="devlog-container">
        <div className="devlog-filters">
          {FILTERS.map(([id, label]) => (
            <button key={id} type="button" className={`devlog-filter-btn ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="devlog-timeline">
          {Object.entries(grouped).map(([month, items]) => (
            <div className="devlog-month" key={month}>
              <div className="devlog-month-header">{month}</div>
              <div className="devlog-entries">
                {items.map((entry) => <DevlogEntry key={entry.id} entry={entry} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function DevlogEntry({ entry }) {
  const date = new Date(entry.date);
  const dateText = Number.isNaN(date.getTime()) ? entry.date : date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  return (
    <article className={`devlog-entry ${entry.details?.length ? 'has-details' : ''}`} data-impact={entry.impact || 'medium'}>
      <div className="devlog-entry-marker" />
      <div className="devlog-entry-content">
        <div className="devlog-entry-header">
          <div className="devlog-entry-date">{dateText}</div>
          <div className={`devlog-entry-category ${entry.category}`}>{CATEGORY_LABELS[entry.category] || entry.category}</div>
        </div>
        <h3 className="devlog-entry-title">{entry.title}</h3>
        <p className="devlog-entry-description">{entry.description}</p>
        {entry.details?.length ? (
          <ul className="devlog-entry-details">
            {entry.details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

function groupByMonth(entries) {
  return entries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const key = Number.isNaN(date.getTime())
      ? '未归档'
      : date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});
}

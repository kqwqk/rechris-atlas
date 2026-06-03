import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import defaultWorklog from '../../default-worklog.json';
import '../../work-module.css';

const LEGACY_STORAGE_KEYS = ['atlas-worklog-records-v2', 'atlas-worklog-records-v1'];
const DEFAULT_PROJECTS = ['杭州市无人车', '贵阳生态云'];
const NEW_PROJECT_BASE = '新项目';

export function Worklog({ showToast = () => {} }) {
  const initial = readDefaultWorklog();
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
  const [monthProjects, setMonthProjects] = useState(initial.months);
  const [records, setRecords] = useState(initial.records);
  const [localEdit, setLocalEdit] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingValue, setEditingValue] = useState('');
  const hydratedRef = useRef(false);
  const persistReadyRef = useRef(!import.meta.env.DEV);
  const userTouchedRef = useRef(false);
  const editInputRef = useRef(null);
  const editingValueRef = useRef('');
  const editingIndexRef = useRef(-1);
  const projectNamesRef = useRef([]);
  const monthKeyRef = useRef('');
  const previousMonthKeyRef = useRef('');

  useEffect(() => {
    checkLocalEditAvailable().then((ok) => {
      setLocalEdit(ok);
      document.body.classList.toggle('local-edit-enabled', ok);
    });
  }, []);

  useEffect(() => {
    if (!localEdit || hydratedRef.current) return;
    hydratedRef.current = true;
    hydrateLocalWorklog(showToast).then((state) => {
      if (state && !userTouchedRef.current && editingIndexRef.current < 0) {
        setMonthProjects(state.months);
        setRecords(state.records);
      }
      persistReadyRef.current = true;
    });
  }, [localEdit, showToast]);

  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!localEdit || !persistReadyRef.current || editingIndex >= 0) {
      window.clearTimeout(saveTimerRef.current);
      return;
    }
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveWorklogProject({ months: monthProjects, records }, showToast, { quiet: true });
    }, 280);
    return () => window.clearTimeout(saveTimerRef.current);
  }, [editingIndex, localEdit, monthProjects, records, showToast]);

  const monthLabel = monthDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit'
  });
  const monthDays = getDaysInMonth(monthDate);
  const monthKey = formatMonthKey(monthDate);
  const projectNames = monthProjects[monthKey] || [...DEFAULT_PROJECTS];

  monthKeyRef.current = monthKey;
  projectNamesRef.current = projectNames;

  useEffect(() => {
    editingValueRef.current = editingValue;
  }, [editingValue]);

  useEffect(() => {
    editingIndexRef.current = editingIndex;
  }, [editingIndex]);

  useEffect(() => {
    if (!previousMonthKeyRef.current) {
      previousMonthKeyRef.current = monthKey;
      return;
    }
    if (previousMonthKeyRef.current === monthKey) return;
    previousMonthKeyRef.current = monthKey;
    setEditingIndex(-1);
    setEditingValue('');
  }, [monthKey]);

  useLayoutEffect(() => {
    if (editingIndex < 0 || !localEdit) return;
    editInputRef.current?.focus({ preventScroll: true });
    editInputRef.current?.select();
  }, [editingIndex, localEdit]);

  const toggleProjectDate = (project, dateKey) => {
    if (!localEdit) return;
    userTouchedRef.current = true;
    setRecords((prev) => {
      const currentDate = prev[dateKey] || { projects: {} };
      const nextProjects = { ...(currentDate.projects || {}) };

      if (nextProjects[project]) {
        delete nextProjects[project];
      } else {
        nextProjects[project] = true;
      }

      if (Object.keys(nextProjects).length) {
        return {
          ...prev,
          [dateKey]: { projects: nextProjects }
        };
      }

      const next = { ...prev };
      delete next[dateKey];
      return next;
    });
  };

  const commitActiveEdit = ({ fromEnter = false } = {}) => {
    const index = editingIndexRef.current;
    if (index < 0) return;
    const names = projectNamesRef.current;
    const oldName = names[index];
    if (!oldName) {
      setEditingIndex(-1);
      setEditingValue('');
      return;
    }
    commitEditProject(oldName, {
      fromEnter,
      value: editingValueRef.current,
      monthKey: monthKeyRef.current,
      projectNames: names
    });
  };

  const addProject = () => {
    if (!localEdit) return;
    userTouchedRef.current = true;
    commitActiveEdit();
    const name = createUniqueProjectName(NEW_PROJECT_BASE, projectNames);
    const nextNames = [...(monthProjects[monthKey] || [...DEFAULT_PROJECTS]), name];
    setMonthProjects((prev) => ({
      ...prev,
      [monthKey]: nextNames
    }));
    setEditingIndex(nextNames.length - 1);
    setEditingValue(name);
  };

  const beginEditProject = (index, name) => {
    if (!localEdit) return;
    userTouchedRef.current = true;
    if (editingIndexRef.current >= 0 && editingIndexRef.current !== index) {
      commitActiveEdit();
    }
    window.clearTimeout(saveTimerRef.current);
    setEditingIndex(index);
    setEditingValue(name);
  };

  const cancelEdit = ({ removeEmpty = true } = {}) => {
    const index = editingIndexRef.current;
    const names = projectNamesRef.current;
    const oldName = names[index];
    if (removeEmpty && oldName && !editingValueRef.current.trim()) {
      removeProject(oldName, monthKeyRef.current, setMonthProjects, setRecords);
    }
    setEditingIndex(-1);
    setEditingValue('');
  };

  const commitEditProject = (
    oldName,
    {
      fromEnter = false,
      value = editingValue,
      monthKey: activeMonthKey = monthKey,
      projectNames: names = projectNames
    } = {}
  ) => {
    if (!localEdit) return;
    userTouchedRef.current = true;
    const trimmed = String(value).trim();
    if (!trimmed) {
      removeProject(oldName, activeMonthKey, setMonthProjects, setRecords);
      cancelEdit({ removeEmpty: false });
      return;
    }
    const nextName = createUniqueProjectName(trimmed, names, oldName);
    if (nextName !== oldName) {
      renameProject(oldName, nextName, activeMonthKey, setMonthProjects, setRecords);
    }
    cancelEdit();
  };

  const selectMonth = (offset) => {
    commitActiveEdit();
    setMonthDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      return startOfMonth(next);
    });
  };

  return (
    <div className={`worklog-shell ${localEdit ? '' : 'worklog-readonly'}`}>
      <div className="worklog-toolbar">
        <div className="worklog-month-switch">
          <button type="button" className="ghost-btn" onClick={() => selectMonth(-1)}>
            上月
          </button>
          <button
            type="button"
            className="worklog-month-label ghost-btn"
            onClick={() => {
              commitActiveEdit();
              setMonthDate(startOfMonth(new Date()));
            }}
          >
            {monthLabel}
          </button>
          <button type="button" className="ghost-btn" onClick={() => selectMonth(1)}>
            下月
          </button>
        </div>
        <div className="worklog-selected-date">
          {localEdit
            ? '点击绿色圆点表示该项目当天有工作内容'
            : '线上仅展示已发布数据，本地开发时可编辑并写回项目文件'}
        </div>
      </div>

      <div className="worklog-panel">
        <div className="worklog-matrix-column">
          <h3 className="worklog-column-title">月度看板</h3>
          <div
            className="worklog-matrix"
            style={{ '--days': monthDays.length, '--projects': projectNames.length }}
            role="grid"
            aria-label={`${monthLabel} 工作看板`}
          >
            <div className="worklog-project-column">
              <div className="worklog-project-head-wrap">
                <span className="worklog-project-head">项目</span>
                {localEdit && (
                  <button
                    type="button"
                    className="worklog-add-project local-edit-only"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={addProject}
                    aria-label="新增项目"
                    title="新增项目"
                  >
                    +
                  </button>
                )}
              </div>
              {projectNames.map((project, index) => (
                <div
                  className={`worklog-project-name ${editingIndex === index ? 'is-editing' : ''}`}
                  key={`${monthKey}-${index}`}
                >
                  {localEdit && editingIndex === index ? (
                    <input
                      ref={editInputRef}
                      className="worklog-project-input"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          commitActiveEdit({ fromEnter: true });
                        }
                        if (e.key === 'Escape') {
                          cancelEdit();
                        }
                      }}
                    />
                  ) : localEdit ? (
                    <button
                      type="button"
                      className="worklog-project-edit-trigger"
                      onClick={() => beginEditProject(index, project)}
                      aria-label={`编辑项目 ${project}`}
                    >
                      {project}
                    </button>
                  ) : (
                    <span className="worklog-project-label">{project}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="worklog-days-columns">
              {monthDays.map((day) => {
                const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`;
                return (
                  <div className="worklog-day-column" key={dateKey}>
                    <span className="worklog-day-num">{day}</span>
                    {projectNames.map((project) => {
                      const active = Boolean(records[dateKey]?.projects?.[project]);
                      return (
                        <div className="worklog-day-dot-cell" key={`${dateKey}-${project}`}>
                          {localEdit ? (
                            <button
                              type="button"
                              className={`worklog-dot ${active ? 'active' : 'empty'}`}
                              onClick={() => toggleProjectDate(project, dateKey)}
                              title={`${dateKey} · ${project} · ${active ? '有工作内容' : '无工作内容'}`}
                              aria-label={`${dateKey} ${project} ${active ? '有工作内容' : '无工作内容'}`}
                            />
                          ) : (
                            <span
                              className={`worklog-dot ${active ? 'active' : 'empty'}`}
                              aria-hidden="true"
                              title={`${dateKey} · ${project} · ${active ? '有工作内容' : '无工作内容'}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function readDefaultWorklog() {
  return normalizeWorklogState(defaultWorklog);
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

async function hydrateLocalWorklog(showToast) {
  try {
    const response = await fetch('/__local-admin/worklog', { cache: 'no-store' });
    if (!response.ok) throw new Error('load failed');
    const fromFile = normalizeWorklogState(await response.json());
    if (hasWorklogData(fromFile)) return fromFile;

    const legacy = loadLegacyBrowserState();
    if (!hasWorklogData(legacy)) return fromFile;

    await saveWorklogProject(legacy, showToast, { quiet: true });
    clearLegacyBrowserState();
    showToast('已将浏览器旧数据迁移到 default-worklog.json');
    return legacy;
  } catch {
    return null;
  }
}

async function saveWorklogProject(state, showToast, { quiet = false } = {}) {
  try {
    const response = await fetch('/__local-admin/worklog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    if (!response.ok) throw new Error('save failed');
    if (!quiet) showToast('已写入 default-worklog.json');
  } catch {
    if (!quiet) showToast('项目文件保存失败');
  }
}

function hasWorklogData(state) {
  return Boolean(Object.keys(state.months).length || Object.keys(state.records).length);
}

function normalizeWorklogState(input = {}) {
  const months = {};
  if (input.months && typeof input.months === 'object') {
    Object.entries(input.months).forEach(([monthKey, value]) => {
      const projects = Array.isArray(value?.projects)
        ? value.projects.map((item) => String(item).trim()).filter(Boolean)
        : Array.isArray(value)
          ? value.map((item) => String(item).trim()).filter(Boolean)
          : [];
      if (projects.length) months[monthKey] = projects;
    });
  }

  return {
    months,
    records: normalizeRecords(
      input.records && typeof input.records === 'object' ? input.records : {}
    )
  };
}

function renameProject(oldName, nextName, monthKey, setMonthProjects, setRecords) {
  setMonthProjects((prev) => ({
    ...prev,
    [monthKey]: (prev[monthKey] || [...DEFAULT_PROJECTS]).map((name) =>
      name === oldName ? nextName : name
    )
  }));
  setRecords((prev) => {
    const next = { ...prev };
    Object.entries(prev).forEach(([dateKey, value]) => {
      if (!dateKey.startsWith(`${monthKey}-`)) return;
      const projects = { ...(value?.projects || {}) };
      if (projects[oldName]) {
        delete projects[oldName];
        projects[nextName] = true;
      }
      if (Object.keys(projects).length) {
        next[dateKey] = { projects };
      } else {
        delete next[dateKey];
      }
    });
    return next;
  });
}

function removeProject(projectName, monthKey, setMonthProjects, setRecords) {
  setMonthProjects((prev) => ({
    ...prev,
    [monthKey]: (prev[monthKey] || [...DEFAULT_PROJECTS]).filter((name) => name !== projectName)
  }));
  setRecords((prev) => {
    const next = { ...prev };
    Object.entries(prev).forEach(([dateKey, value]) => {
      if (!dateKey.startsWith(`${monthKey}-`)) return;
      const projects = { ...(value?.projects || {}) };
      delete projects[projectName];
      if (Object.keys(projects).length) {
        next[dateKey] = { projects };
      } else {
        delete next[dateKey];
      }
    });
    return next;
  });
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getDaysInMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, idx) => idx + 1);
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function createUniqueProjectName(name, projectNames, ignoreName = '') {
  const safe = name.trim() || NEW_PROJECT_BASE;
  if (!projectNames.includes(safe) || safe === ignoreName) return safe;
  let i = 2;
  while (projectNames.includes(`${safe} ${i}`) && `${safe} ${i}` !== ignoreName) {
    i += 1;
  }
  return `${safe} ${i}`;
}

function loadLegacyBrowserState() {
  for (const key of LEGACY_STORAGE_KEYS) {
    const state = loadLegacyFromStorage(key);
    if (state && hasWorklogData(state)) return state;
  }
  return { months: {}, records: {} };
}

function loadLegacyFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = JSON.parse(raw || '{}');
    if (!parsed || typeof parsed !== 'object') return null;

    const records = normalizeRecords(
      parsed.records && typeof parsed.records === 'object' ? parsed.records : parsed
    );

    if (parsed.months && typeof parsed.months === 'object') {
      return normalizeWorklogState({ months: parsed.months, records });
    }

    if (Array.isArray(parsed.projects)) {
      return migrateLegacyProjects(parsed.projects, records);
    }

    return records && Object.keys(records).length
      ? normalizeWorklogState({ months: {}, records })
      : null;
  } catch {
    return null;
  }
}

function migrateLegacyProjects(legacyProjects, records) {
  const months = deriveMonthsFromRecords(records);
  const projects = legacyProjects.map((item) => String(item).trim()).filter(Boolean);

  if (projects.length) {
    const monthKeys = Object.keys(months);
    if (monthKeys.length) {
      monthKeys.forEach((monthKey) => {
        months[monthKey] = [...new Set([...projects, ...(months[monthKey] || [])])];
      });
    } else {
      months[formatMonthKey(new Date())] = [...projects];
    }
  }

  return { months, records };
}

function deriveMonthsFromRecords(records) {
  const months = {};
  Object.entries(records).forEach(([dateKey, value]) => {
    const monthKey = dateKey.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(monthKey)) return;
    const fromRecord = Object.keys(value?.projects || {}).filter(Boolean);
    if (!fromRecord.length) return;
    months[monthKey] = [...new Set([...(months[monthKey] || []), ...fromRecord])];
  });
  return months;
}

function normalizeRecords(input) {
  const normalized = {};
  Object.entries(input).forEach(([dateKey, value]) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;

    if (Array.isArray(value)) {
      const projects = {};
      value.forEach((item) => {
        if (item?.project) projects[item.project] = true;
      });
      if (Object.keys(projects).length) normalized[dateKey] = { projects };
      return;
    }

    if (value.projects && typeof value.projects === 'object') {
      normalized[dateKey] = { projects: { ...value.projects } };
    }
  });
  return normalized;
}

function clearLegacyBrowserState() {
  LEGACY_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors.
    }
  });
}

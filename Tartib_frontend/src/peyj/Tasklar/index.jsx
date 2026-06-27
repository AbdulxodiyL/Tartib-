import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Check, ClipboardList, Calendar, Flag, Search, Pencil, X } from 'lucide-react';
import { api } from '../../utils/api';

const PRIORITY_MAP = {
  high:   { label: 'Yuqori',  color: '#ef4444', bg: '#ef444415' },
  medium: { label: "O'rta",   color: '#f59e0b', bg: '#f59e0b15' },
  low:    { label: 'Past',    color: '#10b981', bg: '#10b98115' },
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function Tasklar({ t }) {
  const [tasks, setTasks]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [newTaskText, setNewTaskText]   = useState('');
  const [categoryType, setCategoryType] = useState('Ish');
  const [customCategory, setCustomCategory] = useState('');
  const [dueDate, setDueDate]           = useState('');
  const [priority, setPriority]         = useState('medium');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery]       = useState('');
  const [editingId, setEditingId]           = useState(null);
  const [editText, setEditText]             = useState('');
  const editRef = useRef(null);

  useEffect(() => {
    api.getTasks()
      .then(data => setTasks(data.map(normalizeTask)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const normalizeTask = (t) => ({ ...t, dueDate: t.due_date || '', priority: t.priority || 'medium' });

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    let finalCategory = categoryType === 'custom' ? (customCategory.trim() || 'Boshqa') : categoryType;
    try {
      const created = await api.addTask({
        text: newTaskText.trim(),
        category: finalCategory,
        due_date: dueDate || new Date().toISOString().split('T')[0],
        priority,
      });
      setTasks([normalizeTask(created), ...tasks]);
      setNewTaskText('');
      setCustomCategory('');
      setDueDate('');
      setPriority('medium');
      if (categoryType === 'custom') setCategoryType('Ish');
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      const updated = await api.updateTask(id, { completed: !task.completed });
      setTasks(tasks.map(t => t.id === id ? normalizeTask(updated) : t));
    } catch (err) { alert(err.message); }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
    setTimeout(() => editRef.current?.focus(), 50);
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) { setEditingId(null); return; }
    try {
      const updated = await api.updateTask(id, { text: editText.trim() });
      setTasks(tasks.map(t => t.id === id ? normalizeTask(updated) : t));
    } catch (err) { console.error(err); }
    setEditingId(null);
  };

  const deleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) { alert(err.message); }
  };

  const categoriesList = ['all', ...new Set(tasks.map(tk => tk.category))];

  const filteredTasks = tasks
    .filter(task => {
      const statusOk   = statusFilter === 'all' || (statusFilter === 'active' ? !task.completed : task.completed);
      const catOk      = categoryFilter === 'all' || task.category === categoryFilter;
      const priorityOk = priorityFilter === 'all' || task.priority === priorityFilter;
      const searchOk   = !searchQuery || task.text.toLowerCase().includes(searchQuery.toLowerCase());
      return statusOk && catOk && priorityOk && searchOk;
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
    });

  const getCategoryClass = (cat) => {
    const l = cat.toLowerCase();
    if (l === 'ish' || l === 'work') return 'cat-work';
    if (l === 'shaxsiy' || l === 'personal') return 'cat-personal';
    if (l === "o'qish" || l === 'study') return 'cat-study';
    return 'cat-other';
  };

  const isOverdue = (dateStr) => dateStr && dateStr < new Date().toISOString().split('T')[0];

  const completedCount = tasks.filter(tk => tk.completed).length;
  const highCount      = tasks.filter(tk => !tk.completed && tk.priority === 'high').length;

  if (loading) {
    return <div className="page-container"><div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Yuklanmoqda...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{t.ts_title}</h1>
        <p className="page-subtitle">{t.ts_subtitle}</p>
      </div>

      <div className="tasks-layout">
        <div className="tasks-main dashboard-card">

          {/* Search */}
          <div className="task-search-wrap">
            <Search size={15} className="task-search-icon" />
            <input
              type="text"
              className="task-search-input"
              placeholder="Vazifa qidiring..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="task-search-clear" onClick={() => setSearchQuery('')}><X size={14} /></button>
            )}
          </div>

          {/* Add form */}
          <form className="task-input-form" onSubmit={addTask}>
            <input
              type="text"
              className="task-input"
              placeholder={t.ts_placeholder}
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              required
            />
            <select className="category-select-task" value={categoryType} onChange={e => setCategoryType(e.target.value)}>
              <option value="Ish">Ish</option>
              <option value="Shaxsiy">Shaxsiy</option>
              <option value="O'qish">O&apos;qish</option>
              <option value="custom">{t.ts_selectCustom}</option>
            </select>
            {categoryType === 'custom' && (
              <input type="text" className="task-input" style={{ maxWidth: '110px' }} placeholder={t.ts_customCat}
                value={customCategory} onChange={e => setCustomCategory(e.target.value)} required />
            )}
            <select className="category-select-task priority-select" value={priority} onChange={e => setPriority(e.target.value)}
              style={{ color: PRIORITY_MAP[priority].color, fontWeight: 700 }}>
              <option value="high">🔴 Yuqori</option>
              <option value="medium">🟡 O&apos;rta</option>
              <option value="low">🟢 Past</option>
            </select>
            <input type="date" className="task-input" style={{ maxWidth: '150px' }}
              value={dueDate} onChange={e => setDueDate(e.target.value)} />
            <button type="submit" className="add-task-btn">
              <Plus size={16} /><span>{t.ts_add}</span>
            </button>
          </form>

          {/* Status filters */}
          <div className="task-filters">
            {[['all', `${t.ts_filterAll} (${tasks.length})`], ['active', `${t.ts_filterActive} (${tasks.length - completedCount})`], ['completed', `${t.ts_filterCompleted} (${completedCount})`]].map(([v, label]) => (
              <button key={v} className={`filter-tab ${statusFilter === v ? 'active' : ''}`} onClick={() => setStatusFilter(v)}>{label}</button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="task-filters" style={{ borderBottom: 'none', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Muhimlik:</span>
            {[['all', '⬜ Barchasi'], ['high', '🔴 Yuqori'], ['medium', "🟡 O'rta"], ['low', '🟢 Past']].map(([v, label]) => (
              <button key={v} className={`filter-tab ${priorityFilter === v ? 'active' : ''}`} onClick={() => setPriorityFilter(v)}>{label}</button>
            ))}
          </div>

          {/* Category filter */}
          <div className="task-filters" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.ts_category}:</span>
            {categoriesList.map(cat => (
              <button key={cat} className={`filter-tab ${categoryFilter === cat ? 'active' : ''}`} onClick={() => setCategoryFilter(cat)}>
                {cat === 'all' ? t.ts_filterAll : cat}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="tasks-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-tasks">
                <ClipboardList size={40} className="empty-icon" />
                <p>{t.ts_empty}</p>
              </div>
            ) : (
              filteredTasks.map(task => {
                const overdue = isOverdue(task.dueDate) && !task.completed;
                const pr = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
                return (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}
                    style={{ borderLeft: `3px solid ${task.completed ? 'var(--border-color)' : pr.color}` }}>
                    <div className="task-item-left">
                      <button className="check-btn" onClick={() => toggleTask(task.id)}>
                        {task.completed ? <Check size={14} /> : <span className="circle-placeholder" />}
                      </button>
                      <span className={`cat-badge ${getCategoryClass(task.category)}`}>{task.category}</span>
                      <Flag size={11} style={{ color: task.completed ? 'var(--text-muted)' : pr.color, flexShrink: 0 }} />
                      {editingId === task.id ? (
                        <input
                          ref={editRef}
                          className="task-edit-input"
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onBlur={() => saveEdit(task.id)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(task.id); if (e.key === 'Escape') setEditingId(null); }}
                        />
                      ) : (
                        <span className="task-text" onDoubleClick={() => !task.completed && startEdit(task)}>{task.text}</span>
                      )}
                      {task.dueDate && editingId !== task.id && (
                        <span style={{
                          fontSize: '0.72rem', display: 'flex', alignItems: 'center',
                          gap: '3px', marginLeft: 'auto',
                          color: overdue ? '#ef4444' : 'var(--text-muted)',
                          fontWeight: overdue ? '700' : '500', whiteSpace: 'nowrap'
                        }}>
                          <Calendar size={11} />
                          {overdue ? `Muddati o'tdi: ` : ''}{task.dueDate}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {!task.completed && editingId !== task.id && (
                        <button className="delete-task-btn" onClick={() => startEdit(task)} title="Tahrirlash">
                          <Pencil size={13} />
                        </button>
                      )}
                      <button className="delete-task-btn" onClick={() => deleteTask(task.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="tasks-sidebar">
          <div className="dashboard-card status-panel">
            <h3>{t.ts_progress}</h3>
            <div className="progress-details">
              <div className="progress-circle-wrap">
                <div className="progress-value">{totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0}%</div>
                <div className="progress-label">{t.ts_completedLabel}</div>
              </div>
              <div className="progress-info-rows">
                <div className="stat-row"><span>{t.ts_totalLabel}:</span><strong>{tasks.length}</strong></div>
                <div className="stat-row"><span>{t.ts_completedLabel}:</span><strong style={{ color: '#10b981' }}>{completedCount}</strong></div>
                <div className="stat-row"><span>{t.ts_remainingLabel}:</span><strong style={{ color: 'var(--color-accent)' }}>{tasks.length - completedCount}</strong></div>
              </div>
            </div>
          </div>

          <div className="dashboard-card status-panel">
            <h3>Muhimlik bo&apos;yicha</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
              {Object.entries(PRIORITY_MAP).map(([key, val]) => {
                const cnt = tasks.filter(tk => !tk.completed && tk.priority === key).length;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: val.color }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{val.label}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: cnt > 0 ? val.color : 'var(--text-muted)' }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
            {highCount > 0 && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#ef444415', border: '1px solid #ef444430', fontSize: '0.76rem', color: '#ef4444', fontWeight: 600 }}>
                ⚠️ {highCount} ta muhim vazifa kutmoqda!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tasklar;

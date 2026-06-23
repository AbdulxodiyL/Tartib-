import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, ClipboardList, Calendar } from 'lucide-react';
import { api } from '../../utils/api';

function Tasklar({ t }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState('');
  const [categoryType, setCategoryType] = useState('Ish');
  const [customCategory, setCustomCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    api.getTasks()
      .then((data) => setTasks(data.map(normalizeTask)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const normalizeTask = (t) => ({ ...t, dueDate: t.due_date || '' });

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    let finalCategory = categoryType;
    if (categoryType === 'custom') {
      finalCategory = customCategory.trim() || 'Boshqa';
    }

    try {
      const created = await api.addTask({
        text: newTaskText.trim(),
        category: finalCategory,
        due_date: dueDate || new Date().toISOString().split('T')[0],
      });
      setTasks([normalizeTask(created), ...tasks]);
      setNewTaskText('');
      setCustomCategory('');
      setDueDate('');
      if (categoryType === 'custom') setCategoryType('Ish');
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      const updated = await api.updateTask(id, { completed: !task.completed });
      setTasks(tasks.map((t) => (t.id === id ? normalizeTask(updated) : t)));
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const categoriesList = ['all', ...new Set(tasks.map((tk) => tk.category))];

  const filteredTasks = tasks.filter((task) => {
    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !task.completed) ||
      (statusFilter === 'completed' && task.completed);
    const catMatch = categoryFilter === 'all' || task.category === categoryFilter;
    return statusMatch && catMatch;
  });

  const getCategoryClass = (cat) => {
    const lower = cat.toLowerCase();
    if (lower === 'ish' || lower === 'work') return 'cat-work';
    if (lower === 'shaxsiy' || lower === 'personal') return 'cat-personal';
    if (lower === "o'qish" || lower === 'study') return 'cat-study';
    return 'cat-other';
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    return dateStr < new Date().toISOString().split('T')[0];
  };

  const completedCount = tasks.filter((tk) => tk.completed).length;

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{t.ts_title}</h1>
        <p className="page-subtitle">{t.ts_subtitle}</p>
      </div>

      <div className="tasks-layout">
        <div className="tasks-main dashboard-card">
          <form className="task-input-form" onSubmit={addTask}>
            <input
              type="text"
              className="task-input"
              placeholder={t.ts_placeholder}
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              required
            />
            <select
              className="category-select-task"
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
            >
              <option value="Ish">Ish</option>
              <option value="Shaxsiy">Shaxsiy</option>
              <option value="O'qish">O&apos;qish</option>
              <option value="custom">{t.ts_selectCustom}</option>
            </select>
            {categoryType === 'custom' && (
              <input
                type="text"
                className="task-input"
                style={{ maxWidth: '110px' }}
                placeholder={t.ts_customCat}
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            )}
            <input
              type="date"
              className="task-input"
              style={{ maxWidth: '150px' }}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <button type="submit" className="add-task-btn">
              <Plus size={16} />
              <span>{t.ts_add}</span>
            </button>
          </form>

          <div className="task-filters">
            <button className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
              {t.ts_filterAll} ({tasks.length})
            </button>
            <button className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => setStatusFilter('active')}>
              {t.ts_filterActive} ({tasks.length - completedCount})
            </button>
            <button className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`} onClick={() => setStatusFilter('completed')}>
              {t.ts_filterCompleted} ({completedCount})
            </button>
          </div>

          <div className="task-filters" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.5rem' }}>
              {t.ts_category}:
            </span>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                className={`filter-tab ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat === 'all' ? t.ts_filterAll : cat}
              </button>
            ))}
          </div>

          <div className="tasks-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-tasks">
                <ClipboardList size={40} className="empty-icon" />
                <p>{t.ts_empty}</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const overdue = isOverdue(task.dueDate) && !task.completed;
                return (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <div className="task-item-left" onClick={() => toggleTask(task.id)}>
                      <button className="check-btn">
                        {task.completed ? <Check size={14} /> : <span className="circle-placeholder" />}
                      </button>
                      <span className={`cat-badge ${getCategoryClass(task.category)}`}>{task.category}</span>
                      <span className="task-text">{task.text}</span>
                      {task.dueDate && (
                        <span style={{
                          fontSize: '0.72rem', display: 'flex', alignItems: 'center',
                          gap: '3px', marginLeft: 'auto',
                          color: overdue ? '#ef4444' : 'var(--text-muted)',
                          fontWeight: overdue ? '700' : '500', whiteSpace: 'nowrap'
                        }}>
                          <Calendar size={11} />
                          {overdue ? `${t.ts_overdue}: ` : ''}{task.dueDate}
                        </span>
                      )}
                    </div>
                    <button className="delete-task-btn" onClick={() => deleteTask(task.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="tasks-sidebar">
          <div className="dashboard-card status-panel">
            <h3>{t.ts_progress}</h3>
            <div className="progress-details">
              <div className="progress-circle-wrap">
                <div className="progress-value">
                  {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
                </div>
                <div className="progress-label">{t.ts_completedLabel}</div>
              </div>
              <div className="progress-info-rows">
                <div className="stat-row"><span>{t.ts_totalLabel}:</span><strong>{tasks.length}</strong></div>
                <div className="stat-row"><span>{t.ts_completedLabel}:</span><strong style={{ color: '#10b981' }}>{completedCount}</strong></div>
                <div className="stat-row"><span>{t.ts_remainingLabel}:</span><strong style={{ color: 'var(--color-accent)' }}>{tasks.length - completedCount}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tasklar;

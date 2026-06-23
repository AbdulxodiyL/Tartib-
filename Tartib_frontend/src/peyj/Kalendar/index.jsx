import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Clock, Trash2, CheckSquare } from 'lucide-react';
import { api } from '../../utils/api';

function Kalendar({ t }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventTitle, setNewEventTitle] = useState('');

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getEvents(monthKey),
      api.getTasks(),
    ])
      .then(([evData, tkData]) => {
        setEvents(evData);
        setTasks(tkData.map((tk) => ({ ...tk, dueDate: tk.due_date || '' })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [monthKey]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const calendarCells = [];
  for (let i = 0; i < startOffset; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const getDateStr = (day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const eventsForDay = (day) => events.filter((ev) => ev.date === getDateStr(day));
  const tasksForDay = (day) => tasks.filter((tk) => tk.dueDate === getDateStr(day));

  const selectedDateStr = getDateStr(selectedDay);
  const selectedEvents = events.filter((ev) => ev.date === selectedDateStr);
  const selectedTasks = tasks.filter((tk) => tk.dueDate === selectedDateStr);

  const addEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    try {
      const created = await api.addEvent({
        date: selectedDateStr,
        time: newEventTime,
        title: newEventTitle.trim(),
      });
      setEvents([...events, created].sort((a, b) =>
        a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
      ));
      setNewEventTitle('');
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteEvent = async (id) => {
    try {
      await api.deleteEvent(id);
      setEvents(events.filter((ev) => ev.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDay(1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDay(1);
  };

  const monthNames = {
    uz: ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  };

  const monthLabel = t.uz ? monthNames.uz[month] : monthNames.en[month];
  const todayDay = now.getDate();
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{t.cal_title}</h1>
        <p className="page-subtitle">{t.cal_subtitle}</p>
      </div>

      <div className="calendar-layout">
        {/* Main Calendar Grid */}
        <div className="calendar-main dashboard-card">
          <div className="calendar-header-nav">
            <h2>{monthLabel} {year}</h2>
            <div className="calendar-nav-arrows">
              <button className="nav-arrow-btn" onClick={prevMonth}><ChevronLeft size={14} /></button>
              <button className="nav-arrow-btn" onClick={nextMonth}><ChevronRight size={14} /></button>
            </div>
          </div>

          <div className="calendar-grid">
            {t.cal_weekdays.map((day) => (
              <div key={day} className="weekday-header">{day}</div>
            ))}
            {calendarCells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} className="calendar-day empty"></div>;
              const dayEvents = eventsForDay(day);
              const dayTasks = tasksForDay(day);
              const isSelected = selectedDay === day;
              const isToday = isCurrentMonth && day === todayDay;
              return (
                <div
                  key={`d-${day}`}
                  className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span className="day-number">{day}</span>
                  <span className="event-indicators">
                    {/* Ko'k nuqtalar — eventlar uchun */}
                    {dayEvents.slice(0, 2).map((_, i) => (
                      <span key={`ev-${i}`} className="indicator-dot" />
                    ))}
                    {/* Yashil nuqtalar — tasklar uchun */}
                    {dayTasks.slice(0, 2).map((_, i) => (
                      <span key={`tk-${i}`} className="indicator-dot" style={{ backgroundColor: '#10b981' }} />
                    ))}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Kichik legend */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
              {t.uz ? 'Rejalar' : 'Events'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              {t.uz ? 'Tasklar' : 'Tasks'}
            </span>
          </div>
        </div>

        {/* Right sidebar — Day Agenda */}
        <div className="calendar-sidebar">
          <div className="dashboard-card status-panel">
            <div className="agenda-header">
              <Calendar size={16} className="agenda-icon" />
              <h3>{t.cal_plansFor}: {selectedDay} {monthLabel}</h3>
            </div>

            {loading ? (
              <p className="empty-agenda-text">Yuklanmoqda...</p>
            ) : (
              <div className="agenda-list">
                {selectedEvents.length === 0 && selectedTasks.length === 0 ? (
                  <p className="empty-agenda-text">{t.cal_noPlans}</p>
                ) : (
                  <>
                    {/* Tasklar */}
                    {selectedTasks.length > 0 && (
                      <>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                          {t.uz ? 'Tasklar' : 'Tasks'}
                        </div>
                        {selectedTasks.map((tk) => (
                          <div
                            key={`tk-${tk.id}`}
                            className="agenda-item agenda-task-item"
                            style={{ borderLeftColor: tk.completed ? '#10b981' : 'var(--color-accent)', opacity: tk.completed ? 0.7 : 1 }}
                          >
                            <CheckSquare size={12} style={{ color: tk.completed ? '#10b981' : 'var(--color-accent)', flexShrink: 0 }} />
                            {tk.category && (
                              <span className="agenda-cat-tag">{tk.category}</span>
                            )}
                            <span
                              className="agenda-title"
                              style={{ textDecoration: tk.completed ? 'line-through' : 'none' }}
                            >
                              {tk.text}
                            </span>
                            {tk.completed && (
                              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginLeft: 'auto' }}>✓</span>
                            )}
                          </div>
                        ))}
                      </>
                    )}

                    {/* Eventlar */}
                    {selectedEvents.length > 0 && (
                      <>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: selectedTasks.length > 0 ? '0.5rem' : 0, marginBottom: '0.25rem' }}>
                          {t.uz ? 'Rejalar' : 'Events'}
                        </div>
                        {selectedEvents
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map((ev) => (
                            <div key={ev.id} className="agenda-item" style={{ justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                                <Clock size={12} className="agenda-time-icon" />
                                {ev.time && <span className="agenda-time">{ev.time}</span>}
                                <span className="agenda-title">{ev.title}</span>
                              </div>
                              <button className="delete-task-btn" onClick={() => deleteEvent(ev.id)}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            <form onSubmit={addEvent} className="agenda-creator-form">
              <h4>{t.cal_addNew}</h4>
              <div className="form-group inline-group">
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder={t.cal_planPlaceholder}
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="add-task-btn w-full">
                <Plus size={14} />
                <span>{t.cal_btnSubmit}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Kalendar;

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowDownLeft, ArrowUpRight, Wallet, TrendingDown } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../contexts/toast';
import { StatsSkeleton, CardSkeleton } from '../../components/Skeleton';
import BottomSheet from '../../components/BottomSheet';

const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));

const RESET_FORM = {
  source: '', amount: '', type: 'kirim', status: 'bajarildi',
  date: new Date().toISOString().split('T')[0],
};

function DaromadStatistica({ t }) {
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [summary,      setSummary]      = useState({ kirim: 0, chiqim: 0, qolgan: 0, pending: 0 });
  const [loading,      setLoading]      = useState(true);
  const [form,         setForm]         = useState(RESET_FORM);
  const [filter,       setFilter]       = useState('barchasi');
  const [showSheet,    setShowSheet]    = useState(false);

  const load = async () => {
    const [txs, sum] = await Promise.all([api.getTransactions(), api.getSummary()]);
    setTransactions(txs);
    setSummary(sum);
  };

  useEffect(() => {
    load().catch(console.error).finally(() => setLoading(false));
  }, []);

  const resetForm = () => setForm(RESET_FORM);

  const addTransaction = async (e) => {
    e?.preventDefault();
    if (!form.source.trim() || !form.amount) return;
    try {
      const created = await api.addTransaction({
        source: form.source.trim(),
        amount: parseFloat(form.amount),
        type:   form.type,
        status: form.status,
        date:   form.date || new Date().toISOString().split('T')[0],
      });
      setTransactions(prev => [created, ...prev]);
      const sum = await api.getSummary();
      setSummary(sum);
      resetForm();
      setShowSheet(false);
      toast.success(form.type === 'kirim' ? "Kirim qo'shildi!" : "Chiqim qo'shildi!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      setTransactions(prev => prev.filter(tx => tx.id !== id));
      const sum = await api.getSummary();
      setSummary(sum);
      toast.info("O'chirildi");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const visible = transactions.filter(tx =>
    filter === 'barchasi' ? true : tx.type === filter
  );

  /* ── Shared Form ── */
  const IncomeForm = () => (
    <form onSubmit={addTransaction} className="finance-form">
      {/* Type toggle */}
      <div className="fin-type-toggle" style={{ marginBottom: '0.75rem' }}>
        <button type="button"
          className={`fin-type-btn kirim-btn ${form.type === 'kirim' ? 'active' : ''}`}
          onClick={() => setForm(f => ({ ...f, type: 'kirim' }))}>
          <ArrowDownLeft size={14} /> Kirim
        </button>
        <button type="button"
          className={`fin-type-btn chiqim-btn ${form.type === 'chiqim' ? 'active' : ''}`}
          onClick={() => setForm(f => ({ ...f, type: 'chiqim' }))}>
          <TrendingDown size={14} /> Chiqim
        </button>
      </div>

      <div className="form-group">
        <label>{form.type === 'kirim' ? 'Manba (loyiha, ish)' : "Sabab (xarid, to'lov)"}</label>
        <input type="text" value={form.source}
          onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
          placeholder={form.type === 'kirim' ? 'Masalan: Freelance loyiha' : "Masalan: Ijara to'lovi"}
          required autoFocus />
      </div>
      <div className="form-group">
        <label>Miqdor (so'm)</label>
        <input type="number" value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          placeholder="500 000" min="0" step="1000" required />
      </div>
      <div className="form-group">
        <label>Sana</label>
        <input type="date" value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Holat</label>
        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
          <option value="bajarildi">Bajarildi</option>
          <option value="kutilmoqda">Kutilmoqda</option>
        </select>
      </div>
      <button type="submit" className="add-task-btn w-full"
        style={form.type === 'chiqim' ? { background: '#ef4444' } : {}}>
        <Plus size={16} />
        <span>{form.type === 'kirim' ? "Kirim qo'shish" : "Chiqim qo'shish"}</span>
      </button>
    </form>
  );

  if (loading) return (
    <div className="page-container">
      <div className="page-header">
        <div className="skeleton" style={{ width: '160px', height: '28px', borderRadius: '8px', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ width: '280px', height: '14px', borderRadius: '6px' }} />
      </div>
      <StatsSkeleton />
      <div className="stats-layout">
        <CardSkeleton rows={5} />
        <CardSkeleton rows={4} />
      </div>
    </div>
  );

  const balance = summary.qolgan ?? (summary.kirim - summary.chiqim);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">💰 Moliya</h1>
        <p className="page-subtitle">Kirim, chiqim va qolgan pulni kuzating</p>
      </div>

      {/* 3 ta stat karta */}
      <div className="fin-stats-row">
        <div className="dashboard-card fin-stat kirim">
          <div className="fin-stat-icon"><ArrowDownLeft size={20} /></div>
          <div className="fin-stat-info">
            <span className="fin-stat-label">Kirim</span>
            <strong className="fin-stat-val txt-green">{fmt(summary.kirim)} so'm</strong>
          </div>
        </div>

        <div className="dashboard-card fin-stat chiqim">
          <div className="fin-stat-icon chiqim-icon"><TrendingDown size={20} /></div>
          <div className="fin-stat-info">
            <span className="fin-stat-label">Chiqim</span>
            <strong className="fin-stat-val txt-red">{fmt(summary.chiqim)} so'm</strong>
          </div>
        </div>

        <div className={`dashboard-card fin-stat qolgan ${balance >= 0 ? 'positive' : 'negative'}`}>
          <div className={`fin-stat-icon ${balance >= 0 ? 'qolgan-icon' : 'minus-icon'}`}>
            <Wallet size={20} />
          </div>
          <div className="fin-stat-info">
            <span className="fin-stat-label">Qolgan (Balans)</span>
            <strong className={`fin-stat-val ${balance >= 0 ? 'txt-accent' : 'txt-red'}`}>
              {balance >= 0 ? '+' : ''}{fmt(balance)} so'm
            </strong>
          </div>
        </div>
      </div>

      {summary.pending > 0 && (
        <div className="fin-pending-bar">
          <ArrowUpRight size={14} style={{ color: '#f59e0b' }} />
          <span>Kutilayotgan: <strong style={{ color: '#f59e0b' }}>{fmt(summary.pending)} so'm</strong></span>
        </div>
      )}

      <div className="stats-layout">
        {/* Tarix jadval */}
        <div className="tasks-main dashboard-card">
          <div className="section-card-header" style={{ marginBottom: '0.75rem' }}>
            <h3>Tarix</h3>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['barchasi', 'kirim', 'chiqim'].map(f => (
                <button key={f}
                  className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                  {f === 'barchasi' ? 'Barchasi' : f === 'kirim' ? '↓ Kirim' : '↑ Chiqim'}
                </button>
              ))}
            </div>
          </div>

          <div className="tx-list">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Manba / Sabab</th>
                  <th>Sana</th>
                  <th>Miqdor</th>
                  <th>Tur</th>
                  <th>Holat</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Yozuvlar yo'q
                    </td>
                  </tr>
                ) : visible.map(tx => (
                  <tr key={tx.id}>
                    <td>
                      <div className="tx-name-wrap">
                        <span className={`tx-type-dot ${tx.type === 'kirim' ? 'dot-green' : 'dot-red'}`} />
                        {tx.source}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{tx.date}</td>
                    <td className={`tx-amount ${tx.type === 'kirim' ? 'txt-green' : 'txt-red'}`}>
                      {tx.type === 'kirim' ? '+' : '-'}{fmt(tx.amount)} so'm
                    </td>
                    <td>
                      <span className={`tx-type-badge ${tx.type === 'kirim' ? 'badge-kirim' : 'badge-chiqim'}`}>
                        {tx.type === 'kirim' ? '↓ Kirim' : '↑ Chiqim'}
                      </span>
                    </td>
                    <td>
                      <span className={`tx-status ${tx.status === 'bajarildi' ? 'completed' : 'pending'}`}>
                        {tx.status === 'bajarildi' ? 'Bajarildi' : 'Kutilmoqda'}
                      </span>
                    </td>
                    <td>
                      <button className="delete-task-btn" onClick={() => deleteTransaction(tx.id)}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Desktop sidebar form */}
        <div className="tasks-sidebar desktop-only">
          <div className="dashboard-card status-panel">
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Yangi yozuv</h3>
            <IncomeForm />
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <button className="page-fab income-fab" onClick={() => setShowSheet(true)} aria-label="Yozuv qo'shish">
        <Plus size={24} />
      </button>

      {/* Mobile Bottom Sheet */}
      <BottomSheet open={showSheet} onClose={() => { setShowSheet(false); resetForm(); }} title="💰 Yozuv qo'shish">
        <IncomeForm />
      </BottomSheet>
    </div>
  );
}

export default DaromadStatistica;

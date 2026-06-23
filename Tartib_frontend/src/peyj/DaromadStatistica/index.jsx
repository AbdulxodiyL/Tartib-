import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, ArrowUpRight, Briefcase, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';

function DaromadStatistica({ t }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ earned: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [sourceInput, setSourceInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [statusInput, setStatusInput] = useState('bajarildi');

  useEffect(() => {
    Promise.all([api.getTransactions(), api.getSummary()])
      .then(([txs, sum]) => {
        setTransactions(txs);
        setSummary(sum);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const refreshSummary = async () => {
    const sum = await api.getSummary();
    setSummary(sum);
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!sourceInput.trim() || !amountInput) return;
    try {
      const created = await api.addTransaction({
        source: sourceInput.trim(),
        amount: parseFloat(amountInput),
        status: statusInput,
        date: new Date().toISOString().split('T')[0],
      });
      setTransactions([created, ...transactions]);
      await refreshSummary();
      setSourceInput('');
      setAmountInput('');
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      setTransactions(transactions.filter((tx) => tx.id !== id));
      await refreshSummary();
    } catch (err) {
      alert(err.message);
    }
  };

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
        <h1 className="page-title">{t.inc_title}</h1>
        <p className="page-subtitle">{t.inc_subtitle}</p>
      </div>

      <div className="financial-grid">
        <div className="dashboard-card finance-card balance-card">
          <div className="finance-card-icon-wrap bg-green">
            <DollarSign size={20} />
          </div>
          <div className="finance-card-info">
            <span>{t.inc_earned}</span>
            <h2>${summary.earned.toLocaleString()}</h2>
            <p className="txt-green"><ArrowUpRight size={12} /> {t.inc_growth}</p>
          </div>
        </div>

        <div className="dashboard-card finance-card balance-card">
          <div className="finance-card-icon-wrap bg-yellow">
            <Briefcase size={20} />
          </div>
          <div className="finance-card-info">
            <span>{t.inc_pending}</span>
            <h2>${summary.pending.toLocaleString()}</h2>
            <p className="txt-yellow"><ArrowUpRight size={12} /> {t.inc_planned}</p>
          </div>
        </div>
      </div>

      <div className="stats-layout">
        <div className="tasks-main dashboard-card">
          <div className="section-card-header">
            <h3>{t.inc_history}</h3>
          </div>

          <div className="tx-list">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>{t.inc_colSource}</th>
                  <th>{t.inc_colDate}</th>
                  <th>{t.inc_colAmount}</th>
                  <th>{t.inc_colStatus}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Daromad tarixi yo&apos;q</td></tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td><div className="tx-name">{tx.source}</div></td>
                      <td>{tx.date}</td>
                      <td className="tx-amount">${tx.amount}</td>
                      <td>
                        <span className={`tx-status ${tx.status === 'bajarildi' ? 'completed' : 'pending'}`}>
                          {tx.status === 'bajarildi' ? t.inc_statusCompleted : t.inc_statusPending}
                        </span>
                      </td>
                      <td>
                        <button
                          className="delete-task-btn"
                          onClick={() => deleteTransaction(tx.id)}
                          title="O'chirish"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tasks-sidebar">
          <div className="dashboard-card status-panel">
            <h3>{t.inc_addNew}</h3>
            <form onSubmit={addTransaction} className="finance-form">
              <div className="form-group">
                <label>{t.inc_projectSource}</label>
                <input
                  type="text"
                  value={sourceInput}
                  onChange={(e) => setSourceInput(e.target.value)}
                  placeholder={t.inc_projectPlaceholder}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.inc_amount}</label>
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="300"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.inc_colStatus}</label>
                <select value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
                  <option value="bajarildi">{t.inc_statusCompleted}</option>
                  <option value="kutilmoqda">{t.inc_statusPending}</option>
                </select>
              </div>
              <button type="submit" className="add-task-btn w-full">
                <Plus size={16} />
                <span>{t.inc_btnSubmit}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DaromadStatistica;

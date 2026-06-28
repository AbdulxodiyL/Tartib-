import { useState, useEffect } from 'react';
import { Crown, Check, X, Zap, Sparkles, Star, Lock, CreditCard, Shield, ArrowLeft } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../contexts/toast';
import './style.css';

const PLANS = [
  {
    id: 'monthly',
    months: 1,
    label: '1 Oy',
    price: '69 000',
    priceUSD: '$5.5',
    perMonth: '69 000',
    badge: null,
  },
  {
    id: 'quarterly',
    months: 3,
    label: '3 Oy',
    price: '179 000',
    priceUSD: '$14',
    perMonth: '59 667',
    badge: '14% tejash',
  },
  {
    id: 'yearly',
    months: 12,
    label: '1 Yil',
    price: '599 000',
    priceUSD: '$47',
    perMonth: '49 917',
    badge: '28% tejash 🔥',
    popular: true,
  },
];

const FREE_FEATURES = [
  { text: '10 ta vazifa', ok: true },
  { text: '3 ta odat', ok: true },
  { text: '10 ta AI xabar/kun', ok: true },
  { text: 'Asosiy Pomodoro timer', ok: true },
  { text: 'Cheksiz vazifalar', ok: false },
  { text: 'Cheksiz odatlar', ok: false },
  { text: 'Cheksiz AI chat', ok: false },
  { text: 'Premium temalar', ok: false },
  { text: 'Kengaytirilgan statistika', ok: false },
];

const PREMIUM_FEATURES = [
  { text: 'Cheksiz vazifalar', ok: true },
  { text: 'Cheksiz odatlar', ok: true },
  { text: 'Cheksiz AI chat (ovoz + matn)', ok: true },
  { text: 'Barcha premium temalar', ok: true },
  { text: 'Kengaytirilgan haftalik statistika', ok: true },
  { text: 'Pomodoro + vazifa ulash', ok: true },
  { text: 'Daromad hisobot eksport', ok: true },
  { text: 'Ustun texnik yordam', ok: true },
  { text: '⭐ Premium nishon', ok: true },
];

export default function Premium({ user, onBack, onUpgrade }) {
  const toast = useToast();
  const [selected, setSelected]   = useState('yearly');
  const [sub, setSub]             = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [card, setCard]           = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [step, setStep]           = useState('plans'); // plans | payment | success

  useEffect(() => {
    api.getSubscription().then(setSub).catch(() => {});
  }, []);

  const isPremium = sub?.plan === 'premium';

  const formatCard = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleActivate = async () => {
    const plan = PLANS.find(p => p.id === selected);
    setLoading(true);
    try {
      const result = await api.activateSubscription({ months: plan.months });
      setSub(result);
      setStep('success');
      onUpgrade?.({ ...user, plan: 'premium' });
      toast.success(`Premium faollashtirildi! ${result.daysLeft} kun`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = PLANS.find(p => p.id === selected);

  if (step === 'success') {
    return (
      <div className="premium-page">
        <div className="premium-success">
          <div className="success-crown">👑</div>
          <h2>Tabriklaymiz!</h2>
          <p>Siz endi <strong>Tartib Premium</strong> foydalanuvchisiz.</p>
          <p className="success-sub">Barcha cheklovlar olib tashlandi. Cheksiz imkoniyatlardan bahramand bo'ling!</p>
          <div className="success-features">
            {['Cheksiz vazifalar ✅', 'Cheksiz AI chat ✅', 'Premium temalar ✅', 'Ustun yordam ✅'].map(f => (
              <span key={f} className="success-chip">{f}</span>
            ))}
          </div>
          <button className="premium-back-btn" onClick={onBack}>
            <ArrowLeft size={16} /> Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-page">
      <div className="premium-hero">
        <button className="premium-back" onClick={onBack}><ArrowLeft size={18} /></button>
        <Crown size={32} className="premium-crown-icon" />
        <h1>Tartib Premium</h1>
        <p>Cheksiz imkoniyatlar, AI hamroh, ustun tajriba</p>
        {isPremium && (
          <div className="premium-active-badge">
            <Crown size={14} /> Premium faol — {sub.daysLeft} kun qoldi
          </div>
        )}
      </div>

      {!isPremium && (
        <>
          {/* Plan cards */}
          <div className="premium-plans">
            {PLANS.map(plan => (
              <button
                key={plan.id}
                className={`premium-plan-card ${selected === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                onClick={() => setSelected(plan.id)}
              >
                {plan.popular && <div className="plan-popular-badge"><Star size={11} /> Ko'p tanlanadi</div>}
                {plan.badge && !plan.popular && <div className="plan-save-badge">{plan.badge}</div>}
                <div className="plan-duration">{plan.label}</div>
                <div className="plan-price">
                  <span className="plan-price-val">{plan.price}</span>
                  <span className="plan-price-cur"> UZS</span>
                </div>
                <div className="plan-per-month">{plan.perMonth} UZS/oy</div>
              </button>
            ))}
          </div>

          {/* Payment button */}
          <div className="premium-cta-wrap">
            <button className="premium-buy-btn" onClick={() => setStep('payment')}>
              <CreditCard size={18} />
              {selectedPlan.price} UZS — Sotib olish
            </button>
            <button className="premium-demo-btn" onClick={handleActivate} disabled={loading}>
              <Zap size={15} />
              {loading ? 'Faollashtirilmoqda...' : 'Demo rejimida sinab ko\'rish (bepul)'}
            </button>
            <p className="premium-demo-hint">* Demo rejim haqiqiy pul olinmaydi. Keyinchalik Payme/Click ulash mumkin.</p>
          </div>
        </>
      )}

      {isPremium && (
        <div className="premium-manage">
          <div className="premium-status-card">
            <Crown size={22} className="txt-gold" />
            <div>
              <div className="ps-title">Premium Faol</div>
              <div className="ps-sub">{sub?.daysLeft} kun qoldi · {new Date(sub?.expires).toLocaleDateString('uz-UZ')}</div>
            </div>
          </div>
          <button className="premium-cancel-btn" onClick={async () => {
            if (!confirm('Premium ni bekor qilasizmi?')) return;
            await api.cancelSubscription();
            setSub({ plan: 'free' });
            toast.info("Premium bekor qilindi.");
          }}>
            Bekor qilish
          </button>
        </div>
      )}

      {/* Feature comparison */}
      <div className="premium-compare">
        <div className="compare-col">
          <div className="compare-header free-header">
            <span>Bepul</span>
          </div>
          {FREE_FEATURES.map((f, i) => (
            <div key={i} className="compare-row">
              {f.ok
                ? <Check size={14} className="compare-ok" />
                : <X    size={14} className="compare-no" />
              }
              <span className={f.ok ? '' : 'compare-striked'}>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="compare-col premium-col">
          <div className="compare-header premium-header">
            <Crown size={14} /> <span>Premium</span>
          </div>
          {PREMIUM_FEATURES.map((f, i) => (
            <div key={i} className="compare-row">
              <Check size={14} className="compare-ok" />
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guarantees */}
      <div className="premium-guarantees">
        <div className="guarantee-item">
          <Shield size={18} className="txt-green" />
          <div>
            <div className="g-title">Xavfsiz to'lov</div>
            <div className="g-sub">UzCard / Humo / Visa</div>
          </div>
        </div>
        <div className="guarantee-item">
          <Sparkles size={18} className="txt-indigo" />
          <div>
            <div className="g-title">Istalgan vaqt bekor</div>
            <div className="g-sub">Majburiy emas</div>
          </div>
        </div>
        <div className="guarantee-item">
          <Zap size={18} className="txt-yellow" />
          <div>
            <div className="g-title">Darhol faollashtirish</div>
            <div className="g-sub">To'lovdan so'ng 1 daqiqa</div>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {step === 'payment' && (
        <div className="payment-overlay" onClick={e => e.target === e.currentTarget && setStep('plans')}>
          <div className="payment-modal">
            <div className="payment-header">
              <CreditCard size={20} />
              <h3>To'lov</h3>
              <button className="payment-close" onClick={() => setStep('plans')}><X size={18} /></button>
            </div>

            <div className="payment-summary">
              <Crown size={14} className="txt-gold" />
              <span>Premium — {selectedPlan.label}</span>
              <strong>{selectedPlan.price} UZS</strong>
            </div>

            <div className="payment-form">
              <label>Karta raqami</label>
              <input
                className="payment-input"
                placeholder="0000 0000 0000 0000"
                value={card.number}
                onChange={e => setCard(c => ({ ...c, number: formatCard(e.target.value) }))}
                maxLength={19}
              />
              <label>Karta egasining ismi</label>
              <input
                className="payment-input"
                placeholder="IVAN IVANOV"
                value={card.name}
                onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
              />
              <div className="payment-row">
                <div>
                  <label>Muddati</label>
                  <input
                    className="payment-input"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                    maxLength={5}
                  />
                </div>
                <div>
                  <label>CVV</label>
                  <input
                    className="payment-input"
                    placeholder="***"
                    type="password"
                    value={card.cvv}
                    onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                    maxLength={3}
                  />
                </div>
              </div>

              <button
                className="payment-submit-btn"
                onClick={handleActivate}
                disabled={loading}
              >
                {loading ? 'Kutib turing...' : `${selectedPlan.price} UZS — To'lash`}
              </button>
              <p className="payment-secure"><Shield size={12} /> 256-bit SSL shifrlash bilan himoyalangan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

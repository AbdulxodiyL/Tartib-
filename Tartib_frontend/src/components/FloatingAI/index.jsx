import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { api } from '../../utils/api';
import './style.css';

function FloatingAI({ t }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: t?.ai_welcome || "Salom! Men Tartib AI yordamchisiman. Qanday yordam bera olaman?" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, messages]);

  const send = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const data = await api.aiChat({ message: input.trim(), history: messages.slice(-6) });
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'ai',
        text: t?.ai_productivity_tip_1 || "Samaradorlik uchun eng muhim vazifalarni tanlang va ularga fokuslanib ishlang."
      }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button className={`fab-ai-btn ${open ? 'open' : ''}`} onClick={() => setOpen(v => !v)} aria-label="AI Yordamchi">
        {open ? <X size={22} /> : <Bot size={22} />}
        {!open && <span className="fab-ai-pulse" />}
      </button>

      {/* Chat panel */}
      <div className={`fab-chat-panel ${open ? 'visible' : ''}`}>
        <div className="fab-chat-header">
          <div className="fab-chat-header-left">
            <div className="fab-chat-avatar"><Sparkles size={14} /></div>
            <div>
              <div className="fab-chat-title">AI Yordamchi</div>
              <div className="fab-chat-status">● Faol</div>
            </div>
          </div>
          <button className="fab-chat-close" onClick={() => setOpen(false)}><X size={16} /></button>
        </div>

        <div className="fab-chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`fab-msg-row ${msg.sender}`}>
              {msg.sender === 'ai' && <div className="fab-msg-icon"><Bot size={12} /></div>}
              <div className="fab-msg-bubble">{msg.text}</div>
            </div>
          ))}
          {typing && (
            <div className="fab-msg-row ai">
              <div className="fab-msg-icon"><Bot size={12} /></div>
              <div className="fab-msg-bubble fab-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form className="fab-chat-input" onSubmit={send}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Savol bering..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim() || typing}>
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Backdrop (mobilda) */}
      {open && <div className="fab-backdrop" onClick={() => setOpen(false)} />}
    </>
  );
}

export default FloatingAI;

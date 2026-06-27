import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Sparkles, Mic, MicOff, CheckCircle } from 'lucide-react';
import { api } from '../../utils/api';
import './style.css';

const TASK_RE = /\[TASK:(\{[^}]+\})\]/s;

function parseAIResponse(raw) {
  const match = raw.match(TASK_RE);
  if (!match) return { text: raw, taskData: null };
  try {
    const taskData = JSON.parse(match[1]);
    const text = raw.replace(TASK_RE, '').trim();
    return { text, taskData };
  } catch {
    return { text: raw, taskData: null };
  }
}

function FloatingAI({ t }) {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Salom! Men Tartib AI yordamchisiman 🤖\n\nVazifa qo'shish uchun: \"X vazifasini qo'sh\" deb yozing yoki mikrofon tugmasini bosib gapirib bering!" }
  ]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
  const [listening, setListening] = useState(false);
  const endRef    = useRef(null);
  const inputRef  = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 300);
    }
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Voice input ── */
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Brauzeringiz ovozni qo'llab-quvvatlamaydi. Chrome yoki Edge ishlating.");
      return;
    }
    const rec = new SR();
    rec.lang = 'uz-UZ';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart  = () => setListening(true);
    rec.onend    = () => setListening(false);
    rec.onerror  = () => setListening(false);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    recognitionRef.current = rec;
    rec.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  /* ── Send message ── */
  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || typing) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const data = await api.aiChat({ message: text, history: messages.slice(-6) });
      const { text: replyText, taskData } = parseAIResponse(data.reply);

      if (taskData?.text) {
        try {
          await api.addTask({
            text:     taskData.text,
            category: taskData.category || 'Boshqa',
            priority: taskData.priority || 'medium',
          });
          setMessages(prev => [
            ...prev,
            { id: Date.now() + 1, sender: 'ai', text: replyText || 'Bajarildi!' },
            { id: Date.now() + 2, sender: 'task_added', text: taskData.text, category: taskData.category, priority: taskData.priority },
          ]);
        } catch {
          setMessages(prev => [...prev, {
            id: Date.now() + 1, sender: 'ai',
            text: replyText + "\n\n⚠️ Vazifani saqlashda xato yuz berdi."
          }]);
        }
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: replyText }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'ai',
        text: "Kechirasiz, xato yuz berdi. Qayta urinib ko'ring."
      }]);
    } finally {
      setTyping(false);
    }
  };

  const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

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
              <div className="fab-chat-status">
                {listening ? '🎙️ Tinglayapman...' : '● Faol'}
              </div>
            </div>
          </div>
          <button className="fab-chat-close" onClick={() => setOpen(false)}><X size={16} /></button>
        </div>

        <div className="fab-chat-messages">
          {messages.map(msg => {
            if (msg.sender === 'task_added') {
              return (
                <div key={msg.id} className="fab-task-added">
                  <CheckCircle size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div>
                    <div className="fab-task-added-label">Vazifa qo'shildi ✅</div>
                    <div className="fab-task-added-text">{msg.text}</div>
                    <div className="fab-task-added-meta">
                      <span>{msg.category}</span>
                      <span style={{ color: PRIORITY_COLOR[msg.priority] }}>
                        {msg.priority === 'high' ? '🔴 Yuqori' : msg.priority === 'low' ? '🟢 Past' : "🟡 O'rta"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div key={msg.id} className={`fab-msg-row ${msg.sender}`}>
                {msg.sender === 'ai' && <div className="fab-msg-icon"><Bot size={12} /></div>}
                <div className="fab-msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              </div>
            );
          })}
          {typing && (
            <div className="fab-msg-row ai">
              <div className="fab-msg-icon"><Bot size={12} /></div>
              <div className="fab-msg-bubble fab-typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form className="fab-chat-input" onSubmit={send}>
          <button
            type="button"
            className={`fab-mic-btn ${listening ? 'recording' : ''}`}
            onClick={listening ? stopListening : startListening}
            title={listening ? "To'xtatish" : "Ovozdan yozish"}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder={listening ? "Gapirayapsiz..." : "Savol yoki vazifa qo'shing..."}
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

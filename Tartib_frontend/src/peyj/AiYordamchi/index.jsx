import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User, Trash2 } from 'lucide-react';
import { translations } from '../../utils/translations';
import { api } from '../../utils/api';
import './style.css';

function AiYordamchi({ t: propsT }) {
  const t = propsT || translations.uz;

  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: t.ai_welcome }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const suggestions = [
    t.ai_suggestion_1,
    t.ai_suggestion_2,
    t.ai_suggestion_3,
    t.ai_suggestion_4,
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input.trim() };
    const history = messages.slice(-6);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await api.aiChat({ message: input.trim(), history });
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.reply }]);
    } catch {
      const fallbackIdx = Math.floor(Math.random() * 5);
      const fallbacks = [t.ai_productivity_tip_1, t.ai_productivity_tip_2, t.ai_productivity_tip_3, t.ai_productivity_tip_4, t.ai_productivity_tip_5];
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: fallbacks[fallbackIdx] }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: 1, sender: 'ai', text: t.ai_welcome }]);
  };

  return (
    <div className="page-container">
      <div className="page-header flex-header">
        <div>
          <h1 className="page-title flex-title">
            <Sparkles size={24} className="txt-ai" />
            {t.ai_title}
          </h1>
          <p className="page-subtitle">{t.ai_subtitle}</p>
        </div>
        <button className="clear-chat-btn" onClick={clearChat}>
          <Trash2 size={16} />
          <span>{t.ai_clear}</span>
        </button>
      </div>

      <div className="ai-chat-layout dashboard-card">
        <div className="chat-messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-row ${msg.sender === 'user' ? 'user' : 'ai'}`}>
              <div className="chat-avatar">
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="chat-bubble">
                <p>{msg.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-bubble-row ai">
              <div className="chat-avatar"><Bot size={16} /></div>
              <div className="chat-bubble typing-bubble">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-suggestions">
          {suggestions.map((sug, i) => (
            <button key={i} className="suggestion-tag" onClick={() => setInput(sug)}>
              {sug}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            placeholder={t.ai_placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="chat-input-field"
          />
          <button type="submit" className="chat-send-btn">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AiYordamchi;

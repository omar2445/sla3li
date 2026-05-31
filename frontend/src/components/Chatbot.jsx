import { useState, useRef, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import logoMark from '../logo/Selaali-LeafBag-mark.svg';

const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
const API_KEY = import.meta.env.VITE_QWEN_API_KEY;

const SYSTEM_PROMPT = `You are a helpful assistant for SELAALI, a B2B marketplace connecting wholesalers, retailers, and delivery drivers in Algeria.

You help users with:
- Finding products and suppliers
- Understanding how to place and track orders
- Explaining how to register and get verified
- Answering questions about the platform features
- Helping with account and dashboard questions

Keep answers short, friendly, and practical. If you don't know something specific about the platform, suggest the user contact support.`;

export default function Chatbot() {
  const { t, isRTL } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t.chatbotWelcome }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const langInstruction = `Reply ONLY in the same language as this message: "${text}". Do not use any other language.`;

    try {
      const res = await fetch(QWEN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages,
            { role: 'system', content: langInstruction },
          ],
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || t.chatbotError;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t.chatbotError }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-20 h-20 rounded-full bg-[#0A1410] hover:scale-110 shadow-xl shadow-black/30 flex items-center justify-center transition-all border-2 border-[#22C57A]/40"
        aria-label={t.chatbotTitle}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#22C57A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <img src={logoMark} alt="SELAALI" className="w-12 h-12" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className={`fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200`}
          style={{ height: '460px' }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="bg-[#0A1410] px-4 py-3 flex items-center gap-3 border-b border-[#22C57A]/20">
            <div className="w-8 h-8 rounded-full bg-[#22C57A]/10 flex items-center justify-center">
              <img src={logoMark} alt="" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{t.chatbotTitle}</p>
              <p className="text-[#22C57A] text-xs">{t.chatbotSubtitle}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#0E8F5A] text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t.chatbotPlaceholder}
              rows={1}
              className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C57A] focus:border-transparent"
              style={{ maxHeight: '80px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-[#22C57A] hover:bg-[#0E8F5A] disabled:opacity-40 text-white flex items-center justify-center transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

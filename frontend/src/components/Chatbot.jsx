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

// Suggestion sets keyed by topic
const SUGGESTIONS = {
  initial: [
    { en: 'How do I register?',           ar: 'كيف أسجل في المنصة؟' },
    { en: 'How do I place an order?',     ar: 'كيف أطلب منتجاً؟' },
    { en: 'How can I track my delivery?', ar: 'كيف أتابع توصيلتي؟' },
    { en: 'What documents are required?', ar: 'ما المستندات المطلوبة؟' },
    { en: 'How do I add products?',       ar: 'كيف أضيف منتجات؟' },
    { en: 'What is a wholesaler?',        ar: 'ما هو تاجر الجملة؟' },
  ],
  register: [
    { en: 'What documents do I need?',      ar: 'ما المستندات المطلوبة للتسجيل؟' },
    { en: 'How long does approval take?',   ar: 'كم يستغرق وقت الموافقة؟' },
    { en: 'Can I register as a driver?',    ar: 'هل يمكنني التسجيل كسائق توصيل؟' },
    { en: 'How do I update my documents?',  ar: 'كيف أحدّث مستنداتي؟' },
  ],
  order: [
    { en: 'How do I cancel an order?',     ar: 'كيف أُلغي طلبي؟' },
    { en: 'How do I track my order?',      ar: 'كيف أتابع طلبي على الخريطة؟' },
    { en: 'What is the minimum order?',    ar: 'ما هو الحد الأدنى للطلب؟' },
    { en: 'Can I order from multiple suppliers?', ar: 'هل يمكنني الطلب من أكثر من مورد؟' },
  ],
  delivery: [
    { en: 'Who delivers my order?',          ar: 'من يوصل طلبي؟' },
    { en: 'How long does delivery take?',    ar: 'كم يستغرق التوصيل؟' },
    { en: 'How does the map tracking work?', ar: 'كيف يعمل التتبع على الخريطة؟' },
    { en: 'What if delivery fails?',         ar: 'ماذا يحدث إذا فشل التوصيل؟' },
  ],
  product: [
    { en: 'How do I add a product?',          ar: 'كيف أضيف منتجاً جديداً؟' },
    { en: 'Can I upload product images?',     ar: 'هل يمكنني رفع صور للمنتج؟' },
    { en: 'How do I set a minimum order?',    ar: 'كيف أحدد الحد الأدنى للطلب؟' },
    { en: 'How do I deactivate a product?',   ar: 'كيف أوقف عرض منتج مؤقتاً؟' },
  ],
  account: [
    { en: 'How do I change my password?',    ar: 'كيف أغير كلمة المرور؟' },
    { en: 'How do I update my profile?',     ar: 'كيف أحدّث معلوماتي الشخصية؟' },
    { en: 'How do I add a profile photo?',   ar: 'كيف أضيف صورة شخصية؟' },
    { en: 'How do I renew expired documents?', ar: 'كيف أجدد المستندات المنتهية؟' },
  ],
};

function pickSuggestions(lastReply) {
  if (!lastReply) return SUGGESTIONS.initial;
  const l = lastReply.toLowerCase();
  if (l.includes('register') || l.includes('sign up') || l.includes('verif') || l.includes('approv')) return SUGGESTIONS.register;
  if (l.includes('deliver') || l.includes('track') || l.includes('driver') || l.includes('map')) return SUGGESTIONS.delivery;
  if (l.includes('order') || l.includes('place') || l.includes('cart') || l.includes('checkout')) return SUGGESTIONS.order;
  if (l.includes('product') || l.includes('catalog') || l.includes('upload') || l.includes('image')) return SUGGESTIONS.product;
  if (l.includes('password') || l.includes('profile') || l.includes('account') || l.includes('document')) return SUGGESTIONS.account;
  return SUGGESTIONS.initial;
}

function SuggestionChips({ suggestions, onSelect, lang, isRTL }) {
  return (
    <div className={`flex flex-wrap gap-1.5 px-4 pb-3 ${isRTL ? 'justify-end' : 'justify-start'}`}>
      {suggestions.slice(0, 4).map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(lang === 'ar' ? s.ar : s.en)}
          className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#22C57A]/40 text-[#0E8F5A] hover:bg-[#22C57A]/10 hover:border-[#22C57A] transition-all font-medium shadow-sm whitespace-nowrap"
        >
          {lang === 'ar' ? s.ar : s.en}
        </button>
      ))}
    </div>
  );
}

export default function Chatbot() {
  const { t, lang, isRTL } = useLang();
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

  const sendMessage = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const langInstruction = `Reply ONLY in the same language as this message: "${msg}". Do not use any other language.`;

    try {
      const res = await fetch(QWEN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Show suggestions after the last assistant message (not while loading)
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
  const suggestions = pickSuggestions(
    messages.length === 1 ? null : lastAssistantMsg?.content
  );
  const showSuggestions = !loading;

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
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          style={{ height: '500px' }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="bg-[#0A1410] px-4 py-3 flex items-center gap-3 border-b border-[#22C57A]/20 shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#22C57A]/10 flex items-center justify-center">
              <img src={logoMark} alt="" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{t.chatbotTitle}</p>
              <p className="text-[#22C57A] text-xs">{t.chatbotSubtitle}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#0E8F5A] text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                  }`}>
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

            {/* Suggestion chips — shown after last assistant message */}
            {showSuggestions && (
              <SuggestionChips
                suggestions={suggestions}
                onSelect={sendMessage}
                lang={lang}
                isRTL={isRTL}
              />
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white flex gap-2 items-end shrink-0">
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
              onClick={() => sendMessage()}
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

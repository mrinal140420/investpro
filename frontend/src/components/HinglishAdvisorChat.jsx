import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles, X, Key, ShieldCheck, HelpCircle, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { format_indian_currency } from '../utils/formatters';

const QUICK_PROMPTS = [
  "Bhai, S&P 500 FoF kyu zaroori hai?",
  "10% Step-up SIP se wealth pe kitna fark padega?",
  "Section 112A tax harvesting kaise kaam karti hai?",
  "Emergency fund ke liye Liquid Fund vs Bank FD me kya better hai?",
  "Market crash hua toh mera portfolio kaise react karega?"
];

export default function HinglishAdvisorChat({ params, fundUniverse }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Namaste! Main aapka **FinBhai AI Copilot** hoon 🤖. Aapke active portfolio, 10% Step-Up SIP, S&P 500 FoF, aur Section 112A tax savings ke regarding jo bhi doubts hain, poochiye!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    try {
      return localStorage.getItem('gemini_api_key') || '';
    } catch {
      return '';
    }
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSaveApiKey = (key) => {
    setGeminiApiKey(key);
    try {
      localStorage.setItem('gemini_api_key', key);
    } catch {}
    setShowKeyInput(false);
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/chat/hinglish-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          portfolio_context: {
            monthly_sip: params?.monthly_investable_sip || 25000.0,
            lump_sum: params?.lump_sum_amount || 0.0,
            target_amount: params?.near_target_amount || 5000000.0,
            target_date: params?.near_target_date || '2028-12-31',
            ctc_lpa: params?.current_ctc_lpa || 12.0,
            risk_mode: params?.risk_mode || 'global_multi_asset'
          },
          conversation_history: messages.slice(-6),
          custom_gemini_key: geminiApiKey || null
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: data.source
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: "Bhai, network me thoda issue lag raha hai. Par aapka portfolio track par hai! Thodi der baad try karo.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "Bhai, connection timeout hua. Please check your internet or retry!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Floating Launch Button ── */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-2xl transition-all transform hover:scale-105 border border-cyan-400/30 cursor-pointer"
            aria-label="Open AI FinBhai Advisor Chat"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span>FinBhai AI Copilot</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-400/30 text-emerald-200 text-[10px] font-mono font-bold">
              Hinglish
            </span>
          </button>
        )}
      </div>

      {/* ── Sliding Chat Drawer / Modal ── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#0f172a] to-[#1e293b] border-b border-[var(--border)] flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">FinBhai AI Advisor</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400">Portfolio-Grounded Hinglish Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                title="Gemini API Key Settings"
                className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Optional Gemini API Key Banner */}
          {showKeyInput && (
            <div className="p-3 bg-[var(--surface-2)] border-b border-[var(--border)] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--text-1)] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Gemini API Key (Optional)
                </span>
                <span className="text-[10px] text-[var(--text-3)]">Saved locally</span>
              </div>
              <input
                type="password"
                placeholder="AIzaSy... (Leave empty for default AI)"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)] font-mono"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveApiKey(geminiApiKey)}
                  className="px-2.5 py-1 rounded bg-[var(--accent)] text-white text-[11px] font-semibold cursor-pointer"
                >
                  Save Key
                </button>
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 text-[10px] mt-0.5">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3 rounded-xl leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-[var(--accent)] text-white rounded-br-none shadow-sm'
                      : 'bg-[var(--surface-2)] text-[var(--text-1)] border border-[var(--border)] rounded-bl-none shadow-sm'
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  <span className={`text-[9px] block mt-1 text-right font-mono ${m.sender === 'user' ? 'text-white/70' : 'text-[var(--text-3)]'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-[var(--text-3)] font-mono">
                <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>FinBhai soch raha hai...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--surface-2)] flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-full bg-[var(--surface)] hover:bg-[var(--border)] border border-[var(--border)] text-[11px] text-[var(--text-2)] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[var(--surface)] border-t border-[var(--border)] flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Poochiye (e.g. S&P 500 FoF kyu zaroori hai?)..."
              className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)] font-medium"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              className="p-2 rounded-lg bg-[var(--accent)] hover:opacity-90 disabled:opacity-40 text-white transition-all cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}

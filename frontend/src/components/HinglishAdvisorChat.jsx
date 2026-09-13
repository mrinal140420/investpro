import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles, X, Key, ShieldCheck, HelpCircle, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { format_indian_currency } from '../utils/formatters.js';
import { generateFinBhaiResponse } from '../utils/financialCalculations.js';

const QUICK_PROMPTS = [
  "Kya yeh target sambhav hai jo maine set kiya hai?",
  "Bhai, mera plan kesa hai review karo?",
  "Itne me kya hi hoga (₹300 SIP se kya banega)?",
  "10% Step-Up SIP se mujhe kitna extra wealth milega?",
  "S&P 500 Index FoF hamare portfolio me kyu zaroori hai?",
  "Budget 2024 Section 112A tax harvesting kaise karein?",
  "Market crash me mera portfolio kaise react karega?",
  "Emergency fund: Liquid Fund vs Bank FD me kya right hai?"
];

export default function HinglishAdvisorChat({ params, fundUniverse, trajectoryData }) {
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

    const portfolioContext = {
      monthly_sip: (params?.monthly_investable_sip !== undefined && params?.monthly_investable_sip !== null && !isNaN(Number(params.monthly_investable_sip))) ? Number(params.monthly_investable_sip) : 25000.0,
      lump_sum: (params?.lump_sum_amount !== undefined && params?.lump_sum_amount !== null && !isNaN(Number(params.lump_sum_amount))) ? Number(params.lump_sum_amount) : 0.0,
      target_amount: (params?.near_target_amount !== undefined && params?.near_target_amount !== null && !isNaN(Number(params.near_target_amount))) ? Number(params.near_target_amount) : 5000000.0,
      target_date: params?.near_target_date || '2031-12-31',
      annual_step_up_pct: (params?.annual_step_up_pct !== undefined && params?.annual_step_up_pct !== null && !isNaN(Number(params.annual_step_up_pct))) ? Number(params.annual_step_up_pct) : 0.10,
      ctc_lpa: (params?.current_ctc_lpa !== undefined && params?.current_ctc_lpa !== null && !isNaN(Number(params.current_ctc_lpa))) ? Number(params.current_ctc_lpa) : 12.0,
      risk_mode: params?.risk_mode || 'global_multi_asset',
      projected_corpus: trajectoryData?.short_term_target?.projected_short_fv || null,
      verdict: trajectoryData?.short_term_target?.verdict || null
    };

    let botReply = '';
    let replySource = 'finbhai_sebi_ria_engine';

    // 1. Direct browser Gemini API call if custom key provided
    if (geminiApiKey) {
      try {
        const prompt = `You are FinBhai, an empathetic, mathematically rigorous SEBI-Registered Investment Advisor (RIA) level Digital Family Office Copilot for InvestPro.
Tone: Energetic, clear, high-conviction Hinglish (Hindi + English) with bold numbers and bullet points.
User Active Portfolio:
- Monthly SIP: ₹${Number(portfolioContext.monthly_sip).toLocaleString('en-IN')}/mo
- Lump Sum: ₹${Number(portfolioContext.lump_sum).toLocaleString('en-IN')}
- Target Amount: ₹${(Number(portfolioContext.target_amount) / 100000).toFixed(2)} Lakhs by ${portfolioContext.target_date}
- Annual SIP Step-Up: ${Math.round(portfolioContext.annual_step_up_pct * 100)}%
- Annual CTC: ₹${portfolioContext.ctc_lpa} LPA
- Barbell Allocation: 25% Tata Small Cap (Agile AUM) + 20% Motilal S&P 500 FoF (US USD Hedge) + 20% UTI Momentum 30 (Factor Alpha) + 20% HDFC Nifty 50 (Core Anchor) + 15% Nippon Silver FoF (Crisis Defense).
User Question: "${query}"
Give practical, fiduciary, and encouraging advice strictly grounded in the user's plan:`;

        const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (gRes.ok) {
          const gData = await gRes.json();
          botReply = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (botReply) replySource = 'gemini_cloud';
        }
      } catch (err) {
        console.warn('Direct Gemini call failed, falling back to DSS:', err);
      }
    }

    // 2. Try Backend Edge Serverless API
    if (!botReply) {
      try {
        const res = await fetch('/api/v1/chat/hinglish-advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            portfolio_context: portfolioContext,
            conversation_history: messages.slice(-6)
          })
        });

        if (res.ok) {
          const data = await res.json();
          botReply = data.reply || data.response || data.message;
          if (data.source) replySource = data.source;
        }
      } catch (err) {
        console.warn('API call error, falling back to local DSS:', err);
      }
    }

    // 3. Guaranteed Deterministic SEBI RIA Local DSS Fallback
    if (!botReply) {
      botReply = generateFinBhaiResponse(query, portfolioContext);
    }

    setMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: botReply || 'Bhai, aapka investment plan active aur track par hai!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: replySource
      }
    ]);
    setLoading(false);
  };

  return (
    <>
      {/* ── Floating Launch Button ── */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="btn-gold flex items-center gap-2.5 px-4 py-3 rounded-full text-xs font-bold shadow-2xl transition-all transform hover:scale-105 border border-[rgba(255,255,255,0.3)] cursor-pointer"
            aria-label="Open AI FinBhai Advisor Chat"
          >
            <div className="w-7 h-7 rounded-full bg-black/30 flex items-center justify-center p-0.5 shadow-inner">
              <img src="/LOGO.png" alt="Bull Logo" className="w-5 h-5 object-contain" />
            </div>
            <span>FinBhai AI Copilot</span>
            <span className="px-1.5 py-0.5 rounded bg-black/20 text-[#1a0609] text-[10px] font-mono font-bold">
              Hinglish
            </span>
          </button>
        )}
      </div>

      {/* ── Sliding Chat Drawer / Modal ── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl bg-[var(--surface)] border border-[var(--accent-border)] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[var(--maroon-dark)] to-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(226,185,111,0.15)] border border-[rgba(226,185,111,0.3)] flex items-center justify-center p-1">
                <img src="/LOGO.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-gold-gradient font-serif">FinBhai AI Advisor</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-[var(--text-3)]">Portfolio-Grounded Hinglish Assistant</p>
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
                  <div dangerouslySetInnerHTML={{ __html: (m.text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
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

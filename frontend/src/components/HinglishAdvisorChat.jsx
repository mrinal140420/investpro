import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Bot, User, Sparkles, X, Key, ShieldCheck, 
  HelpCircle, ChevronUp, ChevronDown, RefreshCw, CheckCircle2, 
  AlertTriangle, TrendingUp, Maximize2, Minimize2 
} from 'lucide-react';
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

/**
 * High-End Eye-Comfort Formatted Message Renderer for FinBhai
 * Eliminates raw markdown '#' hashtags and dense emoji walls.
 * Transforms compounding roadmaps into visual 2x2 stat cards,
 * verdicts into styled alert banners, and rules into clean numbered cards.
 */
function FinBhaiFormattedMessage({ text }) {
  if (!text) return null;

  const rawLines = text.split('\n');
  const elements = [];
  let statBatch = [];

  const flushStatBatch = () => {
    if (statBatch.length > 0) {
      elements.push(
        <div key={`stat-grid-${elements.length}`} className="grid grid-cols-2 gap-2 my-3">
          {statBatch.map((item, sIdx) => (
            <div
              key={sIdx}
              className="p-2.5 rounded-xl bg-[var(--surface-3)]/70 border border-[var(--border)] flex flex-col justify-between shadow-sm"
            >
              <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-3)] font-semibold">
                {item.label}
              </span>
              <span className="text-sm font-bold font-mono text-[var(--gold-light)] mt-1">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      );
      statBatch = [];
    }
  };

  let i = 0;
  while (i < rawLines.length) {
    const line = rawLines[i].trim();

    if (!line) {
      flushStatBatch();
      i++;
      continue;
    }

    // 1. Compounding Milestone Stat pattern (e.g. • 10 Saal: ~₹1.34 Lakhs or • 10 Saal me: ~₹1.34 Lakhs)
    const statMatch = line.match(/^[•\-]\s*\**([0-9]+\s*(?:Saal|Years|Yrs)[^:]*):\**\s*(.*)$/i);
    if (statMatch) {
      const label = statMatch[1].replace(/\*\*/g, '').trim();
      const value = statMatch[2].replace(/\*\*/g, '').replace(/!/g, '').trim();
      statBatch.push({ label, value });
      i++;
      continue;
    }

    // Flush any pending stat batch
    flushStatBatch();

    // 2. Verdict / Reality Check Alert Box
    if (
      line.includes('VERDICT: ON TRACK') ||
      line.includes('100% SAMBHAV HAI') ||
      line.includes('VERDICT: TIMELINE REALITY CHECK') ||
      line.includes('DEADLINE TAK POORA SAMBHAV NAHI HAI') ||
      line.includes('REALITY CHECK ALERT')
    ) {
      const isSuccess = line.includes('ON TRACK') || line.includes('100% SAMBHAV HAI');
      const cleanAlertText = line.replace(/^[#•\s*⚠️✅🎉🚀]+/, '').replace(/\*\*/g, '');
      elements.push(
        <div
          key={`alert-${elements.length}`}
          className={`p-3 rounded-xl my-2.5 border flex items-start gap-2.5 ${
            isSuccess
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-sm'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-sm'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-[12px] font-semibold leading-relaxed">
            {cleanAlertText}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 3. Section Heading (starts with ## or ###) -> Strip # and style cleanly
    if (line.startsWith('##') || line.startsWith('###')) {
      const cleanTitle = line
        .replace(/^[#\s]+/, '')
        .replace(/^[\uD800-\uDBFF\uDC00-\uDFFF\u2600-\u27BF\s]+/, '')
        .trim();
      elements.push(
        <div
          key={`heading-${elements.length}`}
          className="flex items-center gap-2 mt-4 mb-2 pt-2.5 border-t border-[var(--border-subtle)]"
        >
          <div className="w-1.5 h-3.5 rounded-full bg-[var(--gold)] shrink-0" />
          <h4 className="text-[12px] font-bold text-[var(--gold-light)] font-sans tracking-wide">
            {cleanTitle}
          </h4>
        </div>
      );
      i++;
      continue;
    }

    // 4. Portfolio Breakdown Key-Value Row (• Label: Value)
    const kvMatch = line.match(/^[•\-]\s*\**([^*:]+)\**:\s*(.*)$/);
    if (kvMatch && !kvMatch[1].toLowerCase().includes('option')) {
      const label = kvMatch[1].replace(/\*\*/g, '').trim();
      const value = kvMatch[2].replace(/\*\*/g, '').trim();
      elements.push(
        <div
          key={`kv-${elements.length}`}
          className="flex items-baseline justify-between py-1.5 px-2.5 my-1 rounded-lg bg-[var(--surface-3)]/40 text-[11.5px] border border-[var(--border-subtle)]/60"
        >
          <span className="text-[var(--text-3)] font-medium">{label}</span>
          <span className="font-mono font-semibold text-[var(--text-1)]">{value}</span>
        </div>
      );
      i++;
      continue;
    }

    // 5. Numbered List items (e.g. 1. **Title:** description)
    const numMatch = line.match(/^([0-9]+)\.\s*(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const body = numMatch[2];
      elements.push(
        <div
          key={`num-${elements.length}`}
          className="flex items-start gap-2.5 my-2 p-2.5 rounded-xl bg-[var(--surface-3)]/40 border border-[var(--border-subtle)]"
        >
          <span className="w-5 h-5 rounded-md bg-[var(--accent-glow)] border border-[var(--accent-border)] text-[var(--accent-bright)] text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
            0{num}
          </span>
          <div
            className="text-[11.5px] text-[var(--text-2)] leading-relaxed flex-1"
            dangerouslySetInnerHTML={{
              __html: body.replace(
                /\*\*(.*?)\*\*/g,
                '<strong class="text-[var(--text-1)] font-semibold">$1</strong>'
              )
            }}
          />
        </div>
      );
      i++;
      continue;
    }

    // 6. Regular bullet points (• or -)
    if (line.startsWith('•') || line.startsWith('-')) {
      const bulletBody = line.replace(/^[•\-]\s*/, '');
      elements.push(
        <div key={`bullet-${elements.length}`} className="flex items-start gap-2 my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-1.5 opacity-70" />
          <div
            className="text-[11.5px] text-[var(--text-2)] leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: bulletBody.replace(
                /\*\*(.*?)\*\*/g,
                '<strong class="text-[var(--text-1)] font-semibold">$1</strong>'
              )
            }}
          />
        </div>
      );
      i++;
      continue;
    }

    // 7. General text paragraph
    elements.push(
      <p
        key={`p-${elements.length}`}
        className="my-1.5 text-[11.5px] text-[var(--text-2)] leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: line.replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="text-[var(--text-1)] font-semibold">$1</strong>'
          )
        }}
      />
    );
    i++;
  }

  flushStatBatch();

  return <div className="space-y-1">{elements}</div>;
}

export default function HinglishAdvisorChat({ params, fundUniverse, trajectoryData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Namaste! Main aapka **FinBhai AI Copilot** hoon 🤖.\n\nAapke active portfolio, Annual Step-Up SIP, S&P 500 FoF, aur Section 112A tax savings ke regarding jo bhi doubts hain, bina jhijhak poochiye!",
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
  }, [messages, isOpen, isExpanded]);

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

    // 1. Direct browser Gemini API call if custom key provided
    if (geminiApiKey) {
      try {
        const prompt = `You are FinBhai, an empathetic, mathematically rigorous SEBI-Registered Investment Advisor (RIA) level Digital Family Office Copilot for InvestPro.
Tone: Energetic, clear, high-conviction Hinglish (Hindi + English) with bold numbers and clean headings without hashtag symbols.
User Active Portfolio:
- Monthly SIP: ₹${Number(portfolioContext.monthly_sip).toLocaleString('en-IN')}/mo
- Lump Sum: ₹${Number(portfolioContext.lump_sum).toLocaleString('en-IN')}
- Target Amount: ₹${Number(portfolioContext.target_amount).toLocaleString('en-IN')} by ${portfolioContext.target_date}
- Annual SIP Step-Up: ${Math.round(portfolioContext.annual_step_up_pct * 100)}%
- Annual CTC: ₹${Number(portfolioContext.ctc_lpa).toFixed(1)} LPA
- Active Multi-Asset Factor Allocation: Tata Small Cap (25%) + Motilal S&P 500 (20%) + UTI Momentum 30 (20%) + HDFC Nifty 50 (20%) + Nippon Silver FoF (15%).

User Question: "${query}"

Guidelines:
1. Speak in warm, empathetic, high-energy Hinglish as a fiduciary brother/mentor.
2. Ground every answer in their active portfolio numbers.
3. Keep layout clean, using ## for section titles without hash symbols in text, and avoid excessive emoji spam.
4. If target is mathematically unfeasible within timeframe, be honest and give 3 actionable ways to fix it.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to serverless advisor:', err);
      }
    }

    // 2. Serverless API Endpoint with instant local fallback
    if (!botReply) {
      try {
        const res = await fetch('/api/v1/chat/hinglish-advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            portfolio_context: portfolioContext
          })
        });

        if (res.ok) {
          const data = await res.json();
          botReply = data.reply || data.response || '';
        }
      } catch (apiErr) {
        console.warn('Network call failed, running local FinBhai SEBI-RIA DSS calculation:', apiErr);
      }
    }

    // 3. Ultra-fast Deterministic Local Fallback
    if (!botReply) {
      botReply = generateFinBhaiResponse(query, portfolioContext);
    }

    const botMsg = {
      sender: 'bot',
      text: botReply || "Namaste! Main aapke portfolio ke numbers check kar raha hoon. Aap mujhse kisi bhi fund ya target ke baare me pooch sakte hain!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full btn-gold shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Open FinBhai AI Advisor"
          >
            <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center p-0.5">
              <img src="/LOGO.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-xs tracking-wide">FinBhai AI Copilot</span>
            <span className="px-1.5 py-0.5 rounded bg-black/20 text-[#1a0609] text-[10px] font-mono font-bold">
              Hinglish
            </span>
          </button>
        )}
      </div>

      {/* ── Sliding Chat Drawer / Modal ── */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-50 w-[95vw] ${
            isExpanded ? 'sm:w-[620px]' : 'sm:w-[490px]'
          } h-[640px] max-h-[88vh] rounded-2xl bg-[var(--surface)] border border-[var(--accent-border)] shadow-2xl flex flex-col overflow-hidden transition-all duration-200`}
        >
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
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse View" : "Expand for Comfortable Reading"}
                className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
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
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 text-[10px] mt-0.5">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[92%] p-3.5 rounded-2xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-br-none shadow-md text-xs'
                      : 'bg-[var(--surface-2)] text-[var(--text-1)] border border-[var(--border)] rounded-bl-none shadow-md'
                  }`}
                >
                  {m.sender === 'user' ? (
                    <div>{m.text}</div>
                  ) : (
                    <FinBhaiFormattedMessage text={m.text} />
                  )}
                  <span className={`text-[9px] block mt-1.5 text-right font-mono ${m.sender === 'user' ? 'text-white/70' : 'text-[var(--text-3)]'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-[var(--text-3)] font-mono p-2 rounded-lg bg-[var(--surface-2)] w-fit border border-[var(--border)]">
                <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>FinBhai mathematically audit kar raha hai...</span>
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

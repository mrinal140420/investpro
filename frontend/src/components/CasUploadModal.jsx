import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  PieChart,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function CasUploadModal({ isOpen, onClose, onIngestionComplete }) {
  const [file, setFile] = useState(null);
  const [panPassword, setPanPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [parseResult, setParseResult] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMsg(null);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (panPassword) {
      formData.append('password', panPassword);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/ingestion/cas-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to parse CAS statement');
      }

      const data = await response.json();
      setParseResult(data);
      if (onIngestionComplete) {
        onIngestionComplete(data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error uploading statement');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDemoParse = async () => {
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/ingestion/cas-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text:
            "Folio No: 1204859/91\n" +
            "Tata Small Cap Fund - Direct Plan - Growth ISIN: INF277K01423\n" +
            "15-Jan-2024 SIP Purchase 5000.00 45.123 110.8080 45.123\n" +
            "15-Feb-2024 Systematic Investment 5000.00 44.500 112.3595 89.623\n" +
            "10-Mar-2024 Purchase 10000.00 88.000 113.6363 177.623\n\n" +
            "Folio No: 8847291/02\n" +
            "Motilal Oswal S&P 500 Index Fund - Direct Plan - Growth ISIN: INF247L01AU4\n" +
            "20-Jan-2024 Purchase 15000.00 750.000 20.0000 750.000\n\n" +
            "Folio No: 3349102/55\n" +
            "Nippon India Silver ETF FoF - Regular Plan - Growth ISIN: INF204K01844\n" +
            "05-Feb-2024 Purchase 5000.00 350.000 14.2857 350.000\n",
          password: 'DEMOPAN123',
        }),
      });

      const data = await response.json();
      setParseResult(data);
      if (onIngestionComplete) {
        onIngestionComplete(data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Demo parse failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="ip-card accent-stripe w-full max-w-2xl shadow-2xl rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto border border-[var(--accent-border)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-[var(--border)]">
          <div className="w-12 h-12 rounded-xl bg-[rgba(226,185,111,0.12)] text-[var(--accent-bright)] border border-[rgba(226,185,111,0.3)] flex items-center justify-center shadow-md">
            <UploadCloud className="w-6 h-6 text-[var(--gold)]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-1)] tracking-tight">Import Consolidated Account Statement (CAS)</h3>
            <p className="text-xs text-[var(--text-2)]">
              Zero paid APIs. 100% private, bootstrapped CAMS/KFintech encrypted PDF parsing.
            </p>
          </div>
        </div>

        {!parseResult ? (
          <div className="mt-6 space-y-5">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[var(--accent-border)] hover:border-[var(--gold)] rounded-xl p-8 text-center transition-all bg-[var(--surface-2)] cursor-pointer hover:bg-[var(--surface-3)]"
            >
              <input
                type="file"
                id="cas-file-input"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="cas-file-input" className="cursor-pointer flex flex-col items-center">
                <FileText className="w-12 h-12 text-[var(--gold)] mb-3 animate-pulse-subtle" />
                <span className="text-sm font-semibold text-[var(--text-1)]">
                  {file ? file.name : 'Drag & drop your CAS PDF statement here'}
                </span>
                <span className="text-xs text-[var(--text-3)] mt-1">
                  Supports password-protected CAMS & KFintech statements (.pdf)
                </span>
                <span className="mt-3 px-3.5 py-1 text-xs font-bold rounded-lg btn-gold shadow-sm">
                  Browse Files
                </span>
              </label>
            </div>

            {/* Password Input (PAN) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-1)] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[var(--gold)]" /> CAS PDF Password (Usually your PAN in UPPERCASE):
              </label>
              <input
                type="password"
                placeholder="e.g. ABCDE1234F"
                value={panPassword}
                onChange={(e) => setPanPassword(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[var(--surface-2)] border border-[var(--border)] focus:border-[var(--gold)] outline-none text-[var(--text-1)] font-mono"
              />
              <span className="text-[11px] text-[var(--text-3)] block">
                Decryption occurs entirely in memory. Your PAN and credentials are never stored.
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={handleDemoParse}
                disabled={isUploading}
                className="text-xs text-[var(--accent-bright)] hover:underline font-semibold cursor-pointer"
              >
                Or Load Demo CAS Payload (1-Click)
              </button>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-2)] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading || (!file && !panPassword)}
                  className="btn-gold px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 spin-slow" /> Decrypting & Parsing...
                    </>
                  ) : (
                    'Process Statement'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Parsed Summary View */
          <div className="mt-6 space-y-5 animate-in fade-in">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-foreground">CAS Ingestion Successful!</h4>
                <p className="text-xs text-muted-foreground">
                  Parsed {parseResult.metadata.total_records_parsed} transaction records across folios.
                </p>
              </div>
            </div>

            {/* Regular Plan Leakage Warning Alert */}
            {parseResult.metadata.regular_plans_flagged_count > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Mandatory Exclusion: {parseResult.metadata.regular_plans_flagged_count} Regular (Commission-Loaded) Plan(s) Detected
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  As per InvestPro fiduciary rules, Regular mutual funds are flagged for mandatory exclusion from your core 50/20/20/10 portfolio. Zero commission leakage is permitted.
                </p>
              </div>
            )}

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-secondary/40 border border-border">
                <span className="text-[11px] text-muted-foreground block">Clean Direct Lots:</span>
                <span className="text-base font-extrabold text-foreground">
                  {parseResult.metadata.clean_direct_records_count}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-secondary/40 border border-border">
                <span className="text-[11px] text-muted-foreground block">Net Inflow (INR):</span>
                <span className="text-base font-extrabold text-emerald-400">
                  ₹{parseResult.metadata.total_net_inflow_inr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-secondary/40 border border-border">
                <span className="text-[11px] text-muted-foreground block">Flagged Regular:</span>
                <span className="text-base font-extrabold text-amber-400">
                  {parseResult.metadata.regular_plans_flagged_count}
                </span>
              </div>
            </div>

            {/* Asset Class Distribution */}
            <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Normalized Asset Class Taxonomy
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(parseResult.metadata.asset_class_distribution || {}).map(([ac, count]) => (
                  <div key={ac} className="p-2 rounded bg-background/60 border border-border flex justify-between">
                    <span className="text-muted-foreground">{ac}:</span>
                    <span className="font-bold text-foreground">{count} lot(s)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setParseResult(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-secondary hover:bg-secondary/80 text-foreground"
              >
                Upload Another
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-accent hover:bg-accent/90 text-white"
              >
                Done & View Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

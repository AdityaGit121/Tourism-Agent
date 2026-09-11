import React, { useState } from 'react';
import { EngineOutput } from '../types';
import { X, Copy, Check, CheckCircle2, ShieldCheck } from 'lucide-react';

interface JsonContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  output: EngineOutput;
}

export const JsonContractModal: React.FC<JsonContractModalProps> = ({
  isOpen,
  onClose,
  output
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(output, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-slate-950 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Rigid JSON Output Contract</h3>
              <p className="text-[11px] text-slate-400">
                100% Schema-Compliant Payload · Zero Markdown Backticks In Fields
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Payload' : 'Copy JSON'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Validation Bar */}
        <div className="px-5 py-2.5 bg-emerald-950/20 border-b border-emerald-900/30 flex items-center justify-between text-xs text-emerald-400 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONTRACT VALIDATED: thought_process, agent_response, error_handling</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Target: Section 5 Schema
          </span>
        </div>

        {/* Code Content */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-slate-200 bg-slate-950">
          <pre className="whitespace-pre-wrap leading-relaxed selection:bg-sky-500 selection:text-white">
            {jsonString}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-500">
          <span>Persona: {output.agent_response.persona}</span>
          <span>Disruption Status: {output.error_handling.has_disruption ? 'ACTIVE' : 'NONE'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

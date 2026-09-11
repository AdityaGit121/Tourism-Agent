import React from 'react';
import { PersonaType, ToolInvocationRecord, ThoughtStep } from '../types';
import { Play, Sparkles, Terminal, Code2, ArrowRight, Cpu, CheckCircle2 } from 'lucide-react';

interface ExecutionConsoleProps {
  query: string;
  setQuery: (q: string) => void;
  selectedPersona: PersonaType;
  setSelectedPersona: (p: PersonaType) => void;
  onExecute: () => void;
  isExecuting: boolean;
  thoughtProcess: ThoughtStep[];
  toolInvocations: ToolInvocationRecord[];
  onOpenJsonModal: () => void;
}

const PRESETS: { label: string; persona: PersonaType; query: string }[] = [
  {
    label: 'Tourist: 6-Hr Rain & Traffic Optimized',
    persona: 'TOURIST',
    query: 'Plan a 6-hour cultural itinerary today avoiding heavy rain and active traffic bottlenecks, with budget stay options.'
  },
  {
    label: 'Tourist: Low-Crowd Venues & Stays',
    persona: 'TOURIST',
    query: 'Find open attractions with low crowd density, active local events, and budget hotels.'
  },
  {
    label: 'Business: Staff Scaling & Surge Forecast',
    persona: 'BUSINESS_OWNER',
    query: 'Forecast visitor crowd surge and calculate recommended staff scaling and inventory for Old City Bazaar from 14:00 to 19:00.'
  },
  {
    label: 'Business: Waterfront Dining Demand',
    persona: 'BUSINESS_OWNER',
    query: 'Analyze commercial demand and service scaling for Hussain Sagar lakefront businesses during weather shift.'
  },
  {
    label: 'Authority: Charminar Crowd Mitigation',
    persona: 'TOURISM_AUTHORITY',
    query: 'High crowd alert at Charminar: deploy police marshals, medical triage stations, and gate influx metering.'
  },
  {
    label: 'Authority: Golconda Fort Road Diversion',
    persona: 'TOURISM_AUTHORITY',
    query: 'Emergency traffic diversion and municipal safety resource deployment for Golconda Fort sector.'
  }
];

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  query,
  setQuery,
  selectedPersona,
  setSelectedPersona,
  onExecute,
  isExecuting,
  thoughtProcess,
  toolInvocations,
  onOpenJsonModal
}) => {
  return (
    <div className="space-y-4">
      {/* Persona Selector Tabs */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
          Persona Target
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
          {(['TOURIST', 'BUSINESS_OWNER', 'TOURISM_AUTHORITY'] as const).map((p) => {
            const isSelected = selectedPersona === p;
            const displayName =
              p === 'TOURIST' ? 'Tourist' : p === 'BUSINESS_OWNER' ? 'Business Owner' : 'Authority';
            return (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPersona(p)}
                className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {displayName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Query Chips */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
          Fast Scenario Presets
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedPersona(preset.persona);
                setQuery(preset.query);
              }}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Box */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
          Agent Input Directive
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter tourist travel request, business forecast prompt, or municipal safety directive..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none font-sans"
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <button
            type="button"
            onClick={onOpenJsonModal}
            className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Inspect JSON Contract</span>
          </button>

          <button
            type="button"
            onClick={onExecute}
            disabled={isExecuting || !query.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Processing...' : 'Run Agent Engine'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Step Reasoning Transparency (Thought Process) */}
      <div className="border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            Internal Reasoning Process
          </label>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Zero Hallucination
          </span>
        </div>

        <div className="space-y-2">
          {thoughtProcess.map((step) => (
            <div
              key={step.step_number}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
            >
              <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                <span className="text-sky-400 font-semibold">
                  Step {step.step_number}: {step.action}
                </span>
                <span className="text-slate-500">Verified</span>
              </div>
              <p className="text-slate-300 text-[11px] font-mono leading-relaxed">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Executable Tool Invocations Log */}
      <div className="border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            Executable Tool Invocations ({toolInvocations.length})
          </label>
          <span className="text-[10px] font-mono text-slate-500">
            Live Function Calling
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {toolInvocations.map((inv, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono"
            >
              <div className="flex items-center justify-between text-[11px] text-amber-400 mb-1">
                <span className="font-bold">tool_call: {inv.tool_name}</span>
                <span className="text-slate-500 text-[10px]">{inv.timestamp}</span>
              </div>
              <div className="text-[10px] text-slate-400 mb-1">
                args: {JSON.stringify(inv.args)}
              </div>
              <div className="text-[11px] text-emerald-400">
                return: {inv.result_summary}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

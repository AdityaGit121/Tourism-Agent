import React from 'react';
import { RotateCcw, AlertTriangle, Play, Sparkles } from 'lucide-react';
import { PersonaType } from '../types';

interface HeaderProps {
  activeView: 'chat' | 'dashboard' | 'tools' | 'capabilities';
  setActiveView: (view: 'chat' | 'dashboard' | 'tools' | 'capabilities') => void;
  onResetState: () => void;
  onTriggerDisruption: () => void;
  hasDisruptionsActive: boolean;
  selectedPersona: PersonaType;
  onPersonaSelect: (p: PersonaType) => void;
  onRunEngine: () => void;
  isExecuting: boolean;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenJsonModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onResetState,
  onTriggerDisruption,
  hasDisruptionsActive,
  selectedPersona,
  onPersonaSelect,
  onRunEngine,
  isExecuting,
  onToggleSidebar,
  isSidebarOpen,
  onOpenJsonModal
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('chat');
            }}
            className="text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90 flex items-center gap-2.5"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block shadow-sm shadow-sky-500/50"></span>
            Tourism Agent Engine
          </a>
          <span className="hidden lg:inline text-xs font-mono text-slate-500 border-l border-slate-800 pl-3">
            v1.0.0 Sprint Edition
          </span>
        </div>

        {/* Zone 2: Navigation Links with Conversational AI Agent First */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-400">
          <button
            type="button"
            onClick={() => setActiveView('chat')}
            className={`transition-colors hover:text-white px-2.5 py-1 rounded-md ${
              activeView === 'chat' ? 'text-white bg-slate-800 font-semibold' : ''
            }`}
          >
            💬 Chatbot Agent
          </button>
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className={`transition-colors hover:text-white px-2.5 py-1 rounded-md ${
              activeView === 'dashboard' ? 'text-white bg-slate-800 font-semibold' : ''
            }`}
          >
            📊 Operations Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveView('tools')}
            className={`transition-colors hover:text-white px-2.5 py-1 rounded-md ${
              activeView === 'tools' ? 'text-white bg-slate-800 font-semibold' : ''
            }`}
          >
            🛠️ Tool Specs
          </button>
          <button
            type="button"
            onClick={() => setActiveView('capabilities')}
            className={`transition-colors hover:text-white px-2.5 py-1 rounded-md ${
              activeView === 'capabilities' ? 'text-white bg-slate-800 font-semibold' : ''
            }`}
          >
            📋 10 Capabilities
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              title="Toggle Live City Sensors & Map drawer"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors border ${
                isSidebarOpen
                  ? 'bg-sky-950 text-sky-300 border-sky-600'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${hasDisruptionsActive ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
              <span className="hidden sm:inline">Sensors & Map</span>
            </button>
          )}

          <button
            type="button"
            onClick={onTriggerDisruption}
            title="Toggle severe rain and roadway bottleneck to test disruption handling"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors border ${
              hasDisruptionsActive
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {hasDisruptionsActive ? 'Disruptions Active' : 'Simulate Disruption'}
            </span>
          </button>

          <button
            type="button"
            onClick={onResetState}
            title="Reset urban state to baseline sunny conditions"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};

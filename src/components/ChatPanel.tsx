import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Sparkles,
  ChevronDown,
  ChevronRight,
  User,
  Bot,
  Copy,
  Check,
  Code,
  Compass,
  Briefcase,
  ShieldAlert,
  Edit3,
  AlertTriangle,
  RotateCcw,
  Layers,
  MapPin,
  Clock,
  Building2,
  Navigation
} from 'lucide-react';
import {
  ChatMessage,
  PersonaType,
  CityLiveState,
  EngineOutput
} from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (query: string, personaHint?: PersonaType) => void;
  isGenerating: boolean;
  liveState: CityLiveState;
  onOpenSidebar: () => void;
  onOpenJsonModal: (output?: EngineOutput) => void;
  selectedPersona: PersonaType;
  setSelectedPersona: (p: PersonaType) => void;
  onResetChat: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  liveState,
  onOpenSidebar,
  onOpenJsonModal,
  selectedPersona,
  setSelectedPersona,
  onResetChat
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const toggleThought = (id: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    const query = inputText.trim();
    setInputText('');
    onSendMessage(query, selectedPersona);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    {
      label: '🏖️ 2-Day Pondicherry (Budget ₹3k & Local Bus)',
      query: 'plan a 2 trip to explore pondicherry , by covering most popular placed under budject 3k , using public local transport ,with best food recomendations . avoid traffic , rain',
      persona: 'TOURIST' as PersonaType
    },
    {
      label: '🌧️ 2 Days in Bengaluru (Rain-Safe Metro)',
      query: 'Plan 2 days in Bengaluru avoiding rain using public transport',
      persona: 'TOURIST' as PersonaType
    },
    {
      label: '💼 3-Hour Business Trip Route',
      query: 'I have 3 hours, I am a businessman, I have a meeting at a hotel, find me the shortest route and nearby famous places',
      persona: 'TOURIST' as PersonaType
    },
    {
      label: '🏛️ 1 Day in Paris (Rain-Shielded)',
      query: '1 day in Paris for an art lover avoiding rain using public transport',
      persona: 'TOURIST' as PersonaType
    },
    {
      label: '📈 Footfall & Staff Scaling',
      query: 'Forecast visitor crowd surge and calculate recommended staff scaling and inventory for local shops',
      persona: 'BUSINESS_OWNER' as PersonaType
    },
    {
      label: '🚓 Emergency Crowd Mitigation',
      query: 'Deploy security, crowd control barriers, and medical triage for high density areas',
      persona: 'TOURISM_AUTHORITY' as PersonaType
    }
  ];

  const handleSelectPersonaChip = (p: PersonaType) => {
    setSelectedPersona(p);
    if (p === 'TOURIST') {
      setInputText('Plan a 1-day itinerary avoiding rain and traffic');
    } else if (p === 'BUSINESS_OWNER') {
      setInputText('Analyze footfall demand and calculate staff scaling for local shops');
    } else if (p === 'TOURISM_AUTHORITY') {
      setInputText('Assess crowd safety and deploy tactical police and medical units');
    }
    textareaRef.current?.focus();
  };

  const handleFocusCustomInput = () => {
    setInputText('');
    textareaRef.current?.focus();
  };

  // Check live alerts
  const hasRain = ['Rain', 'Heavy Rain', 'Thunderstorm'].includes(liveState.weather.condition);
  const activeBottlenecks = liveState.disruptions.filter((d) => d.status === 'BOTTLENECK' || d.delay_minutes >= 15);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Top Telemetry Ticker (Conversational Context) */}
      <div className="flex-none px-4 py-2 border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Sensors Connected
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            Weather: <strong className="text-amber-400 font-semibold">{liveState.weather.condition} ({liveState.weather.temperature_c}°C)</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1">
            Traffic: {activeBottlenecks.length > 0 ? (
              <span className="text-rose-400 font-medium">{activeBottlenecks[0].corridor_name} (+{activeBottlenecks[0].delay_minutes}m)</span>
            ) : (
              <span className="text-emerald-400">Corridors Clear</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors font-medium px-2 py-0.5 rounded bg-sky-950/40 border border-sky-800/40"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sensors & Map</span>
          </button>
          <button
            type="button"
            onClick={onResetChat}
            title="Reset conversation"
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          const isThoughtExpanded = expandedThoughts[msg.id] ?? false;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl mx-auto ${
                isAgent ? 'items-start' : 'items-start flex-row-reverse'
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-none w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shadow-sm ${
                  isAgent
                    ? 'bg-sky-600 border-sky-400 text-white shadow-sky-900/40'
                    : 'bg-indigo-700 border-indigo-500 text-white'
                }`}
              >
                {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div className="flex-1 min-w-0 space-y-2">
                <div
                  className={`rounded-2xl px-5 py-4 border shadow-sm ${
                    isAgent
                      ? 'bg-slate-900/90 border-slate-800 text-slate-100 rounded-tl-sm'
                      : 'bg-indigo-950/50 border-indigo-800/60 text-slate-100 rounded-tr-sm ml-auto max-w-2xl'
                  }`}
                >
                  {/* If Onboarding Greeting with Persona Quick Select Buttons */}
                  {msg.id === 'msg-initial' && (
                    <div className="space-y-4">
                      <p className="text-base text-slate-200 leading-relaxed font-normal">
                        {msg.content}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                          Select Persona or Intent:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectPersonaChip('TOURIST')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all shadow-sm"
                          >
                            <Compass className="w-3.5 h-3.5 text-sky-400" />
                            <span>🧳 Tourist</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectPersonaChip('BUSINESS_OWNER')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all shadow-sm"
                          >
                            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                            <span>📈 Business Owner</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectPersonaChip('TOURISM_AUTHORITY')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all shadow-sm"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            <span>🚓 Authority</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleFocusCustomInput}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-sky-900/40 hover:bg-sky-900/60 border border-sky-700/50 text-sky-300 hover:text-white transition-all shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                            <span>✏️ Custom Input</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Standard Agent Message with Thought Stream + Markdown */}
                  {msg.id !== 'msg-initial' && isAgent && (
                    <div className="space-y-4">
                      {/* Interactive Collapsible Agent Thought Stream */}
                      {msg.thoughtStream && (
                        <div className="rounded-xl bg-slate-950/70 border border-slate-800 overflow-hidden text-xs">
                          <button
                            type="button"
                            onClick={() => toggleThought(msg.id)}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900/70 hover:bg-slate-900 transition-colors text-slate-300 font-medium select-none"
                          >
                            <span className="flex items-center gap-2">
                              <span>🧠</span>
                              <span className="font-semibold text-slate-200">Agent Thought Stream</span>
                              <span className="text-[11px] text-slate-400 font-normal">
                                (Click to {isThoughtExpanded ? 'collapse' : 'expand'} step-by-step reasoning)
                              </span>
                            </span>
                            {isThoughtExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          {isThoughtExpanded && (
                            <div className="p-3.5 space-y-2.5 border-t border-slate-800/80 bg-slate-950/40 text-slate-300">
                              <div>
                                <strong className="text-sky-400 block mb-0.5">• Intent Analysis:</strong>
                                <p className="text-slate-300 leading-relaxed">{msg.thoughtStream.intentAnalysis}</p>
                              </div>
                              <div>
                                <strong className="text-amber-400 block mb-0.5">• Live Telemetry Check:</strong>
                                <p className="text-slate-300 leading-relaxed">{msg.thoughtStream.liveTelemetryCheck}</p>
                              </div>
                              <div>
                                <strong className="text-emerald-400 block mb-0.5">• Tool Execution:</strong>
                                <p className="text-slate-300 font-mono text-[11px] leading-relaxed bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                                  {msg.thoughtStream.toolExecution}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main Markdown Content Rendering */}
                      <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed">
                        <ReactMarkdown
                          components={{
                            h2: ({ node, ...props }) => (
                              <h2 className="text-lg font-bold text-white mt-4 mb-2" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="text-base font-bold text-white mt-3 mb-1.5" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="my-2 leading-relaxed text-slate-300" {...props} />
                            ),
                            hr: () => (
                              <hr className="my-3 border-slate-800" />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="my-2 space-y-1 pl-5 list-disc" {...props} />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="text-slate-300 text-sm leading-relaxed pl-1" {...props} />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong className="font-semibold text-sky-300" {...props} />
                            )
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* Message Actions Bar */}
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {msg.engineOutput && (
                            <button
                              type="button"
                              onClick={() => onOpenJsonModal(msg.engineOutput)}
                              className="flex items-center gap-1 hover:text-sky-300 transition-colors"
                            >
                              <Code className="w-3.5 h-3.5" />
                              <span>View JSON Schema</span>
                            </button>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-500 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Standard User Message */}
                  {!isAgent && (
                    <p className="text-sm sm:text-base leading-relaxed text-slate-100 whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading / Generating State */}
        {isGenerating && (
          <div className="flex gap-3 max-w-4xl mx-auto items-start animate-fade-in">
            <div className="flex-none w-8 h-8 rounded-full bg-sky-600 border border-sky-400 text-white flex items-center justify-center text-xs shadow-sm">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex-1 rounded-2xl rounded-tl-sm px-5 py-4 bg-slate-900/90 border border-slate-800 text-slate-300">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Synthesizing telemetry & executing tools...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Floating Prompt Suggestions */}
      <div className="flex-none px-4 sm:px-6 pt-2 pb-1 border-t border-slate-900 bg-slate-950/90">
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Try query:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(p.query);
                setSelectedPersona(p.persona);
                textareaRef.current?.focus();
              }}
              className="flex-none px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors text-xs whitespace-nowrap"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Input Field (Prominent ChatGPT / Claude Style) */}
      <div className="flex-none px-4 sm:px-6 pb-4 pt-1 bg-slate-950">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <div className="relative flex items-end rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-sky-500/80 focus-within:ring-1 focus-within:ring-sky-500/50 shadow-lg transition-all">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask anything (e.g. I have 3 hours, I am a businessman, I have a meeting at a hotel, find shortest route & sights)..."
              disabled={isGenerating}
              className="w-full resize-none bg-transparent px-4 py-3.5 text-sm sm:text-base text-slate-100 placeholder:text-slate-400 focus:outline-none max-h-40 leading-relaxed"
            />

            <div className="p-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={!inputText.trim() || isGenerating}
                className="flex-none w-9 h-9 rounded-xl flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white disabled:bg-slate-800 disabled:text-slate-600 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-3 pt-1.5">
            <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for new line</span>
            <span>Real-time zero-hallucination agent engine</span>
          </div>
        </form>
      </div>
    </div>
  );
};

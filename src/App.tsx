import React, { useState } from 'react';
import { initialCityState } from './data/mockCityData';
import { CityLiveState, PersonaType, EngineOutput, ChatMessage } from './types';
import { runAgentEngine, ExecutionResult } from './agent/agentEngine';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { RightUtilitySidebar } from './components/RightUtilitySidebar';
import { DecisionDashboard } from './components/DecisionDashboard';
import { JsonContractModal } from './components/JsonContractModal';
import { CapabilitiesMatrix } from './components/CapabilitiesMatrix';
import { ToolSpecsView } from './components/ToolSpecsView';
import { ExecutionConsole } from './components/ExecutionConsole';
import { CityStateController } from './components/CityStateController';
import { Sliders, Terminal } from 'lucide-react';

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-initial',
  sender: 'agent',
  timestamp: 'Just now',
  content:
    'Hello! I am your Real-Time Tourism Management Assistant. To help you best, please select your persona or tell me how I can assist you today:'
};

export default function App() {
  const [cityState, setCityState] = useState<CityLiveState>(initialCityState);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('TOURIST');
  const [activePersonaTab, setActivePersonaTab] = useState<PersonaType>('TOURIST');
  const [activeView, setActiveView] = useState<'chat' | 'dashboard' | 'tools' | 'capabilities'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [jsonModalPayload, setJsonModalPayload] = useState<EngineOutput | undefined>(undefined);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Dashboard-specific sub-tabs
  const [leftTab, setLeftTab] = useState<'console' | 'state_controller'>('console');
  const [dashboardQuery, setDashboardQuery] = useState<string>(
    'I have 3 hours, I am a businessman, I have a meeting at a hotel, find me the shortest route and nearby famous places'
  );

  // Chat message history
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);

  // Master Engine result (synced across Chat, Dashboard, Map, and JSON view)
  const [engineResult, setEngineResult] = useState<ExecutionResult>(() => {
    return runAgentEngine(
      'I have 3 hours, I am a businessman, I have a meeting at a hotel, find me the shortest route and nearby famous places',
      initialCityState,
      'TOURIST'
    );
  });

  const handleSendMessage = async (userQuery: string, personaHint?: PersonaType) => {
    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: userQuery
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsExecuting(true);

    const targetPersona = personaHint || selectedPersona;
    const deterministicRes = runAgentEngine(userQuery, cityState, targetPersona);

    let effectiveOutput = deterministicRes.output;
    let effectiveResult = deterministicRes;

    try {
      const res = await fetch('/api/run-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          liveState: cityState,
          requestedPersona: targetPersona
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.output && data.output.agent_response) {
          effectiveOutput = data.output;
          effectiveResult = {
            output: data.output,
            matchedPersona: (data.output.agent_response?.persona as PersonaType) || deterministicRes.matchedPersona,
            toolInvocations: deterministicRes.toolInvocations,
            extraContext: deterministicRes.extraContext,
            capabilitiesCovered: deterministicRes.capabilitiesCovered
          };
        }
      }
    } catch (err) {
      console.warn('API error, using robust deterministic fallback:', err);
    }

    setEngineResult(effectiveResult);
    setSelectedPersona(effectiveResult.matchedPersona);
    setActivePersonaTab(effectiveResult.matchedPersona);

    // Build Thought Stream details for the message
    const steps = effectiveOutput.thought_process || [];
    const step1 = steps.find((s) => s.step_number === 1)?.detail || 'Extracted user constraints and target intent.';
    const step2 = steps.find((s) => s.step_number === 2)?.detail || `Checked live weather (${cityState.weather.condition}) and corridor status.`;
    const step3 = steps.find((s) => s.step_number === 3)?.detail || 'Executed domain tools.';

    const agentMessage: ChatMessage = {
      id: `agent-${Date.now()}`,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: effectiveOutput.agent_response?.markdown_text || effectiveOutput.agent_response?.summary || 'Response generated.',
      thoughtStream: {
        intentAnalysis: step1,
        liveTelemetryCheck: step2,
        toolExecution: effectiveResult.toolInvocations
          .map((t) => `${t.tool_name} -> ${t.result_summary}`)
          .join('\n') || step3,
        rawSteps: steps
      },
      engineOutput: effectiveOutput,
      toolInvocations: effectiveResult.toolInvocations
    };

    setMessages((prev) => [...prev, agentMessage]);
    setIsExecuting(false);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
  };

  const handleResetState = () => {
    setCityState(initialCityState);
    const res = runAgentEngine(dashboardQuery, initialCityState, selectedPersona);
    setEngineResult(res);
  };

  const handleTriggerDisruption = () => {
    const hasDisruption = cityState.disruptions.some((d) => d.status === 'BOTTLENECK');
    const newWeather = hasDisruption ? 'Sunny' : 'Heavy Rain';

    const updatedState: CityLiveState = {
      ...cityState,
      weather: {
        ...cityState.weather,
        condition: newWeather,
        temperature_c: hasDisruption ? 28 : 21,
        precipitation_prob: hasDisruption ? 10 : 95,
        advisory: hasDisruption
          ? 'Clear skies. Optimal outdoor walking conditions.'
          : 'Monsoon storm alert. Corridors prone to flooding. Covered and indoor cultural venues advised.'
      },
      disruptions: cityState.disruptions.map((d) => {
        if (d.id === 'disp-1') {
          return {
            ...d,
            status: hasDisruption ? 'CLEAR' : 'BOTTLENECK',
            delay_minutes: hasDisruption ? 0 : 35
          };
        }
        return d;
      })
    };

    setCityState(updatedState);
    const res = runAgentEngine(dashboardQuery, updatedState, selectedPersona);
    setEngineResult(res);
  };

  const handleApplyPreset = (presetName: 'baseline' | 'rain' | 'overcrowded' | 'bottleneck') => {
    let newState: CityLiveState = { ...cityState };

    if (presetName === 'baseline') {
      newState = JSON.parse(JSON.stringify(initialCityState));
    } else if (presetName === 'rain') {
      newState.weather = {
        condition: 'Heavy Rain',
        temperature_c: 21,
        humidity_percent: 92,
        precipitation_prob: 95,
        advisory: 'Torrential rains logged across urban corridor. Indoor sanctuaries prioritized.'
      };
    } else if (presetName === 'overcrowded') {
      newState.attractions = newState.attractions.map((a) => {
        if (a.id === 'attr-1') return { ...a, current_crowd: 96 };
        if (a.id === 'attr-2') return { ...a, current_crowd: 88 };
        return a;
      });
    } else if (presetName === 'bottleneck') {
      newState.disruptions = newState.disruptions.map((d) => {
        if (d.id === 'disp-1') {
          return {
            ...d,
            status: 'BOTTLENECK',
            delay_minutes: 40,
            cause: 'Severe culvert collapse and emergency utility repair.'
          };
        }
        return d;
      });
    }

    setCityState(newState);
    const res = runAgentEngine(dashboardQuery, newState, selectedPersona);
    setEngineResult(res);
  };

  const hasActiveBottleneck = cityState.disruptions.some((d) => d.status === 'BOTTLENECK');
  const hasAdverseWeather = ['Rain', 'Heavy Rain', 'Thunderstorm'].includes(cityState.weather.condition);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onResetState={handleResetState}
        onTriggerDisruption={handleTriggerDisruption}
        hasDisruptionsActive={hasActiveBottleneck || hasAdverseWeather}
        selectedPersona={selectedPersona}
        onPersonaSelect={(p) => {
          setSelectedPersona(p);
          if (activeView === 'chat') {
            handleSendMessage(`I am switching to ${p} persona. What are your recommendations?`, p);
          }
        }}
        onRunEngine={() => {
          if (activeView === 'chat') {
            handleSendMessage(dashboardQuery, selectedPersona);
          }
        }}
        isExecuting={isExecuting}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onOpenJsonModal={() => {
          setJsonModalPayload(engineResult.output);
          setIsJsonModalOpen(true);
        }}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* VIEW 1: CLEAN CHATBOT UI (Primary Default View) */}
        {activeView === 'chat' && (
          <div className="flex-1 flex relative overflow-hidden">
            <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                isGenerating={isExecuting}
                liveState={cityState}
                onOpenSidebar={() => setIsSidebarOpen(true)}
                onOpenJsonModal={(out) => {
                  setJsonModalPayload(out || engineResult.output);
                  setIsJsonModalOpen(true);
                }}
                selectedPersona={selectedPersona}
                setSelectedPersona={setSelectedPersona}
                onResetChat={handleResetChat}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: OPERATIONS DASHBOARD (Deep Visual Analytics & Itinerary Cards) */}
        {activeView === 'dashboard' && (
          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* LEFT PANEL: Console & State Sliders (5 cols) */}
              <div className="xl:col-span-5 space-y-4">
                <div className="flex items-center justify-between p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setLeftTab('console')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md font-medium transition-colors ${
                      leftTab === 'console'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span>Agent Console & Engine</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeftTab('state_controller')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md font-medium transition-colors ${
                      leftTab === 'state_controller'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Live City Sensors</span>
                  </button>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  {leftTab === 'console' ? (
                    <ExecutionConsole
                      query={dashboardQuery}
                      setQuery={setDashboardQuery}
                      selectedPersona={selectedPersona}
                      setSelectedPersona={(p) => {
                        setSelectedPersona(p);
                        if (p === 'BUSINESS_OWNER') {
                          setDashboardQuery('Forecast visitor crowd surge and calculate recommended staff scaling and inventory for Old City Bazaar from 14:00 to 19:00.');
                        } else if (p === 'TOURISM_AUTHORITY') {
                          setDashboardQuery('High crowd alert at Charminar: deploy police marshals, medical triage stations, and gate influx metering.');
                        } else {
                          setDashboardQuery('I have 3 hours, I am a businessman, I have a meeting at a hotel, find me the shortest route and nearby famous places');
                        }
                      }}
                      onExecute={() => {
                        handleSendMessage(dashboardQuery, selectedPersona);
                      }}
                      isExecuting={isExecuting}
                      thoughtProcess={engineResult.output.thought_process}
                      toolInvocations={engineResult.toolInvocations}
                      onOpenJsonModal={() => {
                        setJsonModalPayload(engineResult.output);
                        setIsJsonModalOpen(true);
                      }}
                    />
                  ) : (
                    <CityStateController
                      state={cityState}
                      onUpdateState={(updater) => {
                        const updated = updater(cityState);
                        setCityState(updated);
                        const res = runAgentEngine(dashboardQuery, updated, selectedPersona);
                        setEngineResult(res);
                      }}
                      onApplyPreset={handleApplyPreset}
                    />
                  )}
                </div>
              </div>

              {/* RIGHT PANEL: Live Decision Cards (7 cols) */}
              <div className="xl:col-span-7">
                <DecisionDashboard
                  output={engineResult.output}
                  liveState={cityState}
                  activePersona={activePersonaTab}
                  onPersonaTabChange={(p) => setActivePersonaTab(p)}
                  extraContext={engineResult.extraContext}
                />
              </div>
            </div>
          </main>
        )}

        {/* VIEW 3: TOOL SPECIFICATIONS VIEW */}
        {activeView === 'tools' && (
          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
            <ToolSpecsView />
          </main>
        )}

        {/* VIEW 4: 10 MANDATORY CAPABILITIES MATRIX */}
        {activeView === 'capabilities' && (
          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
            <CapabilitiesMatrix
              coveredIds={engineResult.capabilitiesCovered}
              activePersona={selectedPersona}
              onSelectPersonaPreset={(p) => {
                setSelectedPersona(p);
                setActiveView('chat');
                if (p === 'TOURIST') {
                  handleSendMessage('I have 3 hours, I am a businessman, I have a meeting at a hotel, find me the shortest route and nearby famous places', 'TOURIST');
                } else if (p === 'BUSINESS_OWNER') {
                  handleSendMessage('Forecast visitor crowd surge and calculate recommended staff scaling and inventory for local shops', 'BUSINESS_OWNER');
                } else {
                  handleSendMessage('Deploy security, crowd control barriers, and medical triage for high density areas', 'TOURISM_AUTHORITY');
                }
              }}
            />
          </main>
        )}
      </div>

      {/* COLLAPSIBLE RIGHT SIDEBAR (Utility Drawer with Live City Sensors & Map) */}
      <RightUtilitySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        liveState={cityState}
        onUpdateState={(updater) => {
          const updated = updater(cityState);
          setCityState(updated);
          const res = runAgentEngine(dashboardQuery, updated, selectedPersona);
          setEngineResult(res);
        }}
        onApplyPreset={handleApplyPreset}
        mapHighlights={engineResult.output.agent_response?.data_visuals?.map_highlights || []}
        itineraryStops={engineResult.extraContext?.smartRoute?.itinerary}
      />

      {/* JSON CONTRACT MODAL */}
      <JsonContractModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        output={jsonModalPayload || engineResult.output}
      />
    </div>
  );
}

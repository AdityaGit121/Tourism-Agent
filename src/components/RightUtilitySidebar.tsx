import React, { useState } from 'react';
import { X, Layers, MapPin, Sliders, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CityLiveState, MapHighlight } from '../types';
import { CityStateController } from './CityStateController';
import { InteractiveMap } from './InteractiveMap';
import { SmartRouteStop } from '../agent/agentTools';

interface RightUtilitySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  liveState: CityLiveState;
  onUpdateState: (updater: (prev: CityLiveState) => CityLiveState) => void;
  onApplyPreset: (presetName: 'baseline' | 'rain' | 'overcrowded' | 'bottleneck') => void;
  mapHighlights: MapHighlight[];
  itineraryStops?: SmartRouteStop[];
  onSelectAttraction?: (attrId: string) => void;
}

export const RightUtilitySidebar: React.FC<RightUtilitySidebarProps> = ({
  isOpen,
  onClose,
  liveState,
  onUpdateState,
  onApplyPreset,
  mapHighlights,
  itineraryStops = [],
  onSelectAttraction
}) => {
  const [activeTab, setActiveTab] = useState<'sensors' | 'map'>('sensors');

  if (!isOpen) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] lg:w-[480px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right duration-200"
      aria-label="Utility Drawer"
    >
      {/* Top Header */}
      <div className="flex-none flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
            Live City Sensors & Map Telemetry
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex-none grid grid-cols-2 p-1.5 m-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('sensors')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
            activeTab === 'sensors'
              ? 'bg-sky-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Live Environmental Sensors</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
            activeTab === 'map'
              ? 'bg-sky-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Minimal Precinct Map</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
        {activeTab === 'sensors' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <span className="font-semibold text-sky-300 block mb-1">Live Sensor Simulation:</span>
              Modify weather, activate roadway bottlenecks, or adjust crowd densities below. The AI Agent Engine continuously monitors these live inputs to dynamically recalculate detour routing and staff scaling.
            </div>

            <CityStateController
              state={liveState}
              onUpdateState={onUpdateState}
              onApplyPreset={onApplyPreset}
            />
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <InteractiveMap
              highlights={mapHighlights}
              attractions={liveState.attractions}
              disruptions={liveState.disruptions}
              itineraryStops={itineraryStops}
              onSelectAttraction={onSelectAttraction}
            />
          </div>
        )}
      </div>

      {/* Bottom Summary Footer */}
      <div className="flex-none px-4 py-2.5 border-t border-slate-800 bg-slate-900/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Telemetry stream active
        </span>
        <span className="text-slate-500">Auto-synced with agent reasoning</span>
      </div>
    </aside>
  );
};

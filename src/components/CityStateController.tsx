import React from 'react';
import { CityLiveState } from '../types';
import { CloudRain, Sun, Zap, Flame, Cloud, AlertTriangle, Sliders, Shield } from 'lucide-react';

interface CityStateControllerProps {
  state: CityLiveState;
  onUpdateState: (updater: (prev: CityLiveState) => CityLiveState) => void;
  onApplyPreset: (presetName: 'baseline' | 'rain' | 'overcrowded' | 'bottleneck') => void;
}

export const CityStateController: React.FC<CityStateControllerProps> = ({
  state,
  onUpdateState,
  onApplyPreset
}) => {
  const handleWeatherChange = (cond: CityLiveState['weather']['condition']) => {
    onUpdateState((prev) => {
      let temp = 28;
      let prob = 10;
      let advisory = 'Clear skies. Optimal outdoor walking conditions.';

      if (cond === 'Rain') {
        temp = 24;
        prob = 75;
        advisory = 'Moderate showers. Covered and indoor cultural venues recommended.';
      } else if (cond === 'Heavy Rain') {
        temp = 21;
        prob = 95;
        advisory = 'Heavy rainfall. Urban water accumulation near low-lying roads. Seek indoor sanctuaries.';
      } else if (cond === 'Thunderstorm') {
        temp = 20;
        prob = 90;
        advisory = 'Thunderstorm warning. High winds at elevated monuments. Lake boat rides suspended.';
      } else if (cond === 'Extreme Heat') {
        temp = 39;
        prob = 0;
        advisory = 'Heat advisory. Avoid open citadel trekking between 12:00 - 15:30. Hydration mandatory.';
      }

      return {
        ...prev,
        weather: {
          condition: cond,
          temperature_c: temp,
          humidity_percent: cond.includes('Rain') ? 85 : 45,
          precipitation_prob: prob,
          advisory
        }
      };
    });
  };

  const handleToggleBottleneck = (dispId: string) => {
    onUpdateState((prev) => ({
      ...prev,
      disruptions: prev.disruptions.map((d) => {
        if (d.id === dispId) {
          const isBottleneck = d.status === 'BOTTLENECK';
          return {
            ...d,
            status: isBottleneck ? 'CLEAR' : 'BOTTLENECK',
            delay_minutes: isBottleneck ? 0 : 25
          };
        }
        return d;
      })
    }));
  };

  const handleCrowdChange = (attrId: string, newCrowd: number) => {
    onUpdateState((prev) => ({
      ...prev,
      attractions: prev.attractions.map((a) => (a.id === attrId ? { ...a, current_crowd: newCrowd } : a))
    }));
  };

  return (
    <div className="space-y-4">
      {/* Simulation Scenario Presets */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
          State Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => onApplyPreset('baseline')}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors text-left"
          >
            ☀️ Normal Sunny
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('rain')}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors text-left"
          >
            🌧️ Severe Rain
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('overcrowded')}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors text-left"
          >
            🚨 Crowd Surge (95%)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('bottleneck')}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors text-left"
          >
            🚧 Fort Road Repair
          </button>
        </div>
      </div>

      {/* Weather Selector */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
          Live Weather Sensor
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {(['Sunny', 'Rain', 'Heavy Rain', 'Thunderstorm', 'Extreme Heat'] as const).map((cond) => {
            const isSelected = state.weather.condition === cond;
            return (
              <button
                key={cond}
                type="button"
                onClick={() => handleWeatherChange(cond)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-sky-950/60 border-sky-500 text-white shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cond === 'Sunny' && <Sun className="w-4 h-4 mb-1 text-amber-400" />}
                {cond === 'Rain' && <CloudRain className="w-4 h-4 mb-1 text-sky-400" />}
                {cond === 'Heavy Rain' && <CloudRain className="w-4 h-4 mb-1 text-blue-400" />}
                {cond === 'Thunderstorm' && <Zap className="w-4 h-4 mb-1 text-purple-400" />}
                {cond === 'Extreme Heat' && <Flame className="w-4 h-4 mb-1 text-rose-400" />}
                <span className="text-[11px] font-medium leading-tight">{cond}</span>
                <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                  {cond === 'Sunny' ? '28°C' : cond.includes('Rain') ? '22°C' : cond === 'Extreme Heat' ? '39°C' : '20°C'}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded border border-slate-800/80">
          Advisory: {state.weather.advisory}
        </div>
      </div>

      {/* Traffic Bottlenecks Toggle */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
          Traffic Corridors & Roadwork Status
        </label>
        <div className="space-y-2">
          {state.disruptions.slice(0, 2).map((disp) => {
            const isBottleneck = disp.status === 'BOTTLENECK';
            return (
              <div
                key={disp.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs"
              >
                <div>
                  <span className="text-white font-medium block">{disp.corridor_name}</span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">
                    {isBottleneck ? `Active Delay: +${disp.delay_minutes} min` : 'Normal Flow (Clear)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleBottleneck(disp.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    isBottleneck
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isBottleneck ? 'Bottleneck' : 'Clear'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Venue Crowd Sliders */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
          Sector Crowd Density Calibration
        </label>
        <div className="space-y-2.5 bg-slate-950/40 border border-slate-800/80 p-3 rounded-lg">
          {state.attractions.slice(0, 4).map((attr) => (
            <div key={attr.id} className="text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium truncate max-w-[170px]">{attr.name}</span>
                <span className={`font-mono font-bold tabular-nums ${
                  attr.current_crowd >= 80 ? 'text-rose-400' : attr.current_crowd >= 50 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {attr.current_crowd}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="98"
                value={attr.current_crowd}
                onChange={(e) => handleCrowdChange(attr.id, Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

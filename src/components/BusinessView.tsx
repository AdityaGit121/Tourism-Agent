import React from 'react';
import { BusinessDemandResult } from '../agent/agentTools';
import { TrendingUp, Users, Package, AlertCircle, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface BusinessViewProps {
  businessDemand?: BusinessDemandResult;
  actionableSteps: string[];
}

export const BusinessView: React.FC<BusinessViewProps> = ({
  businessDemand,
  actionableSteps
}) => {
  if (!businessDemand) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
        No business demand analysis has been run yet. Select a Business Owner prompt or execute the engine to forecast commercial volumes.
      </div>
    );
  }

  const isPositiveScale = businessDemand.recommended_staff_scaling_pct > 0;
  const isNeutralScale = businessDemand.recommended_staff_scaling_pct === 0;

  return (
    <div className="space-y-6">
      {/* 1. Demand & Surge Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Target Commercial Sector</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-white block truncate">
              {businessDemand.zone_name}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Current Density: <strong className="text-white">{businessDemand.current_footfall_pct}%</strong> ({businessDemand.current_density_status})
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Predicted Surge Window</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold font-mono text-amber-400 block">
              {businessDemand.predicted_surge_time}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Peak Volume Projected: <strong className="text-white">{businessDemand.predicted_peak_volume_pct}%</strong>
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Recommended Staff Scaling</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className={`text-lg font-bold font-mono block ${
              isPositiveScale ? 'text-emerald-400' : isNeutralScale ? 'text-slate-300' : 'text-sky-400'
            }`}>
              {isPositiveScale ? `+${businessDemand.recommended_staff_scaling_pct}%` : `${businessDemand.recommended_staff_scaling_pct}%`} Shift Scaling
            </span>
            <span className="text-xs text-slate-400">
              Front-line cashier & service buffer
            </span>
          </div>
        </div>
      </div>

      {/* 2. Hourly Visitor Volume & Staff Requirement Forecast Curve */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Real-Time Footfall Volume & Staff Forecast Curve
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Time-series predictive projection for {businessDemand.zone_name}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-sky-500 rounded-sm"></span>
              <span>Volume %</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm"></span>
              <span>Req. Staff</span>
            </span>
          </div>
        </div>

        {/* Bar/Curve Chart Representation */}
        <div className="mt-6 pt-2">
          <div className="grid grid-cols-9 gap-2 items-end h-44 border-b border-slate-800 pb-2">
            {businessDemand.hourly_forecast.map((item, i) => {
              const isPeak = item.volume_pct === Math.max(...businessDemand.hourly_forecast.map(f => f.volume_pct));
              return (
                <div key={item.hour} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-center mb-1 text-slate-300">
                    <div>{item.volume_pct}%</div>
                    <div className="text-emerald-400">{item.recommended_staff} staff</div>
                  </div>

                  {/* Volume Bar */}
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    <div
                      style={{ height: `${item.volume_pct}%` }}
                      className={`w-full max-w-[20px] rounded-t transition-all ${
                        isPeak
                          ? 'bg-amber-400'
                          : item.volume_pct >= 75
                          ? 'bg-rose-500'
                          : 'bg-sky-600'
                      }`}
                    />
                  </div>

                  {/* Hour label */}
                  <span className="text-[11px] font-mono text-slate-400 mt-2">
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>12:00 Early Afternoon Baseline</span>
            <span className="font-mono text-amber-400 font-semibold">
              Surge Window Peaks around 17:00 ({businessDemand.predicted_peak_volume_pct}%)
            </span>
            <span>20:00 Evening Taper</span>
          </div>
        </div>
      </section>

      {/* 3. Operational Strategies: Inventory & Service Shifts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Protocol */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Package className="w-4 h-4 text-emerald-400" />
            Inventory & Supply Staging Strategy
          </h4>
          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            {businessDemand.inventory_action}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Fast-Mover Buffer:</span>
              <span className="text-slate-300 font-mono">+25% Staged</span>
            </div>
            <div className="flex justify-between">
              <span>Checkout Consumables:</span>
              <span className="text-slate-300 font-mono">Restocked at 14:30</span>
            </div>
          </div>
        </div>

        {/* Service Shift Protocol */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Users className="w-4 h-4 text-sky-400" />
            Service & Floor Re-Allocation
          </h4>
          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            {businessDemand.service_shift_recommendation}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Cashier Terminals:</span>
              <span className="text-slate-300 font-mono">All 4 Open from 15:00</span>
            </div>
            <div className="flex justify-between">
              <span>Line Marshals:</span>
              <span className="text-slate-300 font-mono">2 Assigned to Entry Gate</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Actionable Steps Checklist */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
          Commercial Execution Checklist
        </h3>
        <ul className="mt-3 space-y-2 text-xs text-slate-300">
          {actionableSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2.5 p-2 rounded-md hover:bg-slate-950/50 transition-colors">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center shrink-0 font-mono font-bold text-[11px] mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

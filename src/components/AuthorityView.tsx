import React from 'react';
import { AuthorityDeploymentsResult } from '../agent/agentTools';
import { Shield, Siren, Stethoscope, AlertTriangle, Route, CheckCircle, ArrowRight } from 'lucide-react';

interface AuthorityViewProps {
  authorityDeployments?: AuthorityDeploymentsResult;
  actionableSteps: string[];
}

export const AuthorityView: React.FC<AuthorityViewProps> = ({
  authorityDeployments,
  actionableSteps
}) => {
  if (!authorityDeployments) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
        No authority deployment analysis available. Execute an Authority command prompt to synthesize tactical allocations.
      </div>
    );
  }

  const isAlert = authorityDeployments.citywide_containment_status === 'HIGH_ALERT';
  const isElevated = authorityDeployments.citywide_containment_status === 'ELEVATED';

  const totalPolice = authorityDeployments.deployments.reduce((sum, d) => sum + d.police_units_allocated, 0);
  const totalMedical = authorityDeployments.deployments.reduce((sum, d) => sum + d.medical_triage_stations, 0);

  return (
    <div className="space-y-6">
      {/* 1. Tactical Command Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Containment Posture</span>
            <Shield className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <span className={`text-base font-bold font-mono block ${
              isAlert ? 'text-rose-400' : isElevated ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {authorityDeployments.citywide_containment_status.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-400">
              {authorityDeployments.total_active_critical_zones} High-Density Sectors
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Security Marshals</span>
            <Siren className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold font-mono text-white block tabular-nums">
              {totalPolice} Units
            </span>
            <span className="text-xs text-slate-400">
              Traffic & perimeter control
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Paramedic Triage</span>
            <Stethoscope className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold font-mono text-white block tabular-nums">
              {totalMedical} Stations
            </span>
            <span className="text-xs text-slate-400">
              Rapid response vans active
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Threshold Trigger</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold font-mono text-amber-400 block tabular-nums">
              &ge;{authorityDeployments.overcrowded_threshold}% Density
            </span>
            <span className="text-xs text-slate-400">
              Auto-deployment ceiling
            </span>
          </div>
        </div>
      </div>

      {/* 2. Priority Deployment & Resource Allocation Matrix */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" />
              Tactical Deployment Matrix & Crowd Mitigation Protocols
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live municipal resource assignments by sector priority
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3 text-right">Density</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3 text-right">Police</th>
                <th className="py-2.5 px-3 text-right">Medical</th>
                <th className="py-2.5 px-3">Barriers & Metering</th>
                <th className="py-2.5 px-3">Emergency Corridor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {authorityDeployments.deployments.length > 0 ? (
                authorityDeployments.deployments.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-3 font-sans font-medium text-white">
                      {d.zone_name}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      <span className={d.current_crowd_pct >= 80 ? 'text-rose-400 font-bold' : 'text-amber-400'}>
                        {d.current_crowd_pct}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        d.priority === 'CRITICAL'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {d.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-200 tabular-nums font-bold">
                      {d.police_units_allocated}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-200 tabular-nums">
                      {d.medical_triage_stations}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300 max-w-[200px] truncate" title={d.crowd_control_barriers}>
                      {d.crowd_control_barriers}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-400 max-w-[200px] truncate" title={d.emergency_transit_corridor}>
                      {d.emergency_transit_corridor}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 font-sans">
                    All tourist sectors are currently operating below the {authorityDeployments.overcrowded_threshold}% overcrowding threshold. Standby patrol active.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Influx Gate Metering & Corridor Re-routing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Shield className="w-4 h-4 text-rose-400" />
            Gate Influx Rate Limiting
          </h4>
          <div className="mt-3 space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <div className="flex justify-between font-mono font-medium text-white mb-1">
                <span>Charminar Pedestrian Core:</span>
                <span className="text-rose-400">50 pax/min CAPPED</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                One-way turnstiles engaged at Laad Bazaar entrance. Outflow diverted through Sardar Mahal corridor.
              </p>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <div className="flex justify-between font-mono font-medium text-white mb-1">
                <span>Golconda Fort Citadel:</span>
                <span className="text-amber-400">80 pax/min MONITORED</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Zigzag perimeter buffer holding bus arrivals at outer moat gate.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Route className="w-4 h-4 text-sky-400" />
            Emergency Re-routing Advisories
          </h4>
          <div className="mt-3 space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <div className="font-mono text-amber-300 font-semibold mb-1">
                West Citadel Corridor (Golconda)
              </div>
              <p className="text-slate-400 text-[11px]">
                All municipal shuttles and private tourist vehicles diverted to Langar Houz North Bypass. Clear emergency ambulance lane reserved.
              </p>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <div className="font-mono text-emerald-300 font-semibold mb-1">
                East Musi Riverfront Access
              </div>
              <p className="text-slate-400 text-[11px]">
                Designated as high-speed evacuation and paramedic corridor. Heavy transport prohibited between 14:00 - 20:00.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Actionable Steps Checklist */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
          Municipal Command Action Directives
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

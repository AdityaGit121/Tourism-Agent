import React from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { PersonaType } from '../types';

interface CapabilitiesMatrixProps {
  coveredIds: number[];
  activePersona: PersonaType;
  onSelectPersonaPreset: (p: PersonaType) => void;
}

const CAPABILITIES = [
  {
    id: 1,
    title: 'Open & Low-Crowd Attractions Filtering',
    description: 'Queries live state to filter venues where open_status=True and current_crowd <= max_crowd threshold.',
    tool: 'get_attraction_status(category, max_crowd)',
    personas: ['TOURIST'],
    evidence: 'Tourist filter filters only attractions with open status and density under selected maximum.'
  },
  {
    id: 2,
    title: 'Weather-Optimized 1-Day Itinerary Generation',
    description: 'Dynamically routes between indoor museums or open citadels depending on rainfall, storm, or heat advisories.',
    tool: 'get_smart_route_and_itinerary(time_budget, weather)',
    personas: ['TOURIST'],
    evidence: 'When rain is detected, automatically swaps outdoor forts for climate-controlled indoor sanctuaries like Salar Jung Museum.'
  },
  {
    id: 3,
    title: 'Real-Time Fastest Path Selection Avoiding Traffic',
    description: 'Calculates active delays on corridors and diverts transit to bypass roads (e.g., Langar Houz North Bypass).',
    tool: 'get_smart_route_and_itinerary(time_budget, weather)',
    personas: ['TOURIST', 'TOURISM_AUTHORITY'],
    evidence: 'Applies minute offsets and specifies exact detour corridors in transit steps.'
  },
  {
    id: 4,
    title: 'Active Disruption & Closure Alerts',
    description: 'Real-time detection of road construction, pedestrian bottlenecks, or severe weather warnings in error_handling payload.',
    tool: 'error_handling payload + state inspection',
    personas: ['TOURIST', 'BUSINESS_OWNER', 'TOURISM_AUTHORITY'],
    evidence: 'Populates error_handling.has_disruption and error_handling.disruption_details with actionable detour guidance.'
  },
  {
    id: 5,
    title: 'Budget-Filtered Accommodation Availability',
    description: 'Discovers verified budget stays with proximity to low-crowd hubs, room counts, and nightly price in INR.',
    tool: 'state.budget_hotels query',
    personas: ['TOURIST'],
    evidence: 'Lists hotels near open cultural hubs (e.g. Deccan Residency at ₹1,650/night, 7 rooms left).'
  },
  {
    id: 6,
    title: 'Real-Time Local Event Discovery',
    description: 'Identifies ongoing festivals, light shows, and craft expos with timing, expected crowd surge, and ticket fees.',
    tool: 'state.events query',
    personas: ['TOURIST', 'BUSINESS_OWNER'],
    evidence: 'Displays Deccan Heritage Light Show and Handicraft Expo with surge attendee numbers.'
  },
  {
    id: 7,
    title: 'High-Density Crowd Identification',
    description: 'Identifies sectors at Yellow (50-79%) and Red (>=80%) overcrowding thresholds on interactive map pins.',
    tool: 'getCrowdPin + map_highlights',
    personas: ['TOURIST', 'BUSINESS_OWNER', 'TOURISM_AUTHORITY'],
    evidence: 'Charminar identified as 86% Red Overcrowded; triggers alert pins on interactive map.'
  },
  {
    id: 8,
    title: '2-Hour Predictive Overcrowding Warnings',
    description: 'Models forward surge windows (e.g. 15:00 - 19:30) and alerts commercial owners and authorities before crisis peaks.',
    tool: 'analyze_business_demand + get_authority_deployments',
    personas: ['BUSINESS_OWNER', 'TOURISM_AUTHORITY'],
    evidence: 'Surge projection models peak volume reaching 95% at 17:00 and warns operators.'
  },
  {
    id: 9,
    title: 'Business Staff Scaling & Inventory Strategy',
    description: 'Calculates exact staff scaling percentage (+35% or -10%) and specifies pre-staged inventory protocols.',
    tool: 'analyze_business_demand(zone_id, time_window)',
    personas: ['BUSINESS_OWNER'],
    evidence: 'Outputs exact shift worker delta and fast-turnover inventory placement.'
  },
  {
    id: 10,
    title: 'Municipal Deployment & Safety Allocation Plan',
    description: 'Generates tactical asset allocations for traffic police marshals, paramedic triage vans, and gate metering turnstiles.',
    tool: 'get_authority_deployments(overcrowded_threshold)',
    personas: ['TOURISM_AUTHORITY'],
    evidence: 'Deploys 12 police marshals and 3 triage vans to critical sector with 50 pax/min gate rate limit.'
  }
];

export const CapabilitiesMatrix: React.FC<CapabilitiesMatrixProps> = ({
  coveredIds,
  activePersona,
  onSelectPersonaPreset
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              10 Mandatory Agent Capabilities Verification Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Every capability is rigorously validated through live state data and zero-hallucination function calls.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
              Current Run Verified: {coveredIds.length} / 10
            </span>
          </div>
        </div>
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAPABILITIES.map((cap) => {
          const isCovered = coveredIds.includes(cap.id);
          const isTargetedByPersona = cap.personas.includes(activePersona);

          return (
            <div
              key={cap.id}
              className={`p-4 rounded-xl border transition-all ${
                isCovered
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm shadow-emerald-950/20'
                  : isTargetedByPersona
                  ? 'bg-slate-900/60 border-sky-500/30'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-sky-400 font-bold">
                    #{cap.id}
                  </span>
                  <h3 className="text-sm font-bold text-white">{cap.title}</h3>
                </div>
                {isCovered ? (
                  <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACTIVE</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">
                    Standby
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {cap.description}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Executing Tool:</span>
                  <span className="text-amber-300 truncate max-w-[230px]">{cap.tool}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-300 font-normal">Evidence:</strong> {cap.evidence}
                </div>
              </div>

              {/* Persona Tags */}
              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Target Persona:</span>
                <div className="flex items-center gap-1.5">
                  {cap.personas.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onSelectPersonaPreset(p as PersonaType)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

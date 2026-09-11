import React, { useState } from 'react';
import {
  EngineOutput,
  CityLiveState,
  PersonaType
} from '../types';
import { SmartRouteResult, BusinessDemandResult, AuthorityDeploymentsResult } from '../agent/agentTools';
import { InteractiveMap } from './InteractiveMap';
import { TouristView } from './TouristView';
import { BusinessView } from './BusinessView';
import { AuthorityView } from './AuthorityView';
import {
  ShieldAlert,
  Compass,
  TrendingUp,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  MapPin
} from 'lucide-react';

interface DecisionDashboardProps {
  output: EngineOutput;
  liveState: CityLiveState;
  activePersona: PersonaType;
  onPersonaTabChange: (p: PersonaType) => void;
  extraContext?: {
    smartRoute?: SmartRouteResult;
    businessDemand?: BusinessDemandResult;
    authorityDeployments?: AuthorityDeploymentsResult;
  };
}

export const DecisionDashboard: React.FC<DecisionDashboardProps> = ({
  output,
  liveState,
  activePersona,
  onPersonaTabChange,
  extraContext
}) => {
  const { agent_response, error_handling } = output;
  const { data_visuals, headline, summary, actionable_steps } = agent_response;
  const { status_badge, primary_metric, map_highlights } = data_visuals;

  const isOptimal = status_badge === 'OPTIMAL';
  const isCaution = status_badge === 'CAUTION';
  const isCritical = status_badge === 'CRITICAL_OVERCROWD';

  const badgeColorClass = isCritical
    ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
    : isCaution
    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';

  return (
    <div className="space-y-6">
      {/* 1. Executive Status & Metrics Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-md text-xs font-mono font-bold border ${badgeColorClass}`}
            >
              {status_badge.replace('_', ' ')}
            </span>
            <span className="text-sm font-semibold font-mono text-white">
              {primary_metric}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              Weather: <strong className="text-slate-200 font-normal">{liveState.weather.condition} ({liveState.weather.temperature_c}°C)</strong>
            </span>
            <span>·</span>
            <span>
              Active Corridors: <strong className="text-slate-200 font-normal">{liveState.disruptions.length} Monitored</strong>
            </span>
          </div>
        </div>

        {/* Headline & Summary */}
        <div className="mt-4">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {headline}
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {summary}
          </p>
        </div>

        {/* Disruption Alert (if active) */}
        {error_handling.has_disruption && (
          <div className="mt-4 p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-amber-300">
                Active Operational Disruption Logged:
              </strong>
              <span className="mt-0.5 block leading-relaxed text-[11px] text-amber-200/90">
                {error_handling.disruption_details}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Interactive SVG Map of Tourism Zone */}
      <InteractiveMap
        highlights={map_highlights}
        attractions={liveState.attractions}
        disruptions={liveState.disruptions}
        itineraryStops={extraContext?.smartRoute?.itinerary}
      />

      {/* 3. Persona Decision Center Navigation */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Persona Decision View
          </h3>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => onPersonaTabChange('TOURIST')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                activePersona === 'TOURIST'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Tourist</span>
            </button>
            <button
              type="button"
              onClick={() => onPersonaTabChange('BUSINESS_OWNER')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                activePersona === 'BUSINESS_OWNER'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Business Owner</span>
            </button>
            <button
              type="button"
              onClick={() => onPersonaTabChange('TOURISM_AUTHORITY')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                activePersona === 'TOURISM_AUTHORITY'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>Authority</span>
            </button>
          </div>
        </div>

        {/* Dynamic Persona Panel Content */}
        <div className="mt-4">
          {activePersona === 'TOURIST' && (
            <TouristView
              smartRoute={extraContext?.smartRoute}
              attractions={liveState.attractions}
              events={liveState.events}
              budgetHotels={liveState.budget_hotels}
              actionableSteps={actionable_steps}
              weatherCondition={liveState.weather.condition}
            />
          )}

          {activePersona === 'BUSINESS_OWNER' && (
            <BusinessView
              businessDemand={extraContext?.businessDemand}
              actionableSteps={actionable_steps}
            />
          )}

          {activePersona === 'TOURISM_AUTHORITY' && (
            <AuthorityView
              authorityDeployments={extraContext?.authorityDeployments}
              actionableSteps={actionable_steps}
            />
          )}
        </div>
      </div>
    </div>
  );
};

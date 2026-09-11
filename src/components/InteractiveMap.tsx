import React, { useState } from 'react';
import { MapHighlight, AttractionItem, TrafficRouteDisruption } from '../types';
import { SmartRouteStop } from '../agent/agentTools';
import { Navigation, Clock, ShieldAlert, Sparkles, Building2 } from 'lucide-react';

interface InteractiveMapProps {
  highlights: MapHighlight[];
  attractions: AttractionItem[];
  disruptions: TrafficRouteDisruption[];
  itineraryStops?: SmartRouteStop[];
  onSelectAttraction?: (attrId: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  highlights,
  attractions,
  disruptions,
  itineraryStops = [],
  onSelectAttraction
}) => {
  const [hoveredAttr, setHoveredAttr] = useState<AttractionItem | null>(null);
  const [selectedAttrId, setSelectedAttrId] = useState<string | null>(null);

  // Dynamically compute coordinate bounds based on current highlights or venues
  const allLats = highlights.length > 0 ? highlights.map((h) => h.lat) : attractions.map((a) => a.lat);
  const allLngs = highlights.length > 0 ? highlights.map((h) => h.lng) : attractions.map((a) => a.lng);

  const effMinLat = allLats.length > 0 ? Math.min(...allLats) : 17.35;
  const effMaxLat = allLats.length > 0 ? Math.max(...allLats) : 17.46;
  const effMinLng = allLngs.length > 0 ? Math.min(...allLngs) : 78.365;
  const effMaxLng = allLngs.length > 0 ? Math.max(...allLngs) : 78.495;

  const latSpan = Math.max(effMaxLat - effMinLat, 0.04);
  const lngSpan = Math.max(effMaxLng - effMinLng, 0.04);

  const padMinLat = effMinLat - latSpan * 0.2;
  const padMaxLat = effMaxLat + latSpan * 0.2;
  const padMinLng = effMinLng - lngSpan * 0.2;
  const padMaxLng = effMaxLng + lngSpan * 0.2;

  // Converts geographic lat/lng to SVG percentage (0-100%)
  const toSvgCoords = (lat: number, lng: number) => {
    const x = ((lng - padMinLng) / (padMaxLng - padMinLng)) * 100;
    const y = (1 - (lat - padMinLat) / (padMaxLat - padMinLat)) * 100;
    return {
      x: Math.max(10, Math.min(90, isNaN(x) ? 50 : x)),
      y: Math.max(10, Math.min(90, isNaN(y) ? 50 : y))
    };
  };

  const activeBottleneck = disruptions.find((d) => d.status === 'BOTTLENECK');

  return (
    <div className="relative w-full rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden flex flex-col">
      {/* Top Map Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/60 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>GEO-PRECINCT TELEMETRY & TRANSIT CORRIDOR</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">&lt;50% Normal</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">50-79% Mod</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">&ge;80% Overcrowd</span>
          </span>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full h-[340px] sm:h-[400px] bg-slate-950 select-none overflow-hidden">
        {/* Subtle Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Geographical Water Body: Hussain Sagar Lake */}
          <ellipse
            cx="83"
            cy="27"
            rx="5.5"
            ry="4.2"
            fill="#0284c7"
            fillOpacity="0.2"
            stroke="#0ea5e9"
            strokeWidth="0.4"
            strokeDasharray="1 1"
          />
          <text x="83" y="28" fill="#38bdf8" fontSize="2" textAnchor="middle" opacity="0.6">
            Hussain Sagar
          </text>

          {/* River Musi Corridor */}
          <path
            d="M 15 85 Q 50 82 85 88"
            fill="none"
            stroke="#0369a1"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
          <text x="50" y="85.5" fill="#0284c7" fontSize="1.8" textAnchor="middle" opacity="0.5">
            Musi Riverfront Corridor
          </text>

          {/* Road Corridors */}
          {/* Main Fort Road -> Golconda */}
          <path
            d="M 33 65 L 55 60 L 80 50"
            fill="none"
            stroke="#475569"
            strokeWidth="0.6"
            strokeDasharray="1 0.5"
          />

          {/* If Bottleneck Active: Highlight Red Corridor and Green Detour */}
          {activeBottleneck && (
            <>
              {/* Congested stretch */}
              <path
                d="M 33 65 L 45 62"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Langar Houz North Detour */}
              <path
                d="M 33 65 Q 35 50 55 60"
                fill="none"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="1.5 1"
              />
              <text x="36" y="54" fill="#34d399" fontSize="1.8" textAnchor="middle" fontWeight="bold">
                North Bypass Detour (-18m)
              </text>
            </>
          )}

          {/* Itinerary Transit Line (if tourist itinerary stops exist) */}
          {itineraryStops.length > 1 && (
            <g>
              {itineraryStops.map((stop, idx) => {
                if (idx === itineraryStops.length - 1) return null;
                const nextStop = itineraryStops[idx + 1];
                const fromAttr = attractions.find((a) => a.id === stop.attraction_id);
                const toAttr = attractions.find((a) => a.id === nextStop.attraction_id);
                if (!fromAttr || !toAttr) return null;

                const c1 = toSvgCoords(fromAttr.lat, fromAttr.lng);
                const c2 = toSvgCoords(toAttr.lat, toAttr.lng);

                return (
                  <line
                    key={`itin-line-${stop.attraction_id}-${nextStop.attraction_id}`}
                    x1={c1.x}
                    y1={c1.y}
                    x2={c2.x}
                    y2={c2.y}
                    stroke="#0284c7"
                    strokeWidth="0.8"
                    strokeDasharray="1.5 1.5"
                    strokeOpacity="0.8"
                  />
                );
              })}
            </g>
          )}

          {/* Attraction Pin Markers */}
          {attractions.map((attr) => {
            const coords = toSvgCoords(attr.lat, attr.lng);
            const isHigh = attr.current_crowd >= 80;
            const isMed = attr.current_crowd >= 50 && attr.current_crowd < 80;
            const pinColor = isHigh ? '#f43f5e' : isMed ? '#f59e0b' : '#10b981';
            const isHovered = hoveredAttr?.id === attr.id;
            const isSelected = selectedAttrId === attr.id;

            // Check if this attraction is in the itinerary
            const itinStop = itineraryStops.find((s) => s.attraction_id === attr.id);

            return (
              <g
                key={attr.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => {
                  setSelectedAttrId(attr.id);
                  if (onSelectAttraction) onSelectAttraction(attr.id);
                }}
                onMouseEnter={() => setHoveredAttr(attr)}
                onMouseLeave={() => setHoveredAttr(null)}
              >
                {/* Pulsing ring for critical overcrowded venues */}
                {isHigh && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isSelected ? 6 : 4.5}
                    fill="#f43f5e"
                    fillOpacity="0.2"
                    className="animate-ping origin-center"
                  />
                )}

                {/* Outer selection ring */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={4}
                    fill="none"
                    stroke={pinColor}
                    strokeWidth="0.6"
                    opacity="0.9"
                  />
                )}

                {/* Core Marker Node */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isSelected ? 2.5 : 2}
                  fill={pinColor}
                  stroke="#0f172a"
                  strokeWidth="0.6"
                />

                {/* Sequence badge if part of itinerary */}
                {itinStop && (
                  <g>
                    <rect
                      x={coords.x - 3}
                      y={coords.y - 6}
                      width="6"
                      height="3"
                      rx="1"
                      fill="#0284c7"
                    />
                    <text
                      x={coords.x}
                      y={coords.y - 3.8}
                      fill="#ffffff"
                      fontSize="2.2"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      #{itinStop.sequence}
                    </text>
                  </g>
                )}

                {/* Label */}
                <text
                  x={coords.x}
                  y={coords.y + 4.2}
                  fill="#cbd5e1"
                  fontSize="2"
                  fontWeight="600"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow-md"
                >
                  {attr.name.split(' ')[0]}
                </text>
                <text
                  x={coords.x}
                  y={coords.y + 6.2}
                  fill={pinColor}
                  fontSize="1.7"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {attr.current_crowd}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Selected Info Tooltip Overlay */}
        {(hoveredAttr || (selectedAttrId && attractions.find((a) => a.id === selectedAttrId))) && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm p-3 rounded-lg bg-slate-900/95 border border-slate-700 shadow-xl backdrop-blur-md z-10 transition-all">
            {(() => {
              const active = hoveredAttr || attractions.find((a) => a.id === selectedAttrId)!;
              const isHigh = active.current_crowd >= 80;
              const isMed = active.current_crowd >= 50 && active.current_crowd < 80;
              const badgeText = isHigh ? 'CRITICAL DENSITY' : isMed ? 'MODERATE FLOW' : 'OPTIMAL CAPACITY';
              const badgeColor = isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400';

              return (
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">{active.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {active.category} · {active.is_indoor ? 'Indoor (Climate Controlled)' : 'Outdoor Open Precinct'}
                      </p>
                    </div>
                    <span className={`text-[11px] font-mono font-semibold ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Crowd Density</span>
                      <span className="font-mono font-bold text-white tabular-nums">{active.current_crowd}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Est. Wait</span>
                      <span className="font-mono text-slate-200 tabular-nums">~{Math.round(active.current_crowd * 0.4)} min</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Ticket Rate</span>
                      <span className="font-mono text-slate-200 tabular-nums">₹{active.ticket_price_inr}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                    {active.description}
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Corridor Disruption Alert Banner */}
      {activeBottleneck && (
        <div className="px-4 py-2 bg-amber-950/40 border-t border-amber-800/40 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Active Disruption:</strong> {activeBottleneck.corridor_name} (+{activeBottleneck.delay_minutes}m delay)
            </span>
          </div>
          <span className="text-slate-400 hidden md:inline">
            Detour: {activeBottleneck.recommended_detour}
          </span>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { AttractionItem, LocalEventItem, BudgetHotelItem } from '../types';
import { SmartRouteResult } from '../agent/agentTools';
import { Clock, MapPin, ShieldCheck, Umbrella, Compass, Sparkles, Building, Calendar, DollarSign } from 'lucide-react';

interface TouristViewProps {
  smartRoute?: SmartRouteResult;
  attractions: AttractionItem[];
  events: LocalEventItem[];
  budgetHotels: BudgetHotelItem[];
  actionableSteps: string[];
  weatherCondition: string;
}

export const TouristView: React.FC<TouristViewProps> = ({
  smartRoute,
  attractions,
  events,
  budgetHotels,
  actionableSteps,
  weatherCondition
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [maxCrowdSlider, setMaxCrowdSlider] = useState<number>(75);

  const filteredAttractions = attractions.filter((a) => {
    const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
    const matchesCrowd = a.current_crowd <= maxCrowdSlider;
    return a.open_status && matchesCategory && matchesCrowd;
  });

  return (
    <div className="space-y-6">
      {/* 1. Smart Route & Itinerary Section */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400" />
              Weather-Optimized Sequential 1-Day Itinerary
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {smartRoute?.weather_strategy || 'Sequential route calibrated against live weather and road bottlenecks.'}
            </p>
          </div>
          {smartRoute && (
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>Duration: <strong className="text-white">{smartRoute.total_duration_hours} hrs</strong></span>
              <span>·</span>
              <span>Offset Saved: <strong className="text-emerald-400">{smartRoute.traffic_offset_applied_min} min</strong></span>
            </div>
          )}
        </div>

        {/* Itinerary Timeline */}
        <div className="mt-5 space-y-4">
          {smartRoute?.itinerary && smartRoute.itinerary.length > 0 ? (
            smartRoute.itinerary.map((stop, idx) => (
              <div
                key={stop.attraction_id}
                className="relative pl-7 pb-4 border-l-2 border-slate-700 last:border-l-0 last:pb-0"
              >
                {/* Timeline node */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-sky-500 border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-white font-mono">
                  {stop.sequence}
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-sky-400">
                          {stop.arrival_time}
                        </span>
                        <span className="text-slate-600">·</span>
                        <h4 className="text-sm font-semibold text-white">{stop.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {stop.category} · {stop.duration_hours} hrs dwell · {stop.is_indoor ? 'Indoor Sanction' : 'Outdoor Precinct'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-mono font-bold tabular-nums ${
                        stop.crowd_expected >= 80 ? 'text-rose-400' : stop.crowd_expected >= 50 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {stop.crowd_expected}% Density
                      </span>
                    </div>
                  </div>

                  {/* Transit note to next destination */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Transit to next: <strong className="text-slate-300 font-mono font-normal">{stop.transit_to_next_min} min</strong>
                    </span>
                    <span className="text-[11px] text-slate-500 italic">
                      {stop.transit_corridor_note}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              No itinerary generated yet. Run the agent to synthesize an optimal route.
            </div>
          )}
        </div>
      </section>

      {/* 2. Open & Low-Crowd Attraction Filter */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Open & Low-Crowd Attractions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant verification from live sensor feed · {filteredAttractions.length} venues matching
            </p>
          </div>

          {/* Interactive controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Max Density:</span>
              <input
                type="range"
                min="20"
                max="95"
                value={maxCrowdSlider}
                onChange={(e) => setMaxCrowdSlider(Number(e.target.value))}
                className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="font-mono text-slate-200 tabular-nums w-8 text-right font-medium">
                {maxCrowdSlider}%
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {['All', 'Heritage', 'Museum', 'Nature', 'Cultural'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    categoryFilter === cat
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {filteredAttractions.map((attr) => (
            <div
              key={attr.id}
              className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">{attr.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {attr.category} · {attr.is_indoor ? 'Indoor Venue' : 'Open Air'} · {attr.opening_hours}
                  </p>
                </div>
                <span className={`text-xs font-mono font-bold tabular-nums ${
                  attr.current_crowd >= 80 ? 'text-rose-400' : attr.current_crowd >= 50 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {attr.current_crowd}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-800/60">
                <span>Entry: ₹{attr.ticket_price_inr}</span>
                <span>Est. Wait: ~{Math.round(attr.current_crowd * 0.4)}m</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Real-Time Local Events Discovery & Budget Stays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Local Events */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Calendar className="w-4 h-4 text-amber-400" />
            Live Local Event Discovery
          </h3>

          <div className="space-y-3 mt-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white">{ev.title}</h4>
                  <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded ${
                    ev.status === 'ACTIVE_NOW'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {ev.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Venue: <strong className="text-slate-300 font-normal">{ev.venue}</strong> ({ev.time})
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span>Entry: {ev.entry_fee}</span>
                  <span>Surge Expected: ~{ev.crowd_surge_expected} attendees</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Budget Hotels Filter */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building className="w-4 h-4 text-sky-400" />
            Verified Budget Accommodations
          </h3>

          <div className="space-y-3 mt-4">
            {budgetHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{hotel.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {hotel.zone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                      ₹{hotel.nightly_rate_inr}
                    </span>
                    <span className="text-[10px] text-slate-500 block">/night</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-800/60">
                  <span>⭐ {hotel.rating} · {hotel.available_rooms} rooms open</span>
                  <span className="text-slate-400 text-[11px] truncate max-w-[180px]">
                    {hotel.proximity_to_low_crowd_hubs}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Actionable Steps Checklist */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
          Synthesized Tourist Action Plan & Contingencies
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

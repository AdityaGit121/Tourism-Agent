import React from 'react';
import { Terminal, Code, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

export const ToolSpecsView: React.FC = () => {
  const tools = [
    {
      num: 1,
      name: 'get_attraction_status',
      signature: 'get_attraction_status(category: string, max_crowd: integer)',
      description: 'Filters urban cultural venues, monuments, and museums by open status and maximum allowable crowd density percentage.',
      params: [
        { name: 'category', type: 'string', desc: "Attraction category: 'Heritage', 'Museum', 'Nature', 'Cultural', or 'all'" },
        { name: 'max_crowd', type: 'integer', desc: 'Maximum allowable crowd density percentage (0-100)' }
      ],
      returns: 'List of attractions matching open_status=True and current_crowd <= max_crowd.',
      exampleArgs: '{ "category": "all", "max_crowd": 60 }',
      exampleReturn: `{
  "matched_count": 5,
  "attractions": [
    { "name": "Salar Jung National Museum", "current_crowd": 32, "is_indoor": true },
    { "name": "Chowmahalla Palace", "current_crowd": 42, "is_indoor": true }
  ]
}`
    },
    {
      num: 2,
      name: 'get_smart_route_and_itinerary',
      signature: 'get_smart_route_and_itinerary(time_budget_hours: integer, weather_condition: string)',
      description: 'Generates a time-decayed sequential itinerary avoiding active road bottlenecks and adapting stop selection to adverse weather.',
      params: [
        { name: 'time_budget_hours', type: 'integer', desc: 'Total touring duration budget (e.g. 4, 6, 8 hours)' },
        { name: 'weather_condition', type: 'string', desc: "Live weather condition (e.g. 'Sunny', 'Rain', 'Heavy Rain', 'Thunderstorm')" }
      ],
      returns: 'Time-decayed sequential itinerary avoiding active road disruptions or adverse weather zones.',
      exampleArgs: '{ "time_budget_hours": 6, "weather_condition": "Heavy Rain" }',
      exampleReturn: `{
  "weather_strategy": "Adverse weather detected. Itinerary prioritized indoor air-conditioned venues.",
  "total_duration_hours": 6,
  "traffic_offset_applied_min": 25,
  "itinerary": [
    { "sequence": 1, "name": "Salar Jung National Museum", "arrival_time": "09:30", "is_indoor": true },
    { "sequence": 2, "name": "Chowmahalla Palace", "arrival_time": "11:50", "is_indoor": true }
  ]
}`
    },
    {
      num: 3,
      name: 'analyze_business_demand',
      signature: 'analyze_business_demand(zone_id: string, time_window: string)',
      description: 'Performs predictive commercial footfall modeling, surge window estimation, and calculates frontline staffing scaling percentages.',
      params: [
        { name: 'zone_id', type: 'string', desc: "Target business zone identifier (e.g. 'zone-oldcity', 'zone-golconda', 'zone-lakefront')" },
        { name: 'time_window', type: 'string', desc: "Operational window to analyze (e.g. '14:00-19:00')" }
      ],
      returns: 'Crowd volume metrics, predicted surge time, and recommended staff scaling percentages.',
      exampleArgs: '{ "zone_id": "zone-oldcity", "time_window": "14:00-19:00" }',
      exampleReturn: `{
  "zone_name": "Heritage Bazaar Precinct",
  "current_footfall_pct": 86,
  "predicted_surge_time": "15:00 - 19:30",
  "predicted_peak_volume_pct": 95,
  "recommended_staff_scaling_pct": 35,
  "inventory_action": "Urgent: Pre-stage rapid-turnover inventory, cold beverages, and express checkout lines"
}`
    },
    {
      num: 4,
      name: 'get_authority_deployments',
      signature: 'get_authority_deployments(overcrowded_threshold: integer)',
      description: 'Generates tactical municipal security, paramedic triage, barrier configurations, and pedestrian gate influx caps.',
      params: [
        { name: 'overcrowded_threshold', type: 'integer', desc: 'Overcrowding percentage trigger (e.g. 70 or 80%)' }
      ],
      returns: 'Priority deploy zones for traffic police, medical support, and security assets.',
      exampleArgs: '{ "overcrowded_threshold": 70 }',
      exampleReturn: `{
  "citywide_containment_status": "HIGH_ALERT",
  "total_active_critical_zones": 1,
  "deployments": [
    {
      "zone_name": "Charminar & Historic Bazaar",
      "priority": "CRITICAL",
      "police_units_allocated": 12,
      "medical_triage_stations": 3,
      "crowd_control_barriers": "Heavy barricades + Perimeter one-way pedestrian turnstiles",
      "emergency_transit_corridor": "Dedicated Green Emergency Corridor via East Perimeter"
    }
  ]
}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          Section 3: Executable Tool Definitions & Function Calling Contracts
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          The Tourism Management Agent Engine executes function calls directly against the live urban state database with zero hallucination.
        </p>
      </div>

      {/* Tools List */}
      <div className="space-y-4">
        {tools.map((tool) => (
          <div
            key={tool.num}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center font-mono font-bold text-xs">
                  {tool.num}
                </span>
                <h3 className="text-base font-bold font-mono text-white">
                  {tool.signature}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                TOOL {tool.num} CONTRACT
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {tool.description}
            </p>

            {/* Parameters Table */}
            <div className="mt-4">
              <h4 className="text-[11px] font-mono font-semibold uppercase text-slate-400 mb-2">
                Parameters
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] font-mono">
                    <tr>
                      <th className="py-1.5 px-2.5">Parameter</th>
                      <th className="py-1.5 px-2.5">Type</th>
                      <th className="py-1.5 px-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {tool.params.map((p) => (
                      <tr key={p.name}>
                        <td className="py-2 px-2.5 text-sky-400 font-semibold">{p.name}</td>
                        <td className="py-2 px-2.5 text-slate-400">{p.type}</td>
                        <td className="py-2 px-2.5 font-sans text-slate-300">{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Code Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
                  Input Invocation:
                </span>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
                  {tool.exampleArgs}
                </pre>
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
                  Contract Return:
                </span>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                  {tool.exampleReturn}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

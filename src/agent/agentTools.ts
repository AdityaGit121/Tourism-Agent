import { CityLiveState, AttractionItem } from '../types';

export interface SmartRouteStop {
  sequence: number;
  attraction_id: string;
  name: string;
  category: string;
  arrival_time: string;
  duration_hours: number;
  is_indoor: boolean;
  transit_to_next_min: number;
  transit_corridor_note: string;
  crowd_expected: number;
  status_note: string;
}

export interface SmartRouteResult {
  weather_strategy: string;
  total_duration_hours: number;
  traffic_offset_applied_min: number;
  itinerary: SmartRouteStop[];
  detour_advisories: string[];
}

export interface BusinessDemandResult {
  zone_id: string;
  zone_name: string;
  current_footfall_pct: number;
  current_density_status: 'Low' | 'Moderate' | 'High' | 'Overcrowded';
  predicted_surge_time: string;
  predicted_peak_volume_pct: number;
  recommended_staff_scaling_pct: number; // e.g. +35 or -10
  inventory_action: string;
  service_shift_recommendation: string;
  hourly_forecast: { hour: string; volume_pct: number; recommended_staff: number }[];
}

export interface AuthorityDeploymentItem {
  id: string;
  zone_name: string;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'STANDBY';
  current_crowd_pct: number;
  overcrowd_delta: number;
  police_units_allocated: number;
  medical_triage_stations: number;
  crowd_control_barriers: string;
  emergency_transit_corridor: string;
  recommended_actions: string[];
}

export interface AuthorityDeploymentsResult {
  overcrowded_threshold: number;
  total_active_critical_zones: number;
  deployments: AuthorityDeploymentItem[];
  citywide_containment_status: 'STABLE' | 'ELEVATED' | 'HIGH_ALERT';
}

/**
 * TOOL 1: get_attraction_status(category: string, max_crowd: integer)
 * Returns: List of attractions matching open_status=True and current_crowd <= max_crowd.
 */
export function get_attraction_status(
  state: CityLiveState,
  category: string,
  max_crowd: number
): { matched_count: number; attractions: AttractionItem[] } {
  const normCategory = category.trim().toLowerCase();
  
  const filtered = state.attractions.filter((attr) => {
    const matchesCategory = normCategory === 'all' || normCategory === '' || attr.category.toLowerCase() === normCategory;
    const matchesOpen = attr.open_status === true;
    const matchesCrowd = attr.current_crowd <= max_crowd;
    return matchesCategory && matchesOpen && matchesCrowd;
  });

  return {
    matched_count: filtered.length,
    attractions: filtered
  };
}

/**
 * TOOL 2: get_smart_route_and_itinerary(time_budget_hours: integer, weather_condition: string)
 * Returns: Time-decayed sequential itinerary avoiding active road disruptions or adverse weather zones.
 */
export function get_smart_route_and_itinerary(
  state: CityLiveState,
  time_budget_hours: number,
  weather_condition: string
): SmartRouteResult {
  const isAdverseWeather = ['Rain', 'Heavy Rain', 'Thunderstorm', 'Extreme Heat'].includes(weather_condition);
  
  // Find traffic disruptions
  const activeDisruptions = state.disruptions.filter((d) => d.status === 'BOTTLENECK' || d.delay_minutes > 15);
  const totalOffset = activeDisruptions.reduce((acc, d) => acc + d.delay_minutes, 0);

  // Candidate attractions: if adverse weather, prioritize indoor
  let pool = [...state.attractions].filter((a) => a.open_status);
  
  if (isAdverseWeather) {
    // Prefer indoor attractions with low/moderate crowd
    pool = pool.sort((a, b) => {
      if (a.is_indoor && !b.is_indoor) return -1;
      if (!a.is_indoor && b.is_indoor) return 1;
      return a.current_crowd - b.current_crowd;
    });
  } else {
    // Rank by lowest crowd and optimal experience
    pool = pool.sort((a, b) => a.current_crowd - b.current_crowd);
  }

  // Calculate stops according to time budget (each stop ~ 1.5 - 2 hrs + transit)
  const maxStops = Math.max(1, Math.min(4, Math.floor(time_budget_hours / 2)));
  const selectedAttractions = pool.slice(0, maxStops);

  let currentHour = 9; // 09:00 start
  let currentMinute = 30;
  const itineraryStops: SmartRouteStop[] = [];

  selectedAttractions.forEach((attr, idx) => {
    const arrivalFormatted = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    const stayHours = Math.min(2, Math.max(1.5, Math.round((time_budget_hours / maxStops) * 10) / 10));
    
    // Check if route to this attraction has known bottleneck
    let corridorNote = 'Express transit unobstructed';
    let transitTimeMin = 20;

    if (attr.zone_id === 'zone-golconda') {
      const fortDisp = state.disruptions.find((d) => d.id === 'disp-1');
      if (fortDisp && fortDisp.status === 'BOTTLENECK') {
        corridorNote = `Detour active via North Ring Bypass (+${fortDisp.delay_minutes}m mitigated)`;
        transitTimeMin += 10;
      }
    } else if (attr.zone_id === 'zone-oldcity') {
      const oldCityDisp = state.disruptions.find((d) => d.id === 'disp-2');
      if (oldCityDisp) {
        corridorNote = `Pedestrian corridor dense; routing via Riverfront Bridge (+${oldCityDisp.delay_minutes}m)`;
        transitTimeMin += oldCityDisp.delay_minutes;
      }
    }

    itineraryStops.push({
      sequence: idx + 1,
      attraction_id: attr.id,
      name: attr.name,
      category: attr.category,
      arrival_time: arrivalFormatted,
      duration_hours: stayHours,
      is_indoor: attr.is_indoor,
      transit_to_next_min: transitTimeMin,
      transit_corridor_note: corridorNote,
      crowd_expected: attr.current_crowd,
      status_note: attr.is_indoor ? 'Optimal climate-controlled sanctuary' : 'Open outdoor venue'
    });

    // Advance clock
    const advanceMinutes = Math.round(stayHours * 60) + transitTimeMin;
    currentMinute += advanceMinutes;
    currentHour += Math.floor(currentMinute / 60);
    currentMinute = currentMinute % 60;
  });

  const advisories = activeDisruptions.map(
    (d) => `${d.corridor_name}: ${d.cause} -> ${d.recommended_detour}`
  );

  return {
    weather_strategy: isAdverseWeather
      ? `Adverse weather (${weather_condition}) detected. Itinerary prioritized air-conditioned and covered cultural venues.`
      : `Optimal conditions (${weather_condition}). Balanced heritage and scenic outdoor routing active.`,
    total_duration_hours: time_budget_hours,
    traffic_offset_applied_min: totalOffset,
    itinerary: itineraryStops,
    detour_advisories: advisories
  };
}

/**
 * TOOL 3: analyze_business_demand(zone_id: string, time_window: string)
 * Returns: Crowd volume metrics, predicted surge time, and recommended staff scaling percentages.
 */
export function analyze_business_demand(
  state: CityLiveState,
  zone_id: string,
  time_window: string
): BusinessDemandResult {
  const zoneAttractions = state.attractions.filter((a) => a.zone_id === zone_id || zone_id === 'all');
  const avgCrowd = zoneAttractions.length > 0
    ? Math.round(zoneAttractions.reduce((acc, a) => acc + a.current_crowd, 0) / zoneAttractions.length)
    : 55;

  let zoneName = 'Heritage Bazaar Precinct';
  if (zone_id === 'zone-golconda') zoneName = 'Golconda Citadel Commercial Buffer';
  else if (zone_id === 'zone-arts') zoneName = 'Arts & Museum Riverfront Walk';
  else if (zone_id === 'zone-lakefront') zoneName = 'Hussain Sagar Marina Promenade';
  else if (zone_id === 'zone-hitec') zoneName = 'Shilparamam Crafts Corridor';

  // Predictive surge modeling
  let predictedSurge = '16:30 - 18:30';
  let predictedPeak = Math.min(98, Math.round(avgCrowd * 1.25));
  let staffScaling = 0;
  let inventoryAction = 'Standard re-supply protocol';
  let serviceShift = 'Maintain core counter operations';

  if (avgCrowd >= 75) {
    staffScaling = 35; // +35% staff
    predictedSurge = '15:00 - 19:30';
    predictedPeak = 95;
    inventoryAction = 'Urgent: Pre-stage rapid-turnover inventory, cold beverages, and express checkout lines';
    serviceShift = 'Reassign 30% back-of-house staff to customer line management and ticketing kiosks';
  } else if (avgCrowd >= 50) {
    staffScaling = 15; // +15% staff
    predictedSurge = '16:00 - 18:30';
    predictedPeak = 78;
    inventoryAction = 'Stage +20% replenishment at peak service points; prep quick grab-and-go packaging';
    serviceShift = 'Open secondary payment terminal during surge window';
  } else {
    staffScaling = -10; // -10% idle optimization
    predictedSurge = '18:00 - 19:30 (Moderate)';
    predictedPeak = 45;
    inventoryAction = 'Standard inventory holding; avoid over-prep of perishables';
    serviceShift = 'Schedule routine staff training or early prep for weekend surge';
  }

  // Weather impact modifier on business demand
  if (state.weather.condition === 'Heavy Rain' || state.weather.condition === 'Thunderstorm') {
    if (zoneAttractions.some((a) => !a.is_indoor)) {
      staffScaling -= 15;
      inventoryAction += ' [Rain Advisory: Shift retail focus to covered arcade fronts / hot beverage prep].';
    }
  }

  // Generate hourly forecast curve for the dashboard
  const hours = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  const hourly_forecast = hours.map((h, i) => {
    // Bell curve peaked around 17:00
    const factor = Math.sin((i / (hours.length - 1)) * Math.PI);
    const vol = Math.min(99, Math.max(20, Math.round(avgCrowd * 0.7 + factor * (predictedPeak - avgCrowd * 0.7))));
    const staffRec = Math.max(3, Math.round((vol / 100) * 16));
    return { hour: h, volume_pct: vol, recommended_staff: staffRec };
  });

  return {
    zone_id,
    zone_name: zoneName,
    current_footfall_pct: avgCrowd,
    current_density_status: avgCrowd >= 80 ? 'Overcrowded' : avgCrowd >= 50 ? 'High' : avgCrowd >= 30 ? 'Moderate' : 'Low',
    predicted_surge_time: predictedSurge,
    predicted_peak_volume_pct: predictedPeak,
    recommended_staff_scaling_pct: staffScaling,
    inventory_action: inventoryAction,
    service_shift_recommendation: serviceShift,
    hourly_forecast
  };
}

/**
 * TOOL 4: get_authority_deployments(overcrowded_threshold: integer)
 * Returns: Priority deploy zones for traffic police, medical support, and security assets.
 */
export function get_authority_deployments(
  state: CityLiveState,
  overcrowded_threshold: number
): AuthorityDeploymentsResult {
  const deployments: AuthorityDeploymentItem[] = [];

  // Evaluate each attraction zone against threshold
  state.attractions.forEach((attr) => {
    if (attr.current_crowd >= overcrowded_threshold) {
      const delta = attr.current_crowd - overcrowded_threshold;
      let priority: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'MODERATE';
      let police = 4;
      let medical = 1;
      let barriers = 'Single-lane stanchions';
      let transitCorridor = 'Normal side-access lane';
      const actions: string[] = [];

      if (attr.current_crowd >= 85) {
        priority = 'CRITICAL';
        police = 12;
        medical = 3;
        barriers = 'Heavy barricades + Perimeter one-way pedestrian turnstiles';
        transitCorridor = 'Dedicated Green Emergency Corridor via East Perimeter';
        actions.push(`Activate Stage-3 Influx Gate metering at ${attr.name} (Hold entry to 50 visitors/min).`);
        actions.push('Deploy rapid-response paramedic triage van at north access plaza.');
        actions.push('Divert incoming tour buses to satellite holding parking 2 km out.');
      } else if (attr.current_crowd >= 70) {
        priority = 'HIGH';
        police = 8;
        medical = 2;
        barriers = 'Dynamic zigzag queues to buffer bottleneck points';
        transitCorridor = 'Single-lane priority transit clearance';
        actions.push(`Station 4 traffic marshals at primary junction leading to ${attr.name}.`);
        actions.push('Broadcast dynamic variable message signs (VMS) warning +30m congestion.');
      } else {
        priority = 'MODERATE';
        police = 4;
        medical = 1;
        barriers = 'Standard crowd guidance ropes';
        transitCorridor = 'Clear curbside ambulance access';
        actions.push('Routine monitoring of perimeter flow.');
      }

      deployments.push({
        id: `deploy-${attr.id}`,
        zone_name: `${attr.name} (${attr.zone_id})`,
        priority,
        current_crowd_pct: attr.current_crowd,
        overcrowd_delta: delta,
        police_units_allocated: police,
        medical_triage_stations: medical,
        crowd_control_barriers: barriers,
        emergency_transit_corridor: transitCorridor,
        recommended_actions: actions
      });
    }
  });

  // Sort critical first
  deployments.sort((a, b) => b.current_crowd_pct - a.current_crowd_pct);

  const totalCritical = deployments.filter((d) => d.priority === 'CRITICAL').length;
  const status: 'STABLE' | 'ELEVATED' | 'HIGH_ALERT' = totalCritical > 0 ? 'HIGH_ALERT' : deployments.length > 0 ? 'ELEVATED' : 'STABLE';

  return {
    overcrowded_threshold,
    total_active_critical_zones: deployments.length,
    deployments,
    citywide_containment_status: status
  };
}

export type PersonaType = 'TOURIST' | 'BUSINESS_OWNER' | 'TOURISM_AUTHORITY';

export type StatusBadgeType = 'OPTIMAL' | 'CAUTION' | 'CRITICAL_OVERCROWD';

export type PinColorType = 'GREEN' | 'YELLOW' | 'RED';

export interface ThoughtStep {
  step_number: number;
  action: string;
  detail: string;
}

export interface MapHighlight {
  name: string;
  lat: number;
  lng: number;
  crowd_level: 'Low' | 'Medium' | 'High';
  pin_color: PinColorType;
  category?: string;
  current_crowd_percent?: number;
  estimated_wait_min?: number;
  is_indoor?: boolean;
}

export interface AgentResponseDataVisuals {
  status_badge: StatusBadgeType;
  primary_metric: string;
  map_highlights: MapHighlight[];
}

export interface AgentResponsePayload {
  persona: PersonaType;
  headline: string;
  summary: string;
  data_visuals: AgentResponseDataVisuals;
  actionable_steps: string[];
  markdown_text?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  timestamp: string;
  content: string;
  thoughtStream?: {
    intentAnalysis: string;
    liveTelemetryCheck: string;
    toolExecution: string;
    rawSteps?: ThoughtStep[];
  };
  engineOutput?: EngineOutput;
  toolInvocations?: ToolInvocationRecord[];
  isThinking?: boolean;
}

export interface ErrorHandlingPayload {
  has_disruption: boolean;
  disruption_details: string;
}

export interface EngineOutput {
  thought_process: ThoughtStep[];
  agent_response: AgentResponsePayload;
  error_handling: ErrorHandlingPayload;
}

// Live City State Types
export interface AttractionItem {
  id: string;
  name: string;
  category: 'Heritage' | 'Museum' | 'Nature' | 'Cultural' | 'Religious' | 'Entertainment';
  lat: number;
  lng: number;
  open_status: boolean;
  opening_hours: string;
  current_crowd: number; // percentage 0-100
  capacity: number;
  is_indoor: boolean;
  ticket_price_inr: number;
  description: string;
  zone_id: string;
}

export interface TrafficRouteDisruption {
  id: string;
  corridor_name: string;
  status: 'CLEAR' | 'MODERATE' | 'BOTTLENECK' | 'CLOSED';
  delay_minutes: number;
  cause: string;
  recommended_detour: string;
}

export interface LocalEventItem {
  id: string;
  title: string;
  venue: string;
  time: string;
  crowd_surge_expected: number; // estimated attendees
  entry_fee: string;
  status: 'ACTIVE_NOW' | 'STARTING_SOON' | 'SCHEDULED';
}

export interface BudgetHotelItem {
  id: string;
  name: string;
  zone: string;
  nightly_rate_inr: number;
  rating: number;
  available_rooms: number;
  proximity_to_low_crowd_hubs: string;
}

export interface CityLiveState {
  weather: {
    condition: 'Sunny' | 'Rain' | 'Heavy Rain' | 'Thunderstorm' | 'Overcast' | 'Extreme Heat';
    temperature_c: number;
    humidity_percent: number;
    precipitation_prob: number;
    advisory: string;
  };
  disruptions: TrafficRouteDisruption[];
  attractions: AttractionItem[];
  events: LocalEventItem[];
  budget_hotels: BudgetHotelItem[];
}

export interface ToolInvocationRecord {
  timestamp: string;
  tool_name:
    | 'get_attraction_status'
    | 'get_smart_route_and_itinerary'
    | 'analyze_business_demand'
    | 'get_authority_deployments'
    | 'resolve_destination_transit_nodes'
    | string;
  args: Record<string, unknown>;
  result_summary: string;
  raw_result: unknown;
}

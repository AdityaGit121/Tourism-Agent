import { CityLiveState } from '../types';

export const initialCityState: CityLiveState = {
  weather: {
    condition: 'Sunny',
    temperature_c: 28,
    humidity_percent: 45,
    precipitation_prob: 10,
    advisory: 'Clear skies. Optimal outdoor walking conditions until 14:00.'
  },
  disruptions: [
    {
      id: 'disp-1',
      corridor_name: 'Main Fort Road (Golconda Approach)',
      status: 'BOTTLENECK',
      delay_minutes: 25,
      cause: 'Emergency culvert pavement repair near Fateh Darwaza.',
      recommended_detour: 'Divert traffic through Langar Houz North Ring Bypass (-18m savings).'
    },
    {
      id: 'disp-2',
      corridor_name: 'Charminar Pedestrian Core Corridor',
      status: 'MODERATE',
      delay_minutes: 15,
      cause: 'Festival market footfall density and seasonal street stalls.',
      recommended_detour: 'Route tourist shuttles via Nayapul East Riverfront Bridge.'
    },
    {
      id: 'disp-3',
      corridor_name: 'Central Tank Bund (Hussain Sagar Lakefront)',
      status: 'CLEAR',
      delay_minutes: 0,
      cause: 'Traffic moving freely with active signal coordination.',
      recommended_detour: 'No diversion needed. Optimal transit corridor.'
    },
    {
      id: 'disp-4',
      corridor_name: 'High-Tech Express Flyover (PVNR Corridor)',
      status: 'CLEAR',
      delay_minutes: 0,
      cause: 'Unrestricted airport & museum connector flow.',
      recommended_detour: 'Primary express transit route.'
    }
  ],
  attractions: [
    {
      id: 'attr-1',
      name: 'Charminar & Historic Bazaar',
      category: 'Heritage',
      lat: 17.3616,
      lng: 78.4747,
      open_status: true,
      opening_hours: '09:00 - 17:30',
      current_crowd: 92, // Overcrowded
      capacity: 3500,
      is_indoor: false,
      ticket_price_inr: 25,
      description: 'Iconic 16th-century monument with high pedestrian load and bustling heritage markets.',
      zone_id: 'zone-oldcity'
    },
    {
      id: 'attr-2',
      name: 'Golconda Fort & Citadel',
      category: 'Heritage',
      lat: 17.3833,
      lng: 78.4011,
      open_status: true,
      opening_hours: '09:00 - 17:30',
      current_crowd: 88, // High
      capacity: 4000,
      is_indoor: false,
      ticket_price_inr: 30,
      description: 'Massive acoustic medieval fortress; Main Fort Road currently has +25m bottleneck.',
      zone_id: 'zone-golconda'
    },
    {
      id: 'attr-3',
      name: 'Salar Jung National Museum',
      category: 'Museum',
      lat: 17.3713,
      lng: 78.4804,
      open_status: true,
      opening_hours: '10:00 - 17:00',
      current_crowd: 25, // Low
      capacity: 2800,
      is_indoor: true,
      ticket_price_inr: 50,
      description: 'World-renowned indoor art museum with rare clocks; optimal for sunny or rainy weather.',
      zone_id: 'zone-arts'
    },
    {
      id: 'attr-9',
      name: 'Sunset Lake Park',
      category: 'Nature',
      lat: 17.4350,
      lng: 78.4620,
      open_status: false,
      opening_hours: 'Closed',
      current_crowd: 0,
      capacity: 2000,
      is_indoor: false,
      ticket_price_inr: 20,
      description: 'Outdoor waterfront park temporarily closed due to storm alert and high wind warnings.',
      zone_id: 'zone-lakefront'
    },
    {
      id: 'attr-4',
      name: 'Chowmahalla Palace',
      category: 'Heritage',
      lat: 17.3578,
      lng: 78.4717,
      open_status: true,
      opening_hours: '10:00 - 17:00',
      current_crowd: 42, // Low
      capacity: 2000,
      is_indoor: true,
      ticket_price_inr: 100,
      description: 'Opulent palace complex with grand chandeliers, vintage cars, and shaded courtyards.',
      zone_id: 'zone-oldcity'
    },
    {
      id: 'attr-5',
      name: 'Birla Science Centre & Planetarium',
      category: 'Museum',
      lat: 17.4042,
      lng: 78.4716,
      open_status: true,
      opening_hours: '10:30 - 20:00',
      current_crowd: 28, // Low
      capacity: 1500,
      is_indoor: true,
      ticket_price_inr: 120,
      description: 'Modern indoor interactive science galleries and planetarium dome on scenic hill.',
      zone_id: 'zone-central'
    },
    {
      id: 'attr-6',
      name: 'Hussain Sagar Lakefront & Buddha Pavilion',
      category: 'Nature',
      lat: 17.4239,
      lng: 78.4738,
      open_status: true,
      opening_hours: '08:00 - 22:00',
      current_crowd: 48, // Low-Medium
      capacity: 5000,
      is_indoor: false,
      ticket_price_inr: 50,
      description: 'Expansive promenade, speed boat transfers to monolithic statue, and open gardens.',
      zone_id: 'zone-lakefront'
    },
    {
      id: 'attr-7',
      name: 'Shilparamam Arts & Crafts Village',
      category: 'Cultural',
      lat: 17.4518,
      lng: 78.3773,
      open_status: true,
      opening_hours: '10:30 - 20:30',
      current_crowd: 38, // Low
      capacity: 3000,
      is_indoor: false,
      ticket_price_inr: 60,
      description: 'Rural ethnic village atmosphere with authentic artisan demonstrations and folk theater.',
      zone_id: 'zone-hitec'
    },
    {
      id: 'attr-8',
      name: 'Qutb Shahi Heritage Necropolis',
      category: 'Heritage',
      lat: 17.3948,
      lng: 78.3976,
      open_status: true,
      opening_hours: '09:30 - 16:30',
      current_crowd: 22, // Low
      capacity: 2500,
      is_indoor: false,
      ticket_price_inr: 40,
      description: 'Serene restored garden tombs surrounded by landscaped orchard avenues.',
      zone_id: 'zone-golconda'
    }
  ],
  events: [
    {
      id: 'ev-1',
      title: 'Deccan Heritage Acoustic Light Show',
      venue: 'Golconda Fort Upper Citadel',
      time: '18:30 - 20:00',
      crowd_surge_expected: 1200,
      entry_fee: '₹140',
      status: 'STARTING_SOON'
    },
    {
      id: 'ev-2',
      title: 'Monsoon Crafts & Handloom Expo',
      venue: 'Shilparamam Open Amphitheater',
      time: '11:00 - 21:00',
      crowd_surge_expected: 1800,
      entry_fee: 'Free with venue ticket',
      status: 'ACTIVE_NOW'
    },
    {
      id: 'ev-3',
      title: 'Nizam Culinary Street Food Evening',
      venue: 'Laad Bazaar Historic Plaza',
      time: '17:00 - 23:00',
      crowd_surge_expected: 2500,
      entry_fee: 'Free Admission',
      status: 'SCHEDULED'
    }
  ],
  budget_hotels: [
    {
      id: 'hotel-1',
      name: 'Deccan Heritage Residency',
      zone: 'Arts & Museum Quarter (Musi Riverfront)',
      nightly_rate_inr: 1650,
      rating: 4.4,
      available_rooms: 7,
      proximity_to_low_crowd_hubs: '0.4 km from Salar Jung Museum & Metro'
    },
    {
      id: 'hotel-2',
      name: 'CityHub Executive Micro-Pods',
      zone: 'City Center (Near Business & Meeting Hubs)',
      nightly_rate_inr: 1199,
      rating: 4.5,
      available_rooms: 11,
      proximity_to_low_crowd_hubs: 'City Center, near corporate meeting hubs & State Museum'
    },
    {
      id: 'hotel-5',
      name: 'Heritage Grand Stay',
      zone: 'Financial District & Heritage Gate',
      nightly_rate_inr: 3500,
      rating: 4.8,
      available_rooms: 5,
      proximity_to_low_crowd_hubs: 'Luxury business conference suites, 15 min to airport bypass'
    },
    {
      id: 'hotel-3',
      name: 'Lake Breeze Comfort Inn',
      zone: 'Hussain Sagar Promenade',
      nightly_rate_inr: 1890,
      rating: 4.2,
      available_rooms: 4,
      proximity_to_low_crowd_hubs: '0.3 km from Lakefront Ferry point'
    },
    {
      id: 'hotel-4',
      name: 'Citadel Gate Travelers Lodge',
      zone: 'Golconda North Bypass Enclave',
      nightly_rate_inr: 1450,
      rating: 4.1,
      available_rooms: 6,
      proximity_to_low_crowd_hubs: '0.8 km from Qutb Shahi Tombs (Clear detour route)'
    }
  ]
};

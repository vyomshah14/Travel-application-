export interface WeatherSummary {
  temperature: string;
  condition: string;
  packingSuggestion: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Attraction {
  name: string;
  benefit: string;
  coordinates: Coordinates;
}

export interface ItineraryActivity {
  time: string;
  activity: string;
}

export interface DailyItinerary {
  day: number;
  theme: string;
  activities: ItineraryActivity[];
}

export interface LocalTip {
  category: string;
  tip: string;
}

export interface CityGuideData {
  city: string;
  country: string;
  coordinates: Coordinates;
  introduction: string;
  weather: WeatherSummary;
  attractions: Attraction[];
  mapContext: string;
  itinerary: DailyItinerary[];
  localTips: LocalTip[];
  imageUrl?: string;
  gallery?: string[];
}

export interface FormState {
  city: string;
  country: string;
  duration: string;
}

// types/api.ts
export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  aqi: number;
  lastUpdated: string;
}

export interface PollutantReading {
  PM25: number;
  PM10: number;
  NO2: number;
  CO: number;
  SO2: number;
  O3: number;
}

export interface AirQualityData {
  stationId: string;
  timestamp: string;
  aqi: number;
  pollutants: PollutantReading;
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
  };
}

export interface HealthRisk {
  level: string;
  description: string;
  recommendations: string[];
  affectedGroups: string[];
  alertLevel: string;
  alertDescription: string;
  alertColor: string;
}
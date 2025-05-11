// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const api = {
  baseUrl: API_BASE_URL,
  endpoints: {
    stations: '/stations',
    stationDetails: (id: string) => `/stations/${id}`,
    currentReadings: '/air-quality/current',
    historicalData: '/air-quality/historical',
    healthRecommendations: '/health/recommendations',
    alerts: '/alerts',
  }
};
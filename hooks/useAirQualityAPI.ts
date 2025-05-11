// hooks/useAirQualityAPI.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useStations() {
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const response = await fetch(api.baseUrl + api.endpoints.stations);
      if (!response.ok) throw new Error('Failed to fetch stations');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useStationData(stationId: string) {
  return useQuery({
    queryKey: ['station', stationId],
    queryFn: async () => {
      const response = await fetch(api.baseUrl + api.endpoints.stationDetails(stationId));
      if (!response.ok) throw new Error('Failed to fetch station data');
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    enabled: !!stationId,
  });
}

export function useCurrentAirQuality(lat: number, lng: number) {
  return useQuery({
    queryKey: ['airQuality', lat, lng],
    queryFn: async () => {
      const response = await fetch(
        `${api.baseUrl}${api.endpoints.currentReadings}?lat=${lat}&lng=${lng}`
      );
      if (!response.ok) throw new Error('Failed to fetch air quality data');
      return response.json();
    },
    refetchInterval: 10000,
    enabled: !!(lat && lng),
  });
}

export function useHistoricalData(stationId: string, timeRange: string) {
  return useQuery({
    queryKey: ['historical', stationId, timeRange],
    queryFn: async () => {
      const response = await fetch(
        `${api.baseUrl}${api.endpoints.historicalData}?stationId=${stationId}&range=${timeRange}`
      );
      if (!response.ok) throw new Error('Failed to fetch historical data');
      return response.json();
    },
    enabled: !!stationId,
  });
}

export function useHealthRecommendations(aqi: number) {
  return useQuery({
    queryKey: ['health', aqi],
    queryFn: async () => {
      const response = await fetch(
        `${api.baseUrl}${api.endpoints.healthRecommendations}?aqi=${aqi}`
      );
      if (!response.ok) throw new Error('Failed to fetch health recommendations');
      return response.json();
    },
    enabled: !!aqi,
  });
}
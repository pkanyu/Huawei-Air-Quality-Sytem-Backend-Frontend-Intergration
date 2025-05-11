'use client';

import { useAirQuality } from '@/context/AirQualityContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Wind } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-muted animate-pulse rounded-lg"></div>
  ),
});

export default function MapPage() {
  const { 
    stations, 
    selectedStation,
    setSelectedStation,
    weatherData,
    userLocation,
    currentAQI,
    stationPollutants,
    isLoading
  } = useAirQuality();
  
  // Local state to force updates when context changes
  const [localSelectedStation, setLocalSelectedStation] = useState(null);

  // Update local state when either context changes
  useEffect(() => {
    if (selectedStation) {
      // Find the current version of the selected station in the stations array
      const updatedStation = stations.find(s => s.id === selectedStation.id);
      if (updatedStation) {
        setLocalSelectedStation(updatedStation);
      }
    } else if (stations.length > 0) {
      setSelectedStation(stations[0]);
      setLocalSelectedStation(stations[0]);
    }
  }, [stations, selectedStation, setSelectedStation, currentAQI]);

  // Handle station selection
  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setLocalSelectedStation(station);
  };

  // If selected station is null or loading, show a loading state
  if (!localSelectedStation || isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Air Quality Map</h1>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="w-full h-[600px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
                  Loading map...
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardHeader>
                <CardTitle className="h-6 bg-muted rounded"></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Function to get the status color based on AQI
  const getStatusColor = (aqi) => {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-600';
    if (aqi <= 150) return 'text-orange-500';
    if (aqi <= 200) return 'text-red-500';
    if (aqi <= 300) return 'text-purple-800';
    return 'text-red-900';
  };

  // Function to get the status text based on AQI
  const getStatusText = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Air Quality Map</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              <MapComponent 
                stations={stations}
                selectedStation={localSelectedStation}
                onStationSelect={handleStationSelect}
                centerLat={userLocation.lat}
                centerLng={userLocation.lng}
                zoom={13}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Selected Station
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold">{localSelectedStation.name}</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Air Quality Index</span>
                  <span className="font-medium">{localSelectedStation.aqi}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${getStatusColor(localSelectedStation.aqi)}`}>
                    {getStatusText(localSelectedStation.aqi)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">PM2.5</span>
                  <span className="font-medium">{stationPollutants.PM25} µg/m³</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">PM10</span>
                  <span className="font-medium">{stationPollutants.PM10} µg/m³</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">NO₂</span>
                  <span className="font-medium">{stationPollutants.NO2} ppb</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">CO</span>
                  <span className="font-medium">{stationPollutants.CO} ppm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">SO₂</span>
                  <span className="font-medium">{stationPollutants.SO2} ppb</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-5 w-5" />
                Weather Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Temperature</span>
                  <span className="font-medium">{weatherData.temperature}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Humidity</span>
                  <span className="font-medium">{weatherData.humidity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Wind Speed</span>
                  <span className="font-medium">{weatherData.windSpeed}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
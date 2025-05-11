"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useStations,
  useCurrentAirQuality,
  useHistoricalData,
  useHealthRecommendations,
} from "@/hooks/useAirQualityAPI";
import { useAirQualitySocket } from "@/hooks/useAirQualitySocket";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      retry: 1,
    },
  },
});

// AQI levels for data classification
const AQI_LEVELS = [
  { level: "Good", range: [0, 50], color: "green-500" },
  { level: "Moderate", range: [51, 100], color: "yellow-600" },
  {
    level: "Unhealthy for Sensitive Groups",
    range: [101, 150],
    color: "orange-500",
  },
  { level: "Unhealthy", range: [151, 200], color: "red-500" },
  { level: "Very Unhealthy", range: [201, 300], color: "purple-800" },
  { level: "Hazardous", range: [301, 500], color: "red-900" },
];

// Health risk data for different air quality levels
const HEALTH_RISKS = {
  good: {
    level: "Low Risk",
    description:
      "Air quality is considered satisfactory, and air pollution poses little or no risk.",
    recommendations: [
      "Enjoy outdoor activities as usual",
      "Keep windows open for fresh air",
      "Monitor local air quality updates",
      "Be prepared for seasonal changes in air quality",
    ],
    affectedGroups: ["Generally safe for all groups"],
    alertLevel: "Low",
    alertDescription: "Air quality is good and poses little to no health risk.",
    alertColor: "green-500",
  },
  moderate: {
    level: "Moderate Risk",
    description:
      "Some individuals may experience health effects, particularly those who are unusually sensitive to air pollution.",
    recommendations: [
      "Reduce prolonged outdoor activities if you experience symptoms",
      "Keep windows closed during peak pollution hours",
      "Monitor symptoms if you have respiratory conditions",
      "Stay hydrated and take regular breaks during outdoor activities",
    ],
    affectedGroups: [
      "Sensitive individuals",
      "People with respiratory conditions",
      "Active adults",
    ],
    alertLevel: "Moderate",
    alertDescription:
      "Air quality may pose risks for sensitive groups. Take necessary precautions.",
    alertColor: "yellow-600",
  },
  unhealthySensitive: {
    level: "Elevated Risk",
    description:
      "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
    recommendations: [
      "Sensitive groups should reduce prolonged or heavy exertion outdoors",
      "Take more breaks during outdoor activities",
      "Consider moving longer or more intense activities indoors",
      "Keep respiratory medication readily available",
    ],
    affectedGroups: [
      "Children",
      "Elderly",
      "People with heart or lung disease",
      "Pregnant women",
    ],
    alertLevel: "Elevated",
    alertDescription:
      "Air quality is unhealthy for sensitive groups. Limit prolonged outdoor exposure.",
    alertColor: "orange-500",
  },
  unhealthy: {
    level: "High Risk",
    description:
      "Everyone may begin to experience health effects. Members of sensitive groups may experience more serious health effects.",
    recommendations: [
      "Reduce prolonged or heavy exertion outdoors",
      "Move activities indoors or reschedule to times when air quality is better",
      "Use air purifiers indoors if available",
      "Wear N95 masks outdoors if necessary",
    ],
    affectedGroups: [
      "Everyone, especially children",
      "Elderly",
      "People with respiratory and heart conditions",
      "Outdoor workers",
    ],
    alertLevel: "High",
    alertDescription:
      "Air quality is unhealthy. Everyone should reduce outdoor exposure, especially sensitive groups.",
    alertColor: "red-500",
  },
  veryUnhealthy: {
    level: "Very High Risk",
    description:
      "Health alert: everyone may experience more serious health effects.",
    recommendations: [
      "Avoid all outdoor physical activities",
      "Stay indoors with windows closed",
      "Run air purifiers if available",
      "Wear N95 masks if outdoor activity is unavoidable",
      "Seek medical attention if experiencing respiratory symptoms",
    ],
    affectedGroups: [
      "Everyone, with serious effects for all sensitive groups",
      "Schools should consider canceling outdoor activities",
      "Work-from-home recommended if possible",
    ],
    alertLevel: "Very High",
    alertDescription:
      "Health alert: Current air quality levels may cause significant health effects for everyone.",
    alertColor: "purple-800",
  },
  hazardous: {
    level: "Severe Risk",
    description:
      "Health warning of emergency conditions: everyone is more likely to be affected.",
    recommendations: [
      "Stay indoors with windows and doors closed",
      "Use air purifiers continuously",
      "Seal windows and doors if possible",
      "Avoid any outdoor activities",
      "Wear N95 masks even indoors if air quality is poor",
      "Seek immediate medical help for respiratory symptoms",
    ],
    affectedGroups: [
      "Entire population at risk",
      "Evacuation may be necessary for sensitive groups",
      "Schools and workplaces should consider closure",
    ],
    alertLevel: "Severe",
    alertDescription:
      "EMERGENCY CONDITIONS: Hazardous air quality poses serious risk to the entire population.",
    alertColor: "red-900",
  },
};

const AirQualityContext = createContext();

function AirQualityProviderInner({ children }) {
  const [userLocation, setUserLocation] = useState({
    lat: -1.2741, // Default to Lavington, Kenya
    lng: 36.7615,
    hasPermission: false,
    isLoading: true,
  });

  const [selectedStation, setSelectedStation] = useState(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            hasPermission: true,
            isLoading: false,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation((prev) => ({
            ...prev,
            hasPermission: false,
            isLoading: false,
          }));
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  // Fetch data using React Query hooks
  const {
    data: stationsData = [],
    isLoading: stationsLoading,
    error: stationsError,
  } = useStations();

  // Transform stations to use lat/lng for compatibility with existing components
  const stations = stationsData.map((station) => ({
    ...station,
    lat: station.latitude,
    lng: station.longitude,
  }));

  const {
    data: currentData,
    isLoading: currentLoading,
    error: currentError,
  } = useCurrentAirQuality(userLocation.lat, userLocation.lng);

  const { data: historicalData = [], isLoading: historicalLoading } =
    useHistoricalData(selectedStation?.id || "", "24h");

  const { data: healthData, isLoading: healthLoading } =
    useHealthRecommendations(currentData?.aqi || 0);

  // WebSocket for real-time updates
  const { lastUpdate, isConnected } = useAirQualitySocket(selectedStation?.id);

  // Merge real-time updates with current data
  const mergedCurrentData = lastUpdate || currentData;

  // Auto-select first station
  useEffect(() => {
    if (stations.length > 0 && !selectedStation) {
      setSelectedStation(stations[0]);
    }
  }, [stations, selectedStation]);

  // Helper function to get AQI level information
  const getAQILevel = (value) => {
    const level = AQI_LEVELS.find(
      (level) => value >= level.range[0] && value <= level.range[1]
    );
    return level || AQI_LEVELS[5]; // Default to hazardous if out of range
  };

  // Function to get risk key based on AQI level
  const getRiskKey = (aqiLevel) => {
    switch (aqiLevel) {
      case "Good":
        return "good";
      case "Moderate":
        return "moderate";
      case "Unhealthy for Sensitive Groups":
        return "unhealthySensitive";
      case "Unhealthy":
        return "unhealthy";
      case "Very Unhealthy":
        return "veryUnhealthy";
      case "Hazardous":
        return "hazardous";
      default:
        return "good";
    }
  };

  // Calculate current AQI display
  const currentAQIValue = mergedCurrentData?.aqi || 0;
  const aqiLevel = getAQILevel(currentAQIValue);
  const riskKey = getRiskKey(aqiLevel.level);

  const currentAQI = {
    value: currentAQIValue,
    level: aqiLevel.level,
    color: aqiLevel.color,
    riskKey: riskKey,
  };

  // Format pollutant levels for dashboard display
  const pollutantLevels = mergedCurrentData?.pollutants
    ? [
        {
          name: "PM2.5",
          value: `${mergedCurrentData.pollutants.PM25} µg/m³`,
          status: getPollutantStatus("PM25", mergedCurrentData.pollutants.PM25),
          color: "chart-1",
        },
        {
          name: "PM10",
          value: `${mergedCurrentData.pollutants.PM10} µg/m³`,
          status: getPollutantStatus("PM10", mergedCurrentData.pollutants.PM10),
          color: "chart-2",
        },
        {
          name: "CO",
          value: `${mergedCurrentData.pollutants.CO} ppm`,
          status: getPollutantStatus("CO", mergedCurrentData.pollutants.CO),
          color: "chart-3",
        },
        {
          name: "O₃",
          value: `${mergedCurrentData.pollutants.O3} ppm`,
          status: getPollutantStatus("O3", mergedCurrentData.pollutants.O3),
          color: "chart-4",
        },
      ]
    : [];

  // Format chart data for display
  const chartData = historicalData.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    PM25: item.pollutants?.PM25 || 0,
    PM10: item.pollutants?.PM10 || 0,
    CO: item.pollutants?.CO || 0,
    O3: item.pollutants?.O3 || 0,
  }));

  // Format weather data
  const weatherData = mergedCurrentData?.weather
    ? {
        temperature: `${Math.round(mergedCurrentData.weather.temperature)}°C`,
        humidity: `${Math.round(mergedCurrentData.weather.humidity)}%`,
        windSpeed: `${Math.round(mergedCurrentData.weather.windSpeed)} km/h`,
      }
    : {
        temperature: "--°C",
        humidity: "--%",
        windSpeed: "-- km/h",
      };

  // Format health risks data
  const currentRisk =
    healthData?.current || HEALTH_RISKS[riskKey] || HEALTH_RISKS.good;
  const visibleRisks = healthData?.risks || [
    HEALTH_RISKS.good,
    HEALTH_RISKS.moderate,
    HEALTH_RISKS.unhealthySensitive,
  ];

  const currentHealthRisks = {
    current: currentRisk,
    visibleRisks: visibleRisks,
  };

  const isLoading = stationsLoading || currentLoading || healthLoading;
  const error = stationsError || currentError;

  // Station pollutants for the selected station
  const stationPollutants =
    selectedStation && mergedCurrentData
      ? mergedCurrentData.pollutants
      : {
          PM25: 0,
          PM10: 0,
          NO2: 0,
          CO: 0,
          SO2: 0,
        };

  const value = {
    userLocation,
    currentAQI,
    stationPollutants,
    pollutantLevels,
    chartData,
    currentHealthRisks,
    stations,
    selectedStation,
    setSelectedStation,
    weatherData,
    getAQILevel,
    AQI_LEVELS,
    HEALTH_RISKS,
    isLoading,
    error,
    isConnected,
  };

  return (
    <AirQualityContext.Provider value={value}>
      {children}
    </AirQualityContext.Provider>
  );
}

export function AirQualityProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AirQualityProviderInner>{children}</AirQualityProviderInner>
    </QueryClientProvider>
  );
}

export function useAirQuality() {
  const context = useContext(AirQualityContext);
  if (context === undefined) {
    throw new Error("useAirQuality must be used within an AirQualityProvider");
  }
  return context;
}

// Helper function to determine pollutant status
function getPollutantStatus(pollutant, value) {
  // These thresholds are examples - adjust based on your requirements
  const thresholds = {
    PM25: { good: 12, moderate: 35, unhealthy: 55 },
    PM10: { good: 54, moderate: 154, unhealthy: 254 },
    CO: { good: 4.4, moderate: 9.4, unhealthy: 12.4 },
    O3: { good: 0.054, moderate: 0.07, unhealthy: 0.085 },
  };

  const threshold = thresholds[pollutant];
  if (!threshold) return "Unknown";

  if (value <= threshold.good) return "Good";
  if (value <= threshold.moderate) return "Moderate";
  if (value <= threshold.unhealthy) return "Unhealthy for Sensitive Groups";
  return "Unhealthy";
}

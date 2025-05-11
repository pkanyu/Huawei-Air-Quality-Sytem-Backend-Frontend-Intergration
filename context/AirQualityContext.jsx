"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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

// Create the context
const AirQualityContext = createContext();

export function AirQualityProvider({ children }) {
  // State for user location
  const [userLocation, setUserLocation] = useState({
    lat: -1.2741, // Default to Lavington, Kenya
    lng: 36.7615,
    hasPermission: false,
    isLoading: true,
  });

  // State for current AQI value
  const [currentAQI, setCurrentAQI] = useState({
    value: 30,
    level: "Good",
    riskKey: "good",
    color: "green-500",
  });

  // State for station-specific pollutant data
  const [stationPollutants, setStationPollutants] = useState({
    PM25: 20,
    PM10: 30,
    NO2: 0.5,
    CO: 0.04,
    SO2: 0.8,
  });

  // State for pollutant values (for dashboard cards)
  const [pollutantLevels, setPollutantLevels] = useState([
    { name: "PM2.5", value: 20, status: "Good", color: "chart-1" },
    { name: "PM10", value: 30, status: "Good", color: "chart-2" },
    { name: "CO", value: 0.04, status: "Good", color: "chart-3" },
    { name: "O₃", value: 0.05, status: "Good", color: "chart-4" },
  ]);

  // State for chart data
  const [chartData, setChartData] = useState([
    { time: "12:00", PM25: 25, PM10: 35, CO: 0.4, O3: 0.05 },
    { time: "14:00", PM25: 22, PM10: 33, CO: 0.3, O3: 0.04 },
    { time: "16:00", PM25: 27, PM10: 38, CO: 0.5, O3: 0.06 },
    { time: "18:00", PM25: 30, PM10: 40, CO: 0.6, O3: 0.07 },
    { time: "20:00", PM25: 28, PM10: 36, CO: 0.5, O3: 0.06 },
    { time: "22:00", PM25: 24, PM10: 32, CO: 0.4, O3: 0.05 },
  ]);

  // State for health risks
  const [currentHealthRisks, setCurrentHealthRisks] = useState({
    current: HEALTH_RISKS.good,
    visibleRisks: [
      HEALTH_RISKS.good,
      HEALTH_RISKS.moderate,
      HEALTH_RISKS.unhealthySensitive,
    ],
  });

  // State for map stations
  const [stations, setStations] = useState([
    {
      id: 1,
      name: "Lavington Station (Huawei Offices)",
      lat: -1.2741,
      lng: 36.7615,
      aqi: 30,
    },
    { id: 2, name: "Kilimani Station", lat: -1.2864, lng: 36.7889, aqi: 42 },
    { id: 3, name: "Westlands Station", lat: -1.265, lng: 36.7962, aqi: 55 },
  ]);

  const [selectedStation, setSelectedStation] = useState(null);

  // Weather data
  const [weatherData, setWeatherData] = useState({
    temperature: "24°C",
    humidity: "65%",
    windSpeed: "12 km/h",
  });

  // Function to get AQI level information based on value
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

  // Request user location on initial load
  useEffect(() => {
    const requestLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              hasPermission: true,
              isLoading: false,
            });

            // Update the first station to user's location
            setStations((prev) => [
              {
                ...prev[0],
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              ...prev.slice(1),
            ]);

            if (!selectedStation) {
              setSelectedStation(stations[0]);
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            setUserLocation((prev) => ({
              ...prev,
              hasPermission: false,
              isLoading: false,
            }));

            if (!selectedStation) {
              setSelectedStation(stations[0]);
            }
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        setUserLocation((prev) => ({
          ...prev,
          hasPermission: false,
          isLoading: false,
        }));

        if (!selectedStation) {
          setSelectedStation(stations[0]);
        }
      }
    };

    requestLocation();
  }, []);

  // Generate dynamic and visually interesting but realistic values for chart data
  const generateChartData = (aqi) => {
    // Base scale factor based on current AQI
    const scaleFactor = aqi / 50; // Good AQI is around 50

    // Create realistic fluctuations throughout the day
    const timeSlots = ["12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];

    // Generate pattern with morning-evening variations
    // 'Peak' pollution typically occurs during rush hours or midday
    const patterns = [
      0.8, // 12:00 - moderate
      0.7, // 14:00 - slightly lower
      0.9, // 16:00 - rising (afternoon rush)
      1.0, // 18:00 - peak (evening rush)
      0.85, // 20:00 - falling
      0.75, // 22:00 - lower (night)
    ];

    // Generate chart data with these patterns, adding some randomness
    return timeSlots.map((time, index) => {
      const patternFactor = patterns[index];
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9-1.1 random variation

      // Calculate realistic values
      // PM2.5 typically ranges from 0-500 μg/m³ for AQI calculation
      const pm25Base = Math.min(aqi * 0.6, 500);
      const pm25 = Math.round(pm25Base * patternFactor * randomFactor);

      // PM10 typically ranges from 0-600 μg/m³ for AQI calculation
      const pm10Base = Math.min(aqi * 0.8, 600);
      const pm10 = Math.round(pm10Base * patternFactor * randomFactor);

      // CO typically ranges from 0-50 ppm for AQI calculation
      const coBase = Math.min(aqi * 0.01, 50);
      const co = +(coBase * patternFactor * randomFactor).toFixed(2);

      // O3 typically ranges from 0-0.6 ppm for AQI calculation
      const o3Base = Math.min(aqi * 0.0002, 0.6);
      const o3 = +(o3Base * patternFactor * randomFactor).toFixed(2);

      return {
        time,
        PM25: pm25,
        PM10: pm10,
        CO: co,
        O3: o3,
      };
    });
  };

  // Simulate data changes
  useEffect(() => {
    // This array defines the sequence of AQI values to cycle through
    const aqiSequence = [
      30, // Good
      75, // Moderate
      125, // Unhealthy for Sensitive Groups
      175, // Unhealthy
      250, // Very Unhealthy
      350, // Hazardous
      250, // Very Unhealthy (going back down)
      175, // Unhealthy
      125, // Unhealthy for Sensitive Groups
      75, // Moderate
      30, // Good
    ];

      let sequenceIndex = 0;
       if (selectedStation) {
         const updatedStations = stations.map((station) => {
           if (station.id === selectedStation.id) {
             // Make sure the main station (Lavington) always matches currentAQI
             if (station.id === 1) {
               return {
                 ...station,
                 aqi: currentAQI.value,
               };
             }
           }
           return station;
         });

         // Update stations if there were changes
         if (JSON.stringify(updatedStations) !== JSON.stringify(stations)) {
           setStations(updatedStations);
         }
       }

    const interval = setInterval(() => {
      // Get the next AQI value in sequence
      const nextAQI = aqiSequence[sequenceIndex];
      sequenceIndex = (sequenceIndex + 1) % aqiSequence.length;

      // Get the AQI level info for this value
      const levelInfo = getAQILevel(nextAQI);
      const riskKey = getRiskKey(levelInfo.level);

      // Update the current AQI state
      setCurrentAQI({
        value: nextAQI,
        level: levelInfo.level,
        riskKey: riskKey,
        color: levelInfo.color,
      });

      // Update health risks
      const currentRisk = HEALTH_RISKS[riskKey];

      // Calculate which risk levels to show (current plus adjacent levels)
      const riskKeys = Object.keys(HEALTH_RISKS);
      const currentIndex = riskKeys.indexOf(riskKey);

      const visibleRisks = [];

      // Add the level below current (if exists)
      if (currentIndex > 0) {
        visibleRisks.push(HEALTH_RISKS[riskKeys[currentIndex - 1]]);
      }

      // Add current level
      visibleRisks.push(currentRisk);

      // Add the level above current (if exists)
      if (currentIndex < riskKeys.length - 1) {
        visibleRisks.push(HEALTH_RISKS[riskKeys[currentIndex + 1]]);
      }

      setCurrentHealthRisks({
        current: currentRisk,
        visibleRisks: visibleRisks,
      });

      // Generate new pollutant values based on AQI
      // Calculate scale factor for the current AQI relative to moderate level (75)
      const scaleFactor = nextAQI / 75;

      // Set reasonable bounds for pollutant values
      const getBoundedValue = (baseValue, scaleFactor) => {
        // Apply the scale factor but keep values within reasonable ranges
        const calculatedValue = baseValue * scaleFactor;

        // Return reasonable values - never extremely large numbers
        return Math.min(calculatedValue, baseValue * 10);
      };

      // Update station-specific pollutant data
      const newStationPollutants = {
        PM25: Math.round(getBoundedValue(20, scaleFactor)),
        PM10: Math.round(getBoundedValue(30, scaleFactor)),
        NO2: +getBoundedValue(0.5, scaleFactor).toFixed(1),
        CO: +getBoundedValue(0.04, scaleFactor).toFixed(2),
        SO2: +getBoundedValue(0.8, scaleFactor).toFixed(1),
      };

      setStationPollutants(newStationPollutants);

      // Update pollutant levels based on new AQI - with sensible values
      setPollutantLevels((prev) =>
        prev.map((pollutant) => {
          let newValue;

          // Set reasonable value ranges for each pollutant
          if (pollutant.name === "PM2.5") {
            newValue = newStationPollutants.PM25;
          } else if (pollutant.name === "PM10") {
            newValue = newStationPollutants.PM10;
          } else if (pollutant.name === "CO") {
            newValue = newStationPollutants.CO;
          } else {
            // O3
            newValue = +getBoundedValue(0.05, scaleFactor).toFixed(2);
          }

          const status = getAQILevel(
            pollutant.name === "PM2.5"
              ? newValue * 2
              : pollutant.name === "PM10"
              ? newValue
              : pollutant.name === "CO"
              ? newValue * 100
              : newValue * 1000
          ).level;

          return {
            ...pollutant,
            value: newValue,
            status,
          };
        })
      );

      // Update chart data with dynamic values
      setChartData(generateChartData(nextAQI));

      // Update station AQI values
      setStations((prev) => {
        const mainStationAQI = nextAQI;
        // Other stations have slightly different values but follow the same trend
        return prev.map((station, index) => ({
          ...station,
          aqi:
            index === 0
              ? mainStationAQI
              : Math.round(
                  mainStationAQI * (0.8 + index * 0.1 + Math.random() * 0.2)
                ),
        }));
      });

      // Update weather data randomly
      setWeatherData({
        temperature: `${Math.floor(22 + Math.random() * 6)}°C`,
        humidity: `${Math.floor(60 + Math.random() * 15)}%`,
        windSpeed: `${Math.floor(8 + Math.random() * 10)} km/h`,
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Automatically select the first station when stations are updated
  useEffect(() => {
    if (stations.length > 0 && !selectedStation) {
      setSelectedStation(stations[0]);
    }
  }, [stations, selectedStation]);

  // Context value
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
  };

  return (
    <AirQualityContext.Provider value={value}>
      {children}
    </AirQualityContext.Provider>
  );
}

// Custom hook to use the context
export function useAirQuality() {
  const context = useContext(AirQualityContext);
  if (context === undefined) {
    throw new Error("useAirQuality must be used within an AirQualityProvider");
  }
  return context;
}

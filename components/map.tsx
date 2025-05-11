'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAirQuality } from '@/context/AirQualityContext';

// Fix Leaflet icon issue
const fixLeafletIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

const getAqiColor = (aqi) => {
  if (aqi <= 50) return '#00e400'; // Good
  if (aqi <= 100) return '#ffff00'; // Moderate
  if (aqi <= 150) return '#ff7e00'; // Unhealthy for Sensitive Groups
  if (aqi <= 200) return '#ff0000'; // Unhealthy
  if (aqi <= 300) return '#99004c'; // Very Unhealthy
  return '#7e0023'; // Hazardous
};

const getAqiStatus = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

const MapComponent = ({ 
  stations, 
  selectedStation, 
  onStationSelect,
  centerLat = -1.2741, 
  centerLng = 36.7615,
  zoom = 13
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const popupsRef = useRef({});
  const { stationPollutants } = useAirQuality();

  useEffect(() => {
    if (!L) return;
    fixLeafletIcon();

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map('map').setView([centerLat, centerLng], zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    } else {
      // Update view if coordinates change
      mapInstanceRef.current.setView([centerLat, centerLng], zoom);
    }

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    markersRef.current = {};

    // Create new markers for each station
    stations.forEach(station => {
      const markerIcon = new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Create custom HTML content for marker
      const markerHtml = `
        <div class="custom-marker" style="width: 24px; height: 24px; background-color: ${getAqiColor(station.aqi)}; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
        </div>
      `;
      
      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-marker-container',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Use latitude and longitude properties
      const lat = station.latitude || station.lat;
      const lng = station.longitude || station.lng;
      
      if (lat && lng) {
        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .on('click', () => {
            onStationSelect(station);
          });

        // Create popup content with station info
        const popupContent = L.popup().setContent(createPopupContent(station));
        popupsRef.current[station.id] = popupContent;
        marker.bindPopup(popupContent);
        markersRef.current[station.id] = marker;
      }
    });

    // Open popup for selected station
    if (selectedStation && markersRef.current[selectedStation.id]) {
      markersRef.current[selectedStation.id].openPopup();
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        // Don't destroy the map, just clean up markers
        Object.values(markersRef.current).forEach(marker => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(marker);
          }
        });
      }
    };
  }, [stations, centerLat, centerLng, zoom, onStationSelect]);

  // Update markers and popups when selectedStation or stationPollutants changes
  useEffect(() => {
    // Update all station popups with fresh data
    stations.forEach(station => {
      if (popupsRef.current[station.id] && markersRef.current[station.id]) {
        popupsRef.current[station.id].setContent(createPopupContent(station));
        
        // Update marker color based on AQI
        const markerElement = markersRef.current[station.id].getElement();
        if (markerElement) {
          const markerDiv = markerElement.querySelector('.custom-marker');
          if (markerDiv) {
            markerDiv.style.backgroundColor = getAqiColor(station.aqi);
          }
        }
      }
    });
    
    // Open popup for selected station
    if (selectedStation && markersRef.current[selectedStation.id]) {
      markersRef.current[selectedStation.id].openPopup();
    }
  }, [selectedStation, stations, stationPollutants]);

  // Function to create popup content
  const createPopupContent = (station) => {
    return `
      <div style="min-width: 200px;">
        <h3 style="font-weight: bold; margin-bottom: 8px;">${station.name}</h3>
        <div style="margin-bottom: 4px;"><span style="font-weight: bold;">AQI:</span> ${station.aqi}</div>
        <div style="margin-bottom: 4px;"><span style="font-weight: bold;">Status:</span> <span style="color: ${getAqiColor(station.aqi)};">${getAqiStatus(station.aqi)}</span></div>
        <div style="margin-bottom: 4px;"><span style="font-weight: bold;">PM2.5:</span> ${stationPollutants.PM25} µg/m³</div>
        <div style="margin-bottom: 4px;"><span style="font-weight: bold;">PM10:</span> ${stationPollutants.PM10} µg/m³</div>
        <div style="margin-bottom: 4px;"><span style="font-weight: bold;">NO₂:</span> ${stationPollutants.NO2} ppb</div>
        <div style="margin-bottom: 4px;"><span style="font-weight: bold;">CO:</span> ${stationPollutants.CO} ppm</div>
        <div><span style="font-weight: bold;">SO₂:</span> ${stationPollutants.SO2} ppb</div>
      </div>
    `;
  };

  return <div id="map" className="w-full h-[600px] rounded-lg" />;
};

export default MapComponent;
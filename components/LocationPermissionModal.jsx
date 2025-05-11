"use client";

import React, { useState, useEffect } from "react";
import { MapPin, AlertCircle } from "lucide-react";

const LocationPermissionModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("pending");

  useEffect(() => {
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      setPermissionStatus("unsupported");
      return;
    }

    // Show modal with a slight delay after page load
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRequestPermission = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Permission granted
        setPermissionStatus("granted");
        setTimeout(() => setShowModal(false), 1500);
      },
      (error) => {
        // Permission denied
        setPermissionStatus("denied");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleDismiss = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="bg-blue-600 dark:bg-blue-800 p-4 text-white">
          <div className="flex items-center space-x-2">
            <MapPin className="h-6 w-6" />
            <h2 className="text-xl font-bold">Location Access</h2>
          </div>
        </div>

        <div className="p-6">
          {permissionStatus === "pending" && (
            <>
              <p className="mb-4 dark:text-gray-200">
                This air quality monitoring app works best with your location.
                Would you like to share your location to see air quality data
                near you?
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition dark:text-gray-200"
                >
                  Not Now
                </button>
                <button
                  onClick={handleRequestPermission}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition"
                >
                  Allow Location Access
                </button>
              </div>
            </>
          )}

          {permissionStatus === "granted" && (
            <div className="flex items-center justify-center flex-col text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-3">
                <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-green-600 dark:text-green-400 font-semibold">
                Location access granted!
              </p>
              <p className="mt-2 dark:text-gray-300">
                Loading air quality data for your location...
              </p>
            </div>
          )}

          {permissionStatus === "denied" && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
              <p className="font-semibold mb-2 dark:text-gray-200">
                Location access denied
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You can still use the app, but we'll show air quality data for
                the default location instead.
              </p>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition"
              >
                Continue to App
              </button>
            </div>
          )}

          {permissionStatus === "unsupported" && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <p className="font-semibold mb-2 dark:text-gray-200">
                Location not supported
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your browser doesn't support geolocation. We'll use the default
                location instead.
              </p>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition"
              >
                Continue to App
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;

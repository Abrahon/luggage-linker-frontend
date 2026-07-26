"use client";

import React, { useEffect, useState } from "react";
import { getTopRoutesApi, RouteItem } from "@/api/user.api";

export const TopRoutes = () => {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getTopRoutesApi();
        if (response.success && response.results) {
          setRoutes(response.results);
        } else {
          setRoutes([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch top routes:", err);
        setError(
          err?.response?.data?.detail ||
            err.message ||
            "An error occurred while loading top routes."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopRoutes();
  }, []);

  // Determine highest value to scale the progress bar correctly
  const maxValue = routes.length > 0 ? Math.max(...routes.map((r) => r.total_deliveries)) : 1;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Routes</h3>
        {isLoading && (
          <span className="text-xs text-gray-400 animate-pulse">Loading...</span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-100 rounded-full w-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded-md">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : routes.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">
          No route data available.
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((route, i) => {
            const routeLabel = `${route.package__pickup_city} → ${route.package__destination_city}`;
            const percentage = (route.total_deliveries / maxValue) * 100;

            return (
              <div key={i}>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-700 font-medium">
                    {routeLabel}
                  </span>
                  <span className="text-gray-500 font-semibold">
                    {route.total_deliveries}{" "}
                    {route.total_deliveries === 1 ? "delivery" : "deliveries"}
                  </span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
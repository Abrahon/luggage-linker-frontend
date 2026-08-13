export interface APIPackageItem {
  id: string;
  title: string;
  pickup_country?: string;
  pickup_city?: string;
  destination_country?: string;
  destination_city?: string;
  pickup_date?: string;
  latest_delivery_date?: string;
  reward_amount?: number;
  status: string;
  [key: string]: any;
}

export interface PublicTrip {
  id: string;
  from_country: string;
  from_city: string;
  to_country: string;
  to_city: string;
  departure_date: string;
  arrival_date: string;
  [key: string]: any;
}

const normalize = (value?: string): string =>
  value?.trim().toLowerCase() || "";

/**
 * Checks if a package matches a given trip's route, dates, and publication status.
 */
export const isPackageCompatibleWithTrip = (
  pkg: APIPackageItem,
  trip: PublicTrip
): boolean => {
  // 1. Status Check: Must be PUBLISHED
  if (pkg.status !== "PUBLISHED") {
    return false;
  }

  // 2. Route Match: Origin and Destination must match exactly (case-insensitive)
  const routeMatches =
    normalize(pkg.pickup_country) === normalize(trip.from_country) &&
    normalize(pkg.pickup_city) === normalize(trip.from_city) &&
    normalize(pkg.destination_country) === normalize(trip.to_country) &&
    normalize(pkg.destination_city) === normalize(trip.to_city);

  if (!routeMatches) {
    return false;
  }

  // 3. Date Match:
  // Traveler cannot depart BEFORE the package is ready for pickup
  if (pkg.pickup_date && trip.departure_date) {
    if (pkg.pickup_date > trip.departure_date) {
      return false;
    }
  }

  // Traveler cannot arrive AFTER the latest delivery deadline
  if (pkg.latest_delivery_date && trip.arrival_date) {
    if (trip.arrival_date > pkg.latest_delivery_date) {
      return false;
    }
  }

  return true;
};
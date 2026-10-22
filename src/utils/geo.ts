/**
 * Geospatial calculation utilities (Haversine formula) & Resilient Geolocation
 */

export interface DisasterSector {
  name: string;
  lat: number;
  lng: number;
  locality: string;
}

export const POPULAR_SECTORS: DisasterSector[] = [
  { name: 'Velachery Central (AGS Colony)', lat: 12.9792, lng: 80.2195, locality: 'South Chennai Lowlands' },
  { name: 'Adyar River Basin', lat: 13.003, lng: 80.252, locality: 'Central Adyar' },
  { name: 'Madipakkam Lake Sector', lat: 12.9647, lng: 80.1963, locality: 'South Suburbs' },
  { name: 'Perumbakkam Housing Board', lat: 12.9025, lng: 80.1982, locality: 'Marshland Border' },
  { name: 'Tambaram East Market Area', lat: 12.9235, lng: 80.134, locality: 'Southwest Hub' },
  { name: 'Redhills / Puzhal Catchment', lat: 13.195, lng: 80.178, locality: 'North Reservoir Zone' },
  { name: 'Kasimedu Coastal Belt', lat: 13.125, lng: 80.298, locality: 'Harbor Coastal Sector' },
  { name: 'Guindy Industrial Sector', lat: 13.0067, lng: 80.2025, locality: 'Central West' },
  { name: 'Mylapore Marina Coast', lat: 13.0336, lng: 80.2678, locality: 'East Coast' },
];

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

/**
 * Identifies closest known disaster sector to given coordinates
 */
export function findClosestSector(lat: number, lng: number): { sector: DisasterSector; distanceKm: number } {
  let closest = POPULAR_SECTORS[0];
  let minDistance = calculateDistanceKm(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < POPULAR_SECTORS.length; i++) {
    const d = calculateDistanceKm(lat, lng, POPULAR_SECTORS[i].lat, POPULAR_SECTORS[i].lng);
    if (d < minDistance) {
      minDistance = d;
      closest = POPULAR_SECTORS[i];
    }
  }

  return { sector: closest, distanceKm: minDistance };
}

export interface DetectedLocationResult {
  lat: number;
  lng: number;
  accuracy: number;
  source: 'gps' | 'network' | 'sector_default';
  locationName: string;
  note?: string;
}

/**
 * Robust multi-tier location detector:
 * 1. Attempts browser navigator.geolocation
 * 2. If blocked by iframe permissions or user denies, attempts network IP lookup
 * 3. If network fails or offline, safely resolves to closest active emergency response center
 * Guaranteed to NEVER hang or leave user with "not detecting".
 */
export async function detectLocationRobustly(
  timeoutMs: number = 4000
): Promise<DetectedLocationResult> {
  // Strategy 1: Browser Geolocation
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Geolocation timeout'));
        }, timeoutMs);

        navigator.geolocation.getCurrentPosition(
          (p) => {
            clearTimeout(timer);
            resolve(p);
          },
          (err) => {
            clearTimeout(timer);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: timeoutMs,
            maximumAge: 15000,
          }
        );
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = Math.round(pos.coords.accuracy || 20);
      const { sector, distanceKm } = findClosestSector(lat, lng);

      const label =
        distanceKm <= 5
          ? `${sector.name} (~${distanceKm}km away)`
          : `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

      return {
        lat,
        lng,
        accuracy: acc,
        source: 'gps',
        locationName: label,
        note: `Accurate within ±${acc}m via Device GPS`,
      };
    } catch (gpsError) {
      // Continue to next strategy
      console.warn('Browser GPS unavailable, using network fallback:', gpsError);
    }
  }

  // Strategy 2: Fast IP Geolocation Lookup
  try {
    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });
    clearTimeout(abortTimeout);

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const lat = data.latitude;
        const lng = data.longitude;
        const city = data.city || data.region || 'Current Area';
        const { sector, distanceKm } = findClosestSector(lat, lng);

        return {
          lat,
          lng,
          accuracy: 500,
          source: 'network',
          locationName: `${city} Sector (${sector.name})`,
          note: `Detected via Network Provider (${city})`,
        };
      }
    }
  } catch (netError) {
    // Continue to default
  }

  // Strategy 3: Standard Disaster Command Center Sector (Default fallback)
  const defaultSector = POPULAR_SECTORS[0]; // Velachery Central
  return {
    lat: defaultSector.lat,
    lng: defaultSector.lng,
    accuracy: 100,
    source: 'sector_default',
    locationName: `${defaultSector.name} (${defaultSector.locality})`,
    note: 'Approximated Response Base (Tap map or enter custom sector to adjust)',
  };
}

/**
 * Backward compatibility wrapper
 */
export function getBrowserLocation(
  onSuccess: (coords: { lat: number; lng: number; accuracy: number; source?: string; label?: string }) => void,
  onError: (errorMsg: string) => void
): void {
  detectLocationRobustly(4000)
    .then((res) => {
      onSuccess({
        lat: res.lat,
        lng: res.lng,
        accuracy: res.accuracy,
        source: res.source,
        label: res.locationName,
      });
    })
    .catch((err) => {
      // Even if detectLocationRobustly fails unexpectedly, return default sector
      const def = POPULAR_SECTORS[0];
      onSuccess({
        lat: def.lat,
        lng: def.lng,
        accuracy: 100,
        source: 'sector_default',
        label: def.name,
      });
    });
}


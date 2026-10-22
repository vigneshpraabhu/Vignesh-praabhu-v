import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { EmergencyRequest, VolunteerProfile, ReliefCamp, ResourceItem } from '../../types';
import { calculateDistanceKm } from '../../utils/geo';
import { Layers, MapPin, ShieldAlert, Users, Home, Box, Crosshair, Navigation } from 'lucide-react';

interface InteractiveMapProps {
  requests?: EmergencyRequest[];
  volunteers?: VolunteerProfile[];
  camps?: ReliefCamp[];
  resources?: ResourceItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectableLocation?: boolean;
  onLocationSelect?: (lat: number, lng: number, addressName?: string) => void;
  selectedRequestId?: string;
  onSelectRequest?: (req: EmergencyRequest) => void;
  volunteerLocation?: {
    lat: number;
    lng: number;
    radiusKm?: number;
    name?: string;
  };
  showRadiusCircle?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  requests = [],
  volunteers = [],
  camps = [],
  resources = [],
  center = [12.98, 80.22], // Default coastal sector center (Chennai/Adyar/Velachery)
  zoom = 12,
  height = '480px',
  selectableLocation = false,
  onLocationSelect,
  selectedRequestId,
  onSelectRequest,
  volunteerLocation,
  showRadiusCircle = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const [showRequests, setShowRequests] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(true);
  const [showCamps, setShowCamps] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [pickedPos, setPickedPos] = useState<[number, number] | null>(null);

  // Center on Volunteer helper
  const handleCenterOnVolunteer = () => {
    if (mapInstanceRef.current && volunteerLocation?.lat && volunteerLocation?.lng) {
      mapInstanceRef.current.setView([volunteerLocation.lat, volunteerLocation.lng], 13, {
        animate: true,
      });
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const initialCenter =
        volunteerLocation?.lat && volunteerLocation?.lng
          ? [volunteerLocation.lat, volunteerLocation.lng]
          : center;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter as [number, number],
        zoom,
        zoomControl: true,
        attributionControl: true,
      });

      // OpenStreetMap standard tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layerGroup;
      mapInstanceRef.current = map;

      // Handle map clicks if selectable
      if (selectableLocation) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setPickedPos([lat, lng]);

          if (pickerMarkerRef.current) {
            pickerMarkerRef.current.setLatLng([lat, lng]);
          } else {
            const pinIcon = L.divIcon({
              className: 'custom-picker-pin',
              html: `<div class="w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold animate-bounce text-sm">📍</div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            });
            pickerMarkerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
          }

          if (onLocationSelect) {
            onLocationSelect(lat, lng, `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        });
      }
    } catch (err) {
      console.warn('Leaflet map initialization caught error:', err);
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (err) {
        // ignore cleanup error
      }
    };
  }, []);

  // Update Layers & Markers
  useEffect(() => {
    try {
      const map = mapInstanceRef.current;
      const group = layersGroupRef.current;
      if (!map || !group) return;

      group.clearLayers();

      // 0. Render Volunteer Radius Circle & Self Marker (if provided)
      if (volunteerLocation && volunteerLocation.lat && volunteerLocation.lng) {
        const volLat = volunteerLocation.lat;
        const volLng = volunteerLocation.lng;
        const radiusKm = volunteerLocation.radiusKm || 10;

        // Radius circle
        if (showRadiusCircle) {
          L.circle([volLat, volLng], {
            radius: radiusKm * 1000,
            color: '#10b981',
            fillColor: '#34d399',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '6, 6',
          })
            .bindTooltip(`Rescue Radius: ${radiusKm} km`, { permanent: false, direction: 'top' })
            .addTo(group);
        }

        // Volunteer Marker (YOU)
        const selfIconHtml = `
          <div style="background-color: #059669; width: 38px; height: 38px; border-radius: 9999px; border: 3px solid #ffffff; box-shadow: 0 0 14px rgba(16, 185, 129, 0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; position: relative; cursor: pointer;">
            🧑‍🚒
            <span style="position: absolute; bottom: -18px; background: #064e3b; color: #a7f3d0; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 4px; white-space: nowrap; border: 1px solid #10b981; letter-spacing: 0.5px;">
              YOU
            </span>
          </div>
        `;

        const selfIcon = L.divIcon({
          className: 'custom-vol-self-marker',
          html: selfIconHtml,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const selfMarker = L.marker([volLat, volLng], { icon: selfIcon, zIndexOffset: 1000 });
        selfMarker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <div style="font-weight: 800; color: #065f46; font-size: 13px;">🧑‍🚒 Your Rescue Position</div>
            <div style="font-size: 11px; color: #374151; margin-top: 2px;">${volunteerLocation.name || 'Field Unit'}</div>
            <div style="font-size: 10px; color: #6b7280; font-mono; margin-top: 1px;">${volLat.toFixed(4)}, ${volLng.toFixed(4)}</div>
            <div style="font-size: 11px; color: #059669; font-weight: bold; margin-top: 4px;">Search Radius: ${radiusKm} km</div>
          </div>
        `);
        selfMarker.addTo(group);
      }

      // 1. Emergency Requests Markers
      if (showRequests) {
        requests.forEach((req) => {
          if (!req.lat || !req.lng) return;

          let color = '#3b82f6';
          let badgeText = req.emergencyType.substring(0, 1);
          if (req.priority === 'CRITICAL') {
            color = '#dc2626'; // Red
            badgeText = '🚨';
          } else if (req.priority === 'HIGH') {
            color = '#ea580c'; // Orange
            badgeText = '⚡';
          } else if (req.priority === 'MEDIUM') {
            color = '#eab308'; // Yellow
            badgeText = '⚠️';
          }

          const isEscalated = req.isEscalated;
          const iconHtml = `
            <div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 9999px; border: 3px solid ${
            isEscalated ? '#ff0000' : '#ffffff'
          }; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; position: relative;">
              ${badgeText}
              ${
                isEscalated
                  ? '<span style="position: absolute; top: -6px; right: -6px; background: #991b1b; color: white; font-size: 9px; padding: 1px 4px; border-radius: 4px; font-weight: bold; border: 1px solid white;">ESCALATED</span>'
                  : ''
              }
            </div>
          `;

          const icon = L.divIcon({
            className: 'custom-emerg-marker',
            html: iconHtml,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });

          const marker = L.marker([req.lat, req.lng], { icon });

          // Calculate distance from volunteer if available
          let distanceHtml = '';
          if (volunteerLocation?.lat && volunteerLocation?.lng) {
            const dist = calculateDistanceKm(
              volunteerLocation.lat,
              volunteerLocation.lng,
              req.lat,
              req.lng
            );
            const inRange = dist <= (volunteerLocation.radiusKm || 10);
            distanceHtml = `
              <div style="font-size: 11px; font-weight: bold; color: ${
                inRange ? '#047857' : '#b45309'
              }; background: ${
              inRange ? '#ecfdf5' : '#fffbeb'
            }; padding: 3px 6px; border-radius: 4px; margin-bottom: 6px; border: 1px solid ${
              inRange ? '#a7f3d0' : '#fde68a'
            }; display: flex; align-items: center; justify-content: space-between;">
                <span>📍 ${dist} km from you</span>
                <span>${inRange ? '🟢 In Radius' : '⚪ Outside'}</span>
              </div>
            `;
          }

          const popupContent = `
            <div style="font-family: sans-serif; min-width: 210px; padding: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: bold; font-size: 13px; color: #1e293b;">${req.requestId}</span>
                <span style="background: ${color}; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${req.priority}</span>
              </div>
              ${distanceHtml}
              <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 2px;">${req.emergencyType} Emergency</div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">📍 ${req.locationName}</div>
              <div style="font-size: 11px; color: #334155; margin-bottom: 6px;">👥 <strong>${req.affectedPeopleCount}</strong> people affected</div>
              <div style="font-size: 11px; background: #f1f5f9; padding: 4px; border-radius: 4px; color: #1e293b; margin-bottom: 6px;">
                ${req.description.substring(0, 100)}${req.description.length > 100 ? '...' : ''}
              </div>
              <div style="font-size: 10px; color: #64748b;">Status: <strong>${req.status}</strong></div>
              ${
                req.assignedVolunteerName
                  ? `<div style="font-size: 10px; color: #0369a1; margin-top: 2px;">Assigned: ${req.assignedVolunteerName}</div>`
                  : ''
              }
            </div>
          `;

          marker.bindPopup(popupContent);
          if (onSelectRequest) {
            marker.on('click', () => onSelectRequest(req));
          }
          marker.addTo(group);
        });
      }

      // 2. Volunteers Markers (Exclude current user to avoid duplicate)
      if (showVolunteers) {
        volunteers.forEach((vol) => {
          if (!vol.lat || !vol.lng) return;
          if (
            volunteerLocation &&
            Math.abs(vol.lat - volunteerLocation.lat) < 0.0001 &&
            Math.abs(vol.lng - volunteerLocation.lng) < 0.0001
          ) {
            return; // Skip duplicate of self
          }

          const isAvail = vol.availability === 'AVAILABLE';
          const color = isAvail ? '#2563eb' : '#64748b';

          const iconHtml = `
            <div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">
              🧑‍🚒
            </div>
          `;

          const icon = L.divIcon({
            className: 'custom-vol-marker',
            html: iconHtml,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          const marker = L.marker([vol.lat, vol.lng], { icon });
          const popupContent = `
            <div style="font-family: sans-serif; min-width: 190px;">
              <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${vol.name}</div>
              <div style="font-size: 11px; color: ${isAvail ? '#16a34a' : '#d97706'}; font-weight: 600;">Status: ${vol.availability}</div>
              <div style="font-size: 11px; color: #475569;">📞 ${vol.phone}</div>
              <div style="font-size: 11px; color: #334155; margin-top: 4px;">Skills: <em>${vol.skills.join(', ')}</em></div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Coverage: ${vol.serviceRadiusKm}km radius</div>
            </div>
          `;
          marker.bindPopup(popupContent);
          marker.addTo(group);
        });
      }

      // 3. Relief Camps Markers
      if (showCamps) {
        camps.forEach((camp) => {
          if (!camp.lat || !camp.lng) return;

          const isFull = camp.operatingStatus === 'FULL';
          const isNear = camp.operatingStatus === 'NEAR_CAPACITY';
          const color = isFull ? '#dc2626' : isNear ? '#f59e0b' : '#10b981';

          const iconHtml = `
            <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 6px; border: 2px solid white; box-shadow: 0 3px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 15px;">
              ⛺
            </div>
          `;

          const icon = L.divIcon({
            className: 'custom-camp-marker',
            html: iconHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([camp.lat, camp.lng], { icon });
          const popupContent = `
            <div style="font-family: sans-serif; min-width: 210px;">
              <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${camp.name}</div>
              <div style="font-size: 11px; color: #475569;">📍 ${camp.address}</div>
              <div style="margin: 4px 0; font-size: 11px; background: #f8fafc; padding: 4px; border-radius: 4px;">
                <div>Capacity: <strong>${camp.currentOccupancy} / ${camp.totalCapacity}</strong></div>
                <div>Available Spaces: <strong style="color: ${camp.availableSpaces > 20 ? '#16a34a' : '#dc2626'}">${camp.availableSpaces}</strong></div>
                <div>Beds Available: <strong>${camp.bedAvailability}</strong></div>
              </div>
              <div style="font-size: 10px; color: #334155;">
                Facilities: ${camp.foodAvailability ? '🍲 Food ' : ''}${camp.waterAvailability ? '💧 Water ' : ''}${camp.medicalSupport ? '🩺 Clinic' : ''}
              </div>
              <div style="font-size: 10px; color: #64748b; margin-top: 3px;">Officer: ${camp.contactPerson} (${camp.contactPhone})</div>
            </div>
          `;
          marker.bindPopup(popupContent);
          marker.addTo(group);
        });
      }

      // 4. Resources Markers
      if (showResources) {
        resources.forEach((res) => {
          if (!res.lat || !res.lng) return;

          const iconHtml = `
            <div style="background-color: #8b5cf6; width: 28px; height: 28px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">
              📦
            </div>
          `;

          const icon = L.divIcon({
            className: 'custom-res-marker',
            html: iconHtml,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([res.lat, res.lng], { icon });
          const popupContent = `
            <div style="font-family: sans-serif; min-width: 190px;">
              <div style="font-weight: bold; font-size: 12px; color: #581c87;">${res.category}: ${res.name}</div>
              <div style="font-size: 11px; color: #475569;">📍 ${res.locationName}</div>
              <div style="font-size: 11px; color: #0f172a; margin-top: 3px;">Available: <strong>${res.availableQuantity} / ${res.totalQuantity} ${res.unit}</strong></div>
              <div style="font-size: 10px; color: #64748b;">Provider: ${res.providerName} (${res.providerPhone})</div>
            </div>
          `;
          marker.bindPopup(popupContent);
          marker.addTo(group);
        });
      }
    } catch (err) {
      console.warn('Leaflet marker layer update caught error:', err);
    }
  }, [
    requests,
    volunteers,
    camps,
    resources,
    showRequests,
    showVolunteers,
    showCamps,
    showResources,
    volunteerLocation,
    showRadiusCircle,
  ]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Map Layer Controls Bar */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-md border border-slate-200 text-xs flex flex-wrap items-center gap-3">
        <span className="font-semibold text-slate-700 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-500" /> Layers:
        </span>
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showRequests}
            onChange={(e) => setShowRequests(e.target.checked)}
            className="rounded text-red-600 focus:ring-0"
          />
          <span className="text-red-700 font-medium">🚨 Requests ({requests.length})</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showVolunteers}
            onChange={(e) => setShowVolunteers(e.target.checked)}
            className="rounded text-blue-600 focus:ring-0"
          />
          <span className="text-blue-700 font-medium">🧑‍🚒 Units</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showCamps}
            onChange={(e) => setShowCamps(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-0"
          />
          <span className="text-emerald-700 font-medium">⛺ Camps</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showResources}
            onChange={(e) => setShowResources(e.target.checked)}
            className="rounded text-purple-600 focus:ring-0"
          />
          <span className="text-purple-700 font-medium">📦 Gear</span>
        </label>

        {volunteerLocation && (
          <button
            type="button"
            onClick={handleCenterOnVolunteer}
            className="ml-auto bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-1 rounded font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
            title="Focus map on my position"
          >
            <Navigation className="w-3 h-3 text-emerald-300" />
            <span>Center on Me</span>
          </button>
        )}
      </div>

      {selectableLocation && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-blue-900/90 text-white text-xs px-3 py-1.5 rounded-lg shadow backdrop-blur-sm flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-blue-300 animate-spin" />
          <span>Click anywhere on the map to pin exact GPS location</span>
          {pickedPos && (
            <span className="bg-blue-800 px-2 py-0.5 rounded font-mono font-medium text-amber-300">
              {pickedPos[0].toFixed(4)}, {pickedPos[1].toFixed(4)}
            </span>
          )}
        </div>
      )}

      {/* Map DOM Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height }} />
    </div>
  );
};


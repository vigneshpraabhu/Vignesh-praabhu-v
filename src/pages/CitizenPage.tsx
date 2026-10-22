import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { EmergencyRequest, EmergencyType, ReliefCamp, Alert, User } from '../types';
import { PriorityBadge, StatusBadge } from '../components/common/PriorityBadge';
import { InteractiveMap } from '../components/common/InteractiveMap';
import { POPULAR_SECTORS, detectLocationRobustly } from '../utils/geo';
import {
  LifeBuoy,
  MapPin,
  Users,
  Phone,
  FileText,
  AlertTriangle,
  Home,
  CheckCircle2,
  Clock,
  Compass,
  WifiOff,
  Send,
  Eye,
  X,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const CitizenPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [requests, setRequests] = useState<EmergencyRequest[]>(store.getRequests());
  const [camps, setCamps] = useState<ReliefCamp[]>(store.getReliefCamps());
  const [alerts, setAlerts] = useState<Alert[]>(store.getAlerts());
  const [isOffline, setIsOffline] = useState(store.isOffline());

  // Form State
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('Rescue');
  const [affectedCount, setAffectedCount] = useState<number>(3);
  const [description, setDescription] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>(currentUser?.phone || '+91 98412 34567');
  const [locationName, setLocationName] = useState<string>('');
  const [lat, setLat] = useState<number>(12.9792);
  const [lng, setLng] = useState<number>(80.2195);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  // Modals & UI Controls
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string>('');
  const [wasOfflineQueued, setWasOfflineQueued] = useState<boolean>(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<EmergencyRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'report' | 'my-requests' | 'camps' | 'alerts'>('report');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setRequests(store.getRequests());
      setCamps(store.getReliefCamps());
      setAlerts(store.getAlerts());
      setIsOffline(store.isOffline());
    });
    return unsub;
  }, []);

  // Filter requests submitted by this citizen (or all requests matching phone/citizenId, or user-cit-1 demo)
  const citizenId = currentUser?.id || 'user-cit-1';
  const myRequests = requests.filter(
    (r) => r.citizenId === citizenId || r.citizenPhone === currentUser?.phone
  );

  const pendingCount = myRequests.filter((r) => r.status === 'PENDING').length;
  const inProgressCount = myRequests.filter(
    (r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED' || r.status === 'VERIFIED'
  ).length;
  const closedCount = myRequests.filter((r) => r.status === 'CLOSED').length;

  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'detected' | 'fallback'>('idle');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsNote, setGpsNote] = useState<string>('');

  const handleUseMyLocation = async () => {
    setGpsStatus('detecting');
    try {
      const res = await detectLocationRobustly(4500);
      setLat(res.lat);
      setLng(res.lng);
      setGpsAccuracy(res.accuracy);
      setLocationName(res.locationName);
      setGpsNote(res.note || '');
      setGpsStatus(res.source === 'sector_default' ? 'fallback' : 'detected');
    } catch (err) {
      const def = POPULAR_SECTORS[0];
      setLat(def.lat);
      setLng(def.lng);
      setLocationName(`${def.name} (${def.locality})`);
      setGpsNote('Set to central flood response sector');
      setGpsStatus('fallback');
    }
  };

  const handleSelectSector = (sector: typeof POPULAR_SECTORS[0]) => {
    setLat(sector.lat);
    setLng(sector.lng);
    setLocationName(`${sector.name} (${sector.locality})`);
    setGpsStatus('detected');
  };

  const handleMapLocationSelect = (pickedLat: number, pickedLng: number, addr?: string) => {
    setLat(pickedLat);
    setLng(pickedLng);
    setGpsStatus('detected');
    if (addr && !locationName) {
      setLocationName(addr);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please describe your emergency situation.');
      return;
    }
    if (!locationName.trim()) {
      alert('Please provide a location or click on the map.');
      return;
    }
    setShowReviewModal(true);
  };

  const confirmSubmission = () => {
    try {
      const res = store.createRequest({
        citizenId,
        citizenName: currentUser?.name || 'Concerned Citizen',
        citizenPhone: contactPhone,
        emergencyType,
        description,
        affectedPeopleCount: Number(affectedCount) || 1,
        locationName,
        lat,
        lng,
        specialInstructions,
      });

      setSubmittedRequestId(res.request.requestId);
      setWasOfflineQueued(res.isOfflineQueued);
      setShowReviewModal(false);
      setShowSuccessModal(true);

      // Reset form fields
      setDescription('');
      setSpecialInstructions('');
      setActiveTab('my-requests');
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-700 text-xs uppercase px-2.5 py-0.5 rounded-full font-bold">
                Citizen Emergency Portal
              </span>
              {isOffline && (
                <span className="bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Offline Mode Active
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Disaster Assistance & Rescue Center
            </h1>
            <p className="text-xs text-slate-500">
              Logged in as: <strong>{currentUser?.name || 'Guest Citizen'}</strong> ({currentUser?.phone})
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-center min-w-[80px]">
              <div className="text-xs text-slate-500">My Requests</div>
              <div className="text-lg font-bold text-slate-900">{myRequests.length}</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-center min-w-[80px]">
              <div className="text-xs text-amber-700">Pending</div>
              <div className="text-lg font-bold text-amber-800">{pendingCount}</div>
            </div>
            <div className="bg-cyan-50 border border-cyan-200 px-3 py-2 rounded-xl text-center min-w-[80px]">
              <div className="text-xs text-cyan-700">In Progress</div>
              <div className="text-lg font-bold text-cyan-800">{inProgressCount}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-center min-w-[80px]">
              <div className="text-xs text-emerald-700">Resolved</div>
              <div className="text-lg font-bold text-emerald-800">{closedCount}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'report'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Report Emergency</span>
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'my-requests'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Requests ({myRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('camps')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'camps'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Nearby Relief Camps ({camps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Advisories ({alerts.length})</span>
          </button>
        </div>

        {/* TAB 1: REPORT EMERGENCY FORM */}
        {activeTab === 'report' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Emergency Dispatch Request Form
                  </h2>
                  <p className="text-xs text-slate-500">
                    All emergency reports are verified and matched with response teams.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-red-600 uppercase bg-red-50 border border-red-200 px-2 py-1 rounded">
                  Priority Triage
                </span>
              </div>

              {/* Citizen Quick Tip */}
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs flex items-center gap-2.5">
                <span className="text-lg shrink-0">📍</span>
                <span className="leading-snug">
                  <strong>Citizen Safety Tip:</strong> Stranded or trapped? Pin your location, specify how many people need help, and nearby volunteers will be matched to your rescue call immediately.
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Emergency Type Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Select Emergency Category *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['Rescue', 'Medical', 'Food', 'Water', 'Shelter'] as EmergencyType[]).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setEmergencyType(type)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                          emergencyType === type
                            ? 'bg-red-600 border-red-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-base">
                          {type === 'Rescue' ? '🚤' : type === 'Medical' ? '🚑' : type === 'Food' ? '🍲' : type === 'Water' ? '💧' : '⛺'}
                        </span>
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Affected People & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Number of Affected / Trapped People *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={affectedCount}
                      onChange={(e) => setAffectedCount(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Direct Callback Phone *
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Situation & Hazard Description *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="e.g. Water reached first floor. 3 family members trapped on terrace. Power lines are broken nearby."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                {/* Location & GPS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Address / Landmark / Sector *
                    </label>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={gpsStatus === 'detecting'}
                      className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                    >
                      <Compass className={`w-3.5 h-3.5 ${gpsStatus === 'detecting' ? 'animate-spin text-blue-600' : 'text-blue-600'}`} />
                      <span>{gpsStatus === 'detecting' ? 'Detecting GPS...' : 'Detect My GPS Location'}</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    required
                    placeholder="e.g. Plot 42, AGS Colony 3rd Cross, Velachery"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />

                  {/* GPS Status Indicator */}
                  {gpsStatus === 'detected' && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex flex-wrap items-center justify-between gap-1">
                      <span className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Location Detected: {lat.toFixed(4)}, {lng.toFixed(4)}
                        {gpsAccuracy && <span className="font-normal opacity-80">(±{gpsAccuracy}m)</span>}
                      </span>
                      <span className="text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded text-[10px]">
                        {gpsNote || 'Ready for Dispatch'}
                      </span>
                    </div>
                  )}

                  {gpsStatus === 'fallback' && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex flex-wrap items-center justify-between gap-1">
                      <span className="flex items-center gap-1.5 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        Sector Pinned: {locationName}
                      </span>
                      <span className="text-blue-700 font-medium text-[10px]">
                        Tap on the map below to pinpoint exact house/street
                      </span>
                    </div>
                  )}

                  {/* Quick Disaster Hotspot Sector Pills */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Quick Disaster Sectors (1-Click Pin):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {POPULAR_SECTORS.map((sec, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSector(sec)}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-700 text-[10px] font-medium border border-slate-200 transition"
                        >
                          📍 {sec.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Needs / Critical Hazards (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Infant 6 months old, 84yo patient needing oxygen/insulin, boat required"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-900/30 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Review & Transmit Emergency Request
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Your request will be assigned a permanent tracking ID and verified by disaster officials.
                  </p>
                </div>
              </form>
            </div>

            {/* Interactive Location Pinning Map */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-600" />
                    Interactive Map Pin Dropper
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Click on the map to pinpoint your exact rescue coordinates.
                </p>

                <InteractiveMap
                  center={[lat, lng]}
                  zoom={13}
                  height="340px"
                  selectableLocation={true}
                  onLocationSelect={handleMapLocationSelect}
                  camps={camps}
                />
              </div>

              {/* Safety Guidance Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Immediate Flood & Cyclone Safety Tips
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  <li>Turn off main electrical breaker switches before flood waters rise.</li>
                  <li>Do not enter fast-flowing water deeper than knee height.</li>
                  <li>Move to higher floors or terrace with life vests, flashlights, and whistles.</li>
                  <li>Conserve mobile phone battery for emergency coordination calls.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY REQUESTS */}
        {activeTab === 'my-requests' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <h2 className="font-bold text-base text-slate-900">
                Tracked Emergency Requests ({myRequests.length})
              </h2>
              <span className="text-xs text-slate-500">
                Automatic real-time sync with Disaster EOC Control Room
              </span>
            </div>

            {myRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-700">
                  No Emergency Requests Submitted
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  If you or someone in your vicinity needs rescue, medical aid, or relief supplies, submit a request immediately.
                </p>
                <button
                  onClick={() => setActiveTab('report')}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
                >
                  Report Emergency Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {req.requestId}
                        </span>
                        <PriorityBadge priority={req.priority} />
                        <StatusBadge status={req.status} />
                        {req.isEscalated && (
                          <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                            ESCALATED
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        Reported: {new Date(req.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block">Emergency Type:</span>
                        <strong className="text-slate-800 text-sm">
                          {req.emergencyType} ({req.affectedPeopleCount} people affected)
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Location:</span>
                        <span className="text-slate-800 font-medium">📍 {req.locationName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Assigned Volunteer:</span>
                        <span className="text-slate-800 font-medium">
                          {req.assignedVolunteerName ? (
                            <span className="text-blue-700 font-semibold">
                              🧑‍🚒 {req.assignedVolunteerName}
                            </span>
                          ) : (
                            <span className="text-amber-600">Pending Government Assignment</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {req.description}
                    </p>

                    {/* Progress Lifecycle Bar */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span className={req.status !== 'REJECTED' ? 'text-blue-600 font-bold' : ''}>
                          1. Reported
                        </span>
                        <span className={['VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLUTION_PENDING', 'CLOSED'].includes(req.status) ? 'text-blue-600 font-bold' : ''}>
                          2. Verified
                        </span>
                        <span className={['ASSIGNED', 'IN_PROGRESS', 'RESOLUTION_PENDING', 'CLOSED'].includes(req.status) ? 'text-purple-600 font-bold' : ''}>
                          3. Dispatched
                        </span>
                        <span className={['IN_PROGRESS', 'RESOLUTION_PENDING', 'CLOSED'].includes(req.status) ? 'text-cyan-600 font-bold' : ''}>
                          4. In Action
                        </span>
                        <span className={req.status === 'CLOSED' ? 'text-emerald-600 font-bold' : ''}>
                          5. Resolved
                        </span>
                      </div>
                    </div>

                    {/* Field Notes Feed */}
                    {req.fieldNotes.length > 0 && (
                      <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="font-bold text-blue-900 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600" /> Field Updates from Rescuers:
                        </div>
                        {req.fieldNotes.map((fn) => (
                          <div key={fn.id} className="text-slate-700 pl-2 border-l-2 border-blue-400">
                            <strong>{fn.volunteerName}:</strong> {fn.note}{' '}
                            <span className="text-slate-400 text-[10px]">
                              ({new Date(fn.timestamp).toLocaleTimeString()})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setSelectedRequestDetails(req)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Full Request Details & Verification Log
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RELIEF CAMPS */}
        {activeTab === 'camps' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-slate-900">
                  Government Registered Relief Camps & Safe Shelters
                </h2>
                <p className="text-xs text-slate-500">
                  Safe zones equipped with food, drinking water, power, and medical support.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {camps.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          camp.operatingStatus === 'FULL'
                            ? 'bg-red-100 text-red-800'
                            : camp.operatingStatus === 'NEAR_CAPACITY'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {camp.operatingStatus}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-1">
                        {camp.name}
                      </h4>
                      <p className="text-xs text-slate-500">📍 {camp.address}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-emerald-700">
                        {camp.availableSpaces}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Spaces Free
                      </div>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Total Capacity: {camp.totalCapacity}</span>
                      <span>Occupancy: {camp.currentOccupancy}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (camp.currentOccupancy / camp.totalCapacity) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-[11px] text-slate-600 text-center">
                    <div className="bg-slate-50 p-1.5 rounded">
                      {camp.foodAvailability ? '🍲 Food Available' : '❌ No Food'}
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded">
                      {camp.waterAvailability ? '💧 Clean Water' : '❌ Water Short'}
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded">
                      {camp.medicalSupport ? '🩺 Clinic On-Site' : '❌ No Clinic'}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 pt-1 flex items-center justify-between">
                    <span>Nodal Officer: <strong>{camp.contactPerson}</strong></span>
                    <a
                      href={`tel:${camp.contactPhone}`}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      📞 {camp.contactPhone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border shadow-xs ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-50 border-red-200 text-red-950'
                    : alert.severity === 'HIGH'
                    ? 'bg-orange-50 border-orange-200 text-orange-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-white shadow-xs">
                      {alert.alertType}
                    </span>
                    <PriorityBadge priority={alert.severity} />
                  </div>
                  <span className="text-xs opacity-75">
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>
                <h4 className="font-extrabold text-base mb-1">{alert.title}</h4>
                <p className="text-xs leading-relaxed opacity-90">{alert.message}</p>
                <div className="mt-3 pt-2 border-t border-black/10 flex justify-between text-[11px] opacity-75">
                  <span>Affected Region: <strong>{alert.affectedArea}</strong></span>
                  <span>Issued By: <strong>{alert.authorName}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: REVIEW BEFORE SUBMISSION */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                Confirm Emergency Request Details
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Please double-check your coordinates and details before transmitting to the disaster dispatch center.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs border border-slate-200">
              <div>
                <span className="text-slate-500 block">Emergency Type:</span>
                <strong className="text-slate-900 text-sm">{emergencyType}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Affected Persons:</span>
                <strong className="text-slate-900">{affectedCount} Trapped / In Need</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Location:</span>
                <strong className="text-slate-900">📍 {locationName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">GPS Coordinates:</span>
                <span className="font-mono text-slate-700">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Phone:</span>
                <strong className="text-slate-900">{contactPhone}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Description:</span>
                <p className="text-slate-800">{description}</p>
              </div>
              {specialInstructions && (
                <div>
                  <span className="text-slate-500 block">Special Needs:</span>
                  <p className="text-amber-800 font-medium">{specialInstructions}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Go Back & Edit
              </button>
              <button
                onClick={confirmSubmission}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Confirm & Transmit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBMISSION CONFIRMATION */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-black text-xl text-slate-900">
              Emergency Request Logged
            </h3>

            <div className="bg-slate-100 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase font-bold">
                Tracking Reference ID
              </div>
              <div className="text-2xl font-mono font-black text-red-600 mt-0.5">
                {submittedRequestId}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {wasOfflineQueued
                ? 'Your device is currently offline. Your request has been securely cached in local storage and will automatically synchronize the moment connectivity returns.'
                : 'Your request has been broadcasted to the Disaster Control Room. Authorities are verifying the location and matching nearby volunteer units.'}
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
            >
              View in My Requests
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUEST DETAILS DIALOG */}
      {selectedRequestDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono font-bold text-sm text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedRequestDetails.requestId}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  {selectedRequestDetails.emergencyType} Emergency Case File
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequestDetails(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Priority:</span>
                  <PriorityBadge priority={selectedRequestDetails.priority} />
                </div>
                <div>
                  <span className="text-slate-400 block">Current Status:</span>
                  <StatusBadge status={selectedRequestDetails.status} />
                </div>
              </div>

              <div>
                <span className="text-slate-400 block">Location:</span>
                <strong className="text-slate-900">📍 {selectedRequestDetails.locationName}</strong>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  GPS: {selectedRequestDetails.lat.toFixed(4)}, {selectedRequestDetails.lng.toFixed(4)}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block">Affected Persons:</span>
                <strong className="text-slate-900">{selectedRequestDetails.affectedPeopleCount} people</strong>
              </div>

              <div>
                <span className="text-slate-400 block">Description:</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedRequestDetails.description}
                </p>
              </div>

              {selectedRequestDetails.verifiedBy && (
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-blue-900">
                  <span className="font-semibold block">Government Verification Record:</span>
                  Verified by: <strong>{selectedRequestDetails.verifiedBy}</strong> on{' '}
                  {new Date(selectedRequestDetails.verifiedAt || '').toLocaleString()}
                </div>
              )}

              {selectedRequestDetails.rejectionReason && (
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-900">
                  <span className="font-semibold block">Official Review Outcome:</span>
                  {selectedRequestDetails.rejectionReason}
                </div>
              )}

              {selectedRequestDetails.assignedVolunteerName && (
                <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-purple-900">
                  <span className="font-semibold block">Assigned Volunteer Rescuer:</span>
                  <strong>{selectedRequestDetails.assignedVolunteerName}</strong>
                  <div className="text-[11px] mt-0.5">Operation Reference: {selectedRequestDetails.operationId}</div>
                </div>
              )}

              {selectedRequestDetails.completionReport && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                  <span className="font-bold block">Final Field Completion Report:</span>
                  <div>Rescued Count: <strong>{selectedRequestDetails.completionReport.rescuedCount}</strong></div>
                  <div>Summary: {selectedRequestDetails.completionReport.summary}</div>
                  <div className="text-[11px] opacity-75">
                    Submitted: {new Date(selectedRequestDetails.completionReport.submittedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRequestDetails(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Close Case File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import {
  EmergencyRequest,
  VolunteerProfile,
  ManpowerRequest,
  ResourceRequest,
  AppNotification,
  VolunteerStatus,
  RequestStatus,
  Priority,
  User,
  ResourceCategory,
} from '../types';
import { PriorityBadge, StatusBadge } from '../components/common/PriorityBadge';
import { InteractiveMap } from '../components/common/InteractiveMap';
import { calculateDistanceKm, detectLocationRobustly, POPULAR_SECTORS } from '../utils/geo';
import {
  Users,
  Compass,
  LifeBuoy,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  PlusCircle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  UserPlus,
  Box,
  MapPin,
  Flame,
  Radio,
  FileText,
  BadgeAlert,
  Check,
  X,
  Navigation,
  Sliders,
  Locate,
  Edit3,
  Save,
  Filter,
  Target,
  Sparkles,
  Mail,
  UserCheck,
  Shield,
} from 'lucide-react';

export const COMMON_VOLUNTEER_SKILLS = [
  'Water Rescue & Swimmer',
  'Boat Captain / Skipper',
  'BLS First Aid & CPR',
  'Paramedic / Trauma Care',
  'Heavy 4x4 Off-Road Transport',
  'High-Angle Rope Rescue',
  'Ham Radio Operator',
  'Relief Camp Logistics',
  'Evacuation Coordination',
  'Animal & Livestock Rescue',
];

export const RADIUS_PRESETS = [2, 5, 10, 15, 20, 25, 35, 50, 75, 100];

export const VolunteerPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>(store.getVolunteers());
  const [requests, setRequests] = useState<EmergencyRequest[]>(store.getRequests());
  const [manpowerReqs, setManpowerReqs] = useState<ManpowerRequest[]>(store.getManpowerRequests());
  const [resourceReqs, setResourceReqs] = useState<ResourceRequest[]>(store.getResourceRequests());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Navigation: 10 Sidebar Sections
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'available'
    | 'my-tasks'
    | 'active-op'
    | 'map'
    | 'request-manpower'
    | 'request-resources'
    | 'notifications'
    | 'history'
    | 'profile'
  >('overview');

  // Selected Profile (supports multi-volunteer switching and defaults to current user or first volunteer)
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>(() => {
    const cur = store.getCurrentUser();
    const vols = store.getVolunteers();
    const match = vols.find((v) => v.userId === cur?.id || v.email === cur?.email);
    return match ? match.id : vols[0]?.id || 'vol-prof-1';
  });

  // Active Volunteer Profile
  const myProfile =
    volunteers.find((v) => v.id === selectedVolunteerId) ||
    volunteers.find((v) => v.userId === currentUser?.id || v.email === currentUser?.email) ||
    volunteers[0];

  // Dynamic Radius & Location state for nearby rescues
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(myProfile?.serviceRadiusKm || 15);
  const [filterByRadius, setFilterByRadius] = useState<boolean>(false);
  const [sortByDistance, setSortByDistance] = useState<boolean>(true);
  const [volLat, setVolLat] = useState<number>(myProfile?.lat || 12.9815);
  const [volLng, setVolLng] = useState<number>(myProfile?.lng || 80.218);
  const [locationName, setLocationName] = useState<string>(myProfile?.serviceArea || 'South Chennai & Coastal Belt');
  const [locDetecting, setLocDetecting] = useState<boolean>(false);
  const [locFeedback, setLocFeedback] = useState<string>('');

  // Editable Profile State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(myProfile?.name || '');
  const [editPhone, setEditPhone] = useState<string>(myProfile?.phone || '');
  const [editEmail, setEditEmail] = useState<string>(myProfile?.email || '');
  const [editServiceArea, setEditServiceArea] = useState<string>(myProfile?.serviceArea || '');
  const [editExperience, setEditExperience] = useState<string>(myProfile?.experience || '');
  const [editSkills, setEditSkills] = useState<string>(myProfile?.skills?.join(', ') || '');
  const [editRadius, setEditRadius] = useState<number>(myProfile?.serviceRadiusKm || 15);
  const [editEmergencyName, setEditEmergencyName] = useState<string>(myProfile?.emergencyContact?.name || '');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState<string>(myProfile?.emergencyContact?.phone || '');
  const [editEmergencyRelation, setEditEmergencyRelation] = useState<string>(myProfile?.emergencyContact?.relation || 'Family');
  const [editAvailability, setEditAvailability] = useState<VolunteerStatus>(myProfile?.availability || 'AVAILABLE');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<boolean>(false);
  const [radiusSaveFeedback, setRadiusSaveFeedback] = useState<string>('');

  // Sync profile fields if myProfile updates
  useEffect(() => {
    if (myProfile) {
      setEditName(myProfile.name);
      setEditPhone(myProfile.phone);
      setEditEmail(myProfile.email);
      setEditServiceArea(myProfile.serviceArea);
      setEditExperience(myProfile.experience || '');
      setEditSkills(myProfile.skills.join(', '));
      setEditRadius(myProfile.serviceRadiusKm);
      setSearchRadiusKm(myProfile.serviceRadiusKm);
      setEditEmergencyName(myProfile.emergencyContact?.name || '');
      setEditEmergencyPhone(myProfile.emergencyContact?.phone || '');
      setEditEmergencyRelation(myProfile.emergencyContact?.relation || 'Family');
      setEditAvailability(myProfile.availability || 'AVAILABLE');
      setVolLat(myProfile.lat);
      setVolLng(myProfile.lng);
      setLocationName(myProfile.serviceArea);
    }
  }, [myProfile?.id]);

  // Active Operation (missions assigned to this volunteer and currently active)
  const assignedTasks = requests.filter(
    (r) =>
      r.assignedVolunteerId === myProfile?.id &&
      r.status !== 'CLOSED' &&
      r.status !== 'REJECTED' &&
      r.status !== 'RESOLUTION_PENDING'
  );

  // Completed Tasks for Task History
  const completedHistoryTasks = requests.filter(
    (r) =>
      r.assignedVolunteerId === myProfile?.id &&
      (r.status === 'CLOSED' || r.status === 'RESOLUTION_PENDING' || !!r.completionReport)
  );

  const activeTask =
    assignedTasks.find(
      (r) => r.requestId === myProfile?.activeOperationId || r.id === myProfile?.activeOperationId
    ) ||
    assignedTasks.find(
      (r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED'
    ) ||
    assignedTasks[0];

  // Available Verified Tasks
  const openTasks = requests.filter(
    (r) => (r.status === 'VERIFIED' || r.status === 'PENDING') && !r.assignedVolunteerId
  );

  // Field Notes input
  const [fieldNoteText, setFieldNoteText] = useState('');
  const [isBlocker, setIsBlocker] = useState(false);

  // Manpower Request Form State
  const [manpowerCount, setManpowerCount] = useState(2);
  const [manpowerReason, setManpowerReason] = useState('');
  const [manpowerSkills, setManpowerSkills] = useState('Water Rescue, Swimmer');
  const [manpowerUrgency, setManpowerUrgency] = useState<Priority>('CRITICAL');

  // Resource Request Form State
  const [resCategory, setResCategory] = useState<ResourceCategory>('Boats');
  const [resSpecificItem, setResSpecificItem] = useState('Inflatable Motorboat');
  const [resQuantity, setResQuantity] = useState(1);
  const [resReason, setResReason] = useState('');
  const [resUrgency, setResUrgency] = useState<Priority>('CRITICAL');

  // Completion Report Form State
  const [completionSummary, setCompletionSummary] = useState('');
  const [rescuedCount, setRescuedCount] = useState(5);
  const [casualtiesCount, setCasualtiesCount] = useState(0);
  const [hospitalTransfers, setHospitalTransfers] = useState(1);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setVolunteers(store.getVolunteers());
      setRequests(store.getRequests());
      setManpowerReqs(store.getManpowerRequests());
      setResourceReqs(store.getResourceRequests());
      setNotifications(store.getNotifications(currentUser?.id, 'VOLUNTEER'));
    });
    setNotifications(store.getNotifications(currentUser?.id, 'VOLUNTEER'));
    return unsub;
  }, [currentUser]);

  const handleAvailabilityChange = (status: VolunteerStatus) => {
    try {
      store.updateVolunteerAvailability(myProfile.id, status);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Robust location detector for volunteer
  const handleDetectVolunteerLocation = async () => {
    setLocDetecting(true);
    setLocFeedback('');
    try {
      const res = await detectLocationRobustly(3500);
      setVolLat(res.lat);
      setVolLng(res.lng);
      setLocationName(res.locationName);
      setLocFeedback(`Location detected (${res.source.toUpperCase()}): ${res.locationName}`);

      // Persist to volunteer profile in store
      store.updateVolunteerProfile(myProfile.id, {
        lat: res.lat,
        lng: res.lng,
        serviceArea: res.locationName,
      });
    } catch (err: any) {
      setLocFeedback('Location fallback to South Chennai Sector');
    } finally {
      setLocDetecting(false);
    }
  };

  // Update volunteer profile details & radius
  const handleSaveVolunteerProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!myProfile) return;
    try {
      const skillsArr = editSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const rad = Math.max(1, Math.min(100, Number(editRadius) || 15));

      store.updateVolunteerProfile(myProfile.id, {
        name: editName.trim() || myProfile.name,
        phone: editPhone.trim() || myProfile.phone,
        email: editEmail.trim() || myProfile.email,
        serviceArea: editServiceArea.trim() || myProfile.serviceArea,
        experience: editExperience.trim() || myProfile.experience,
        serviceRadiusKm: rad,
        skills: skillsArr.length > 0 ? skillsArr : myProfile.skills,
        availability: editAvailability,
        lat: volLat,
        lng: volLng,
        emergencyContact: {
          name: editEmergencyName.trim() || myProfile.emergencyContact.name,
          phone: editEmergencyPhone.trim() || myProfile.emergencyContact.phone,
          relation: editEmergencyRelation.trim() || myProfile.emergencyContact.relation || 'Family',
        },
      });

      // Also update current user if matching
      if (currentUser && (currentUser.id === myProfile.userId || currentUser.email === myProfile.email)) {
        currentUser.name = editName.trim() || myProfile.name;
        currentUser.phone = editPhone.trim() || myProfile.phone;
        currentUser.address = editServiceArea.trim() || myProfile.serviceArea;
        store.setCurrentUser({ ...currentUser });
      }

      setSearchRadiusKm(rad);
      setProfileSaveSuccess(true);
      setIsEditingProfile(false);
      setIsEditModalOpen(false);
      setRadiusSaveFeedback(`Volunteer details and ${rad} km rescue radius saved successfully!`);
      setTimeout(() => {
        setProfileSaveSuccess(false);
        setRadiusSaveFeedback('');
      }, 4000);
    } catch (err: any) {
      alert(err.message || 'Error saving profile.');
    }
  };

  // Quick radius adjust (from slider, presets, or chips) with instant persistence
  const handleRadiusSliderChange = (newRadius: number) => {
    const val = Math.max(1, Math.min(100, Number(newRadius)));
    setSearchRadiusKm(val);
    setEditRadius(val);
    if (myProfile) {
      store.updateVolunteerProfile(myProfile.id, {
        serviceRadiusKm: val,
      });
      setRadiusSaveFeedback(`Rescue radius adjusted to ${val} km (Saved to profile)`);
      setTimeout(() => setRadiusSaveFeedback(''), 3000);
    }
  };

  // Click-to-toggle common certified skills
  const toggleSkillChip = (skillName: string) => {
    const currentList = editSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const exists = currentList.some((s) => s.toLowerCase() === skillName.toLowerCase());
    let updated: string[];
    if (exists) {
      updated = currentList.filter((s) => s.toLowerCase() !== skillName.toLowerCase());
    } else {
      updated = [...currentList, skillName];
    }
    setEditSkills(updated.join(', '));
  };

  const handleStatusTransition = (requestId: string, newStatus: RequestStatus) => {
    try {
      store.updateRequestStatus(requestId, newStatus, myProfile.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddFieldNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldNoteText.trim() || !activeTask) return;
    store.addFieldNote(activeTask.id, myProfile.id, myProfile.name, fieldNoteText, isBlocker);
    setFieldNoteText('');
    setIsBlocker(false);
  };

  const handleSubmitManpower = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) {
      alert('You must have an active mission to request additional manpower.');
      return;
    }
    store.createManpowerRequest({
      operationId: activeTask.operationId || 'OP-ACTIVE',
      requestId: activeTask.requestId,
      volunteerId: myProfile.id,
      volunteerName: myProfile.name,
      additionalVolunteersNeeded: Number(manpowerCount),
      reason: manpowerReason,
      requiredSkills: manpowerSkills.split(',').map((s) => s.trim()),
      urgency: manpowerUrgency,
      locationName: activeTask.locationName,
      lat: activeTask.lat,
      lng: activeTask.lng,
    });
    alert('Additional manpower request transmitted to Disaster EOC Command Room!');
    setManpowerReason('');
    setActiveTab('active-op');
  };

  const handleSubmitResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) {
      alert('You must have an active mission to request emergency resources.');
      return;
    }
    store.createResourceRequest({
      operationId: activeTask.operationId || 'OP-ACTIVE',
      requestId: activeTask.requestId,
      volunteerId: myProfile.id,
      volunteerName: myProfile.name,
      resourceCategory: resCategory,
      specificItem: resSpecificItem,
      quantityRequested: Number(resQuantity),
      urgency: resUrgency,
      deliveryLocation: activeTask.locationName,
      lat: activeTask.lat,
      lng: activeTask.lng,
      reason: resReason,
    });
    alert('Emergency resource request transmitted to Logistics Operations Desk!');
    setResReason('');
    setActiveTab('active-op');
  };

  const handleSubmitCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;
    try {
      const completedReqId = activeTask.requestId;
      store.submitCompletionReport(
        activeTask.id,
        {
          summary: completionSummary,
          rescuedCount: Number(rescuedCount),
          casualties: Number(casualtiesCount),
          hospitalTransfers: Number(hospitalTransfers),
          fieldNotes: 'Operation completed in accordance with emergency SOPs.',
        },
        true
      );
      setShowCompletionModal(false);
      setCompletionSummary('');
      alert(`Mission completed! ${completedReqId} has been updated in your Task History.`);
      setActiveTab('history');
    } catch (err: any) {
      alert(err.message || 'Error submitting completion report');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Volunteer 10-Item Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 p-4 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Volunteer Status & Radius Quick Card */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-2.5">
            {volunteers.length > 1 && (
              <div className="pb-2 border-b border-slate-700/60">
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                  Active Volunteer Account:
                </label>
                <select
                  value={selectedVolunteerId}
                  onChange={(e) => setSelectedVolunteerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 font-semibold"
                >
                  {volunteers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.serviceRadiusKm}km)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{myProfile?.name}</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                Rescue Unit
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              📍 {myProfile?.serviceArea}
            </div>

            {/* Read-Only or Active Availability Control */}
            <div className="pt-2 border-t border-slate-700/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Field Availability:
              </span>
              <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
                {(['AVAILABLE', 'BUSY', 'UNAVAILABLE'] as VolunteerStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleAvailabilityChange(st)}
                    className={`py-1 rounded text-center transition ${
                      myProfile?.availability === st
                        ? st === 'AVAILABLE'
                          ? 'bg-emerald-600 text-white'
                          : st === 'BUSY'
                          ? 'bg-blue-600 text-white'
                          : 'bg-rose-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'AVAILABLE' ? 'Ready' : st === 'BUSY' ? 'Busy' : 'Off'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Radius Pill & Edit Trigger in Sidebar */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Radius:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">{searchRadiusKm} km</span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 shadow-2xs"
                title="Edit volunteer details and rescue radius"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Radius</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Overview', icon: Users },
              { id: 'available', label: `Available Calls (${openTasks.length})`, icon: LifeBuoy },
              { id: 'active-op', label: 'Field Console', icon: Compass, highlight: !!activeTask },
              { id: 'my-tasks', label: `Assigned Tasks (${assignedTasks.length})`, icon: FileText },
              { id: 'history', label: `Task History (${completedHistoryTasks.length})`, icon: Clock },
              { id: 'map', label: 'Emergency Map', icon: MapPin },
              { id: 'request-manpower', label: 'Request Manpower', icon: UserPlus },
              { id: 'request-resources', label: 'Request Supplies', icon: Box },
              { id: 'profile', label: 'Profile & Radius', icon: Sliders },
              { id: 'notifications', label: `Notifications (${notifications.length})`, icon: Radio },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                    activeTab === item.id
                      ? 'bg-emerald-700 text-white font-bold shadow-md'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          Emergency Hotline: <strong>+91 98401 22334</strong>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
        {/* SECTION 1: OVERVIEW */}
        {activeTab === 'overview' && (() => {
          const openTasksWithinRadius = openTasks.filter(
            (t) => calculateDistanceKm(volLat, volLng, t.lat, t.lng) <= searchRadiusKm
          ).length;

          return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                  Field Console
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-2">
                  Welcome, Rescuer {myProfile?.name}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Base: <strong>{myProfile?.serviceArea}</strong> • Rescue Radius: <strong className="text-emerald-700">{searchRadiusKm} km</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Adjust Radius & Base</span>
                </button>

                {activeTask && (
                  <div className="bg-cyan-50 border border-cyan-200 p-2 rounded-xl flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <div className="text-[10px] text-cyan-800 font-bold uppercase">
                        Active Mission
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                        {activeTask.requestId}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('active-op')}
                      className="ml-1 px-2.5 py-1 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Console →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('my-tasks')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-400 transition"
              >
                <div className="text-xs text-slate-500 font-semibold">Assigned Tasks</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {assignedTasks.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Assigned to your unit →</div>
              </div>
              <div
                onClick={() => setActiveTab('active-op')}
                className="bg-white p-4 rounded-2xl border border-cyan-200 bg-cyan-50/20 shadow-xs cursor-pointer hover:border-cyan-400 transition"
              >
                <div className="text-xs text-cyan-800 font-semibold">Active Missions</div>
                <div className="text-2xl font-black text-cyan-700 mt-1">
                  {activeTask ? 1 : 0}
                </div>
                <div className="text-[10px] text-cyan-600 mt-0.5">Open field console →</div>
              </div>
              <div
                onClick={() => setActiveTab('history')}
                className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs cursor-pointer hover:border-emerald-400 transition"
              >
                <div className="text-xs text-emerald-800 font-semibold">Completed Missions</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {completedHistoryTasks.length}
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">View Task History →</div>
              </div>
              <div
                onClick={() => setActiveTab('available')}
                className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs cursor-pointer hover:border-amber-400 transition"
              >
                <div className="text-xs text-amber-800 font-semibold">Open Available Calls</div>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  {openTasks.length}
                </div>
                <div className="text-[10px] text-amber-600 mt-0.5">Browse available calls →</div>
              </div>
            </div>

            {/* Quick Actions & Recent Available Calls Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Nearby Emergencies Needing Rescuers</h3>
                  <p className="text-xs text-slate-500">Emergency calls ready for response within your sector.</p>
                </div>
                <button
                  onClick={() => setActiveTab('available')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  View All ({openTasks.length}) →
                </button>
              </div>

              {openTasks.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No pending emergencies right now. All reported calls are covered!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {openTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                          {task.requestId}
                        </span>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-slate-800">📍 {task.locationName}</div>
                        <p className="text-slate-600 line-clamp-2 mt-1">{task.description}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{task.affectedPeopleCount} people affected</span>
                        <button
                          onClick={() => {
                            try {
                              store.assignVolunteerToRequest(task.id, myProfile.id);
                              alert(`Accepted ${task.requestId}. Mobilization initiated!`);
                              setActiveTab('active-op');
                            } catch (err: any) {
                              alert(err.message || 'Failed to accept task');
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                        >
                          Accept & Mobilize →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          );
        })()}

        {/* SECTION 4: ACTIVE OPERATION CONSOLE (FIELD VIEW) */}
        {activeTab === 'active-op' && (
          <div className="space-y-6">
            {!activeTask ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-800">
                  No Active Operation Currently In Progress
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You are not currently deployed to an active task. Check your assigned tasks or browse available emergencies to accept an assignment.
                </p>
                <button
                  onClick={() => setActiveTab('my-tasks')}
                  className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  View My Assigned Tasks
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Mission Header */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded-lg">
                        {activeTask.requestId}
                      </span>
                      <PriorityBadge priority={activeTask.priority} />
                      <StatusBadge status={activeTask.status} />
                    </div>
                    <span className="text-xs text-slate-500">
                      Operation ID: <strong>{activeTask.operationId || 'OP-ACTIVE'}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
                    <div>
                      <span className="text-slate-400 block">Incident Location:</span>
                      <strong className="text-slate-900 text-sm">📍 {activeTask.locationName}</strong>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {activeTask.lat.toFixed(4)}, {activeTask.lng.toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Citizen / Caller:</span>
                      <strong className="text-slate-900 text-sm">{activeTask.citizenName}</strong>
                      <div className="text-blue-700 font-bold mt-0.5">
                        <a href={`tel:${activeTask.citizenPhone}`}>📞 {activeTask.citizenPhone}</a>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Affected Persons Trapped:</span>
                      <strong className="text-slate-900 text-sm">
                        👥 {activeTask.affectedPeopleCount} people
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      Situation Brief:
                    </span>
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                      {activeTask.description}
                    </p>
                  </div>

                  {/* Status Progression Workflow Buttons */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      Update Operation Progress:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleStatusTransition(activeTask.id, 'IN_PROGRESS')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          activeTask.status === 'IN_PROGRESS'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        🚗 En Route / Arrived On-Scene
                      </button>
                      <button
                        onClick={() => setShowCompletionModal(true)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Submit Completion Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tactical Actions: Manpower & Resources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                      <UserPlus className="w-5 h-5 text-red-600" />
                      Request Additional Manpower
                    </div>
                    <p className="text-xs text-slate-600">
                      Need extra swimmers, drivers, or medical triage personnel at your exact coordinates?
                    </p>
                    <button
                      onClick={() => setActiveTab('request-manpower')}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      Summon Reinforcements →
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                      <Box className="w-5 h-5 text-purple-600" />
                      Request Emergency Resources
                    </div>
                    <p className="text-xs text-slate-600">
                      Need motorized rescue boats, medical kits, generators, or rations?
                    </p>
                    <button
                      onClick={() => setActiveTab('request-resources')}
                      className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      Request Equipment / Supplies →
                    </button>
                  </div>
                </div>

                {/* Field Notes & Blocker Reporting */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Field Situation Log & Blocker Reports
                  </h3>

                  {/* Notes Feed */}
                  <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                    {activeTask.fieldNotes.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                        No field notes recorded yet. Add your first arrival update below.
                      </div>
                    ) : (
                      activeTask.fieldNotes.map((fn) => (
                        <div
                          key={fn.id}
                          className={`p-3 rounded-xl border ${
                            fn.isBlocker
                              ? 'bg-rose-50 border-rose-300 text-rose-950'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                            <span>
                              {fn.isBlocker ? '🚨 CRITICAL BLOCKER REPORTED' : fn.volunteerName}
                            </span>
                            <span className="text-slate-400">
                              {new Date(fn.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p>{fn.note}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddFieldNote} className="space-y-3 pt-2 border-t border-slate-100">
                    <textarea
                      rows={2}
                      value={fieldNoteText}
                      onChange={(e) => setFieldNoteText(e.target.value)}
                      placeholder="Add field observation, water level update, or access obstacle..."
                      className="w-full px-3 py-2 border rounded-xl text-xs"
                      required
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs text-red-700 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isBlocker}
                          onChange={(e) => setIsBlocker(e.target.checked)}
                          className="rounded text-red-600"
                        />
                        <span>Flag as Critical Blocker / Obstacle</span>
                      </label>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Log Field Note
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: AVAILABLE EMERGENCIES */}
        {activeTab === 'available' && (() => {
          // Calculate distance from volunteer's location to each emergency
          const tasksWithDistance = openTasks.map((task) => {
            const dist = calculateDistanceKm(volLat, volLng, task.lat, task.lng);
            return { ...task, distanceKm: dist };
          });

          // Filter by radius if enabled
          const filtered = tasksWithDistance.filter((t) => {
            if (!filterByRadius) return true;
            return t.distanceKm <= searchRadiusKm;
          });

          // Sort by distance if enabled
          if (sortByDistance) {
            filtered.sort((a, b) => a.distanceKm - b.distanceKm);
          }

          return (
            <div className="space-y-4">
              {/* Volunteer Rescue Center & Radius Control Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                      Proximity Dispatch Radar
                    </span>
                    <h2 className="text-lg font-black text-slate-900 mt-1">
                      Available Emergency Calls ({filtered.length} of {openTasks.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Discover rescues near your current coordinates. Adjust your operational radius dynamically below.
                    </p>
                  </div>

                  {/* Detect / Refresh Volunteer Location */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDetectVolunteerLocation}
                      disabled={locDetecting}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Locate className={`w-3.5 h-3.5 ${locDetecting ? 'animate-spin' : ''}`} />
                      <span>{locDetecting ? 'Detecting Location...' : 'Detect My Location'}</span>
                    </button>
                  </div>
                </div>

                {locFeedback && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{locFeedback}</span>
                  </div>
                )}

                {/* Volunteer Current Position Strip & Sector Quick Pick */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <span className="text-slate-500 text-[11px]">Your Current Field Base: </span>
                      <strong className="text-slate-900">{locationName}</strong>
                      <span className="text-slate-400 font-mono text-[10px] ml-1.5">
                        ({volLat.toFixed(4)}, {volLng.toFixed(4)})
                      </span>
                    </div>
                  </div>

                  {/* Quick Sector Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-semibold">Change Sector:</span>
                    <select
                      value={locationName}
                      onChange={(e) => {
                        const sec = POPULAR_SECTORS.find((s) => s.name === e.target.value);
                        if (sec) {
                          setVolLat(sec.lat);
                          setVolLng(sec.lng);
                          setLocationName(sec.name);
                          store.updateVolunteerProfile(myProfile.id, {
                            lat: sec.lat,
                            lng: sec.lng,
                            serviceArea: sec.name,
                          });
                        }
                      }}
                      className="bg-white border border-slate-300 text-slate-800 text-[11px] rounded-lg px-2 py-1 outline-hidden"
                    >
                      {POPULAR_SECTORS.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Interactive Radius Slider & Distance Controls */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-700" />
                      <label className="font-bold text-slate-900 text-xs">
                        Volunteer Rescue Radius:
                      </label>
                      <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-mono font-black text-xs rounded-lg shadow-2xs">
                        {searchRadiusKm} km
                      </span>
                    </div>

                    {/* Quick Radius Presets */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-500 mr-1">Presets:</span>
                      {[2, 5, 10, 15, 25, 50].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => handleRadiusSliderChange(preset)}
                          className={`px-2 py-0.5 rounded-md font-semibold transition ${
                            searchRadiusKm === preset
                              ? 'bg-emerald-700 text-white font-bold'
                              : 'bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {preset}km
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={searchRadiusKm}
                    onChange={(e) => handleRadiusSliderChange(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-2 bg-emerald-200 rounded-lg cursor-pointer"
                  />

                  {/* Toggles: Filter within radius & Sort by Distance */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-emerald-200/60">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={filterByRadius}
                        onChange={(e) => setFilterByRadius(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Strictly show rescues within my {searchRadiusKm} km radius only</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={sortByDistance}
                        onChange={(e) => setSortByDistance(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Sort nearest first (by distance)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto text-xl">
                    🔍
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    No emergency calls found within {searchRadiusKm} km
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try increasing your rescue search radius slider above (e.g. to 25 km or 50 km) or uncheck the radius filter to view all available incidents across the city.
                  </p>
                  <button
                    onClick={() => {
                      setFilterByRadius(false);
                      setSearchRadiusKm(30);
                    }}
                    className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Expand Search to All Rescues
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((task) => {
                    const isWithin = task.distanceKm <= searchRadiusKm;
                    return (
                      <div
                        key={task.id}
                        className={`bg-white p-5 rounded-2xl border shadow-xs space-y-3 transition ${
                          isWithin
                            ? 'border-emerald-300 hover:border-emerald-400'
                            : 'border-slate-200 opacity-90'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">
                              {task.requestId}
                            </span>
                            <PriorityBadge priority={task.priority} />
                            <StatusBadge status={task.status} />

                            {/* Distance Badge */}
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${
                                task.distanceKm <= 3
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : task.distanceKm <= 10
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              <Navigation className="w-3 h-3" />
                              <span>{task.distanceKm} km away</span>
                            </span>
                          </div>

                          <span className="text-xs text-slate-400">
                            Reported: {new Date(task.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="text-xs space-y-1">
                          <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                            <span>
                              {task.emergencyType} Emergency — {task.affectedPeopleCount} people affected
                            </span>
                            {isWithin ? (
                              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                ✓ Inside Your Service Radius
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-slate-400">
                                Outside {searchRadiusKm}km Radius
                              </span>
                            )}
                          </div>
                          <div>📍 Location: <strong>{task.locationName}</strong></div>
                          <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {task.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            Direct distance: <strong>~{task.distanceKm} km</strong> from {locationName}
                          </span>
                          <button
                            onClick={() => {
                              try {
                                if (!myProfile) {
                                  alert('Volunteer profile not found. Please log in or select a volunteer.');
                                  return;
                                }
                                store.assignVolunteerToRequest(task.id, myProfile.id);
                                alert(`You have accepted ${task.requestId}. Mobilization initiated!`);
                                setActiveTab('active-op');
                              } catch (err: any) {
                                alert(err.message || 'Failed to accept task.');
                              }
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Accept Assignment & Mobilize</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* SECTION 3: MY ASSIGNED TASKS */}
        {activeTab === 'my-tasks' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-black text-slate-900">
                My Assigned Tactical Missions ({assignedTasks.length})
              </h2>
              <p className="text-xs text-slate-500">
                Official missions dispatched to your unit by Disaster Control.
              </p>
            </div>

            <div className="space-y-3">
              {assignedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded">
                      {task.requestId}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-900 text-sm">{task.locationName}</div>
                    <div>{task.description}</div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        if (myProfile) {
                          store.updateVolunteerProfile(myProfile.id, {
                            activeOperationId: task.requestId,
                          });
                        }
                        setActiveTab('active-op');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Open in Field Console →
                    </button>
                    <button
                      onClick={() => {
                        if (myProfile) {
                          store.updateVolunteerProfile(myProfile.id, {
                            activeOperationId: task.requestId,
                          });
                        }
                        setShowCompletionModal(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete Mission</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: REQUEST ADDITIONAL MANPOWER */}
        {activeTab === 'request-manpower' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-4">
            <div className="border-b pb-3">
              <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2.5 py-0.5 rounded">
                Tactical Force Mobilization
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Request Additional Manpower
              </h2>
              <p className="text-xs text-slate-500">
                Summon reinforcement rescue squads when ground conditions exceed your unit's safe capacity.
              </p>
            </div>

            <form onSubmit={handleSubmitManpower} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Active Mission Reference:
                </label>
                <div className="p-3 bg-slate-50 border rounded-xl text-slate-800 font-mono font-bold">
                  {activeTask ? `${activeTask.requestId} — ${activeTask.locationName}` : 'No active mission selected'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Number of Additional Rescuers Needed *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={manpowerCount}
                    onChange={(e) => setManpowerCount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urgency Level</label>
                  <select
                    value={manpowerUrgency}
                    onChange={(e) => setManpowerUrgency(e.target.value as Priority)}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-red-600"
                  >
                    <option value="CRITICAL">CRITICAL (Immediate Life Threat)</option>
                    <option value="HIGH">HIGH (Urgent Assistance)</option>
                    <option value="MEDIUM">MEDIUM (Support Needed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Required Skillset / Certifications *
                </label>
                <input
                  type="text"
                  value={manpowerSkills}
                  onChange={(e) => setManpowerSkills(e.target.value)}
                  placeholder="e.g. Certified Swimmer, Boat Driver, EMT Paramedic"
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason for Request *
                </label>
                <textarea
                  rows={3}
                  value={manpowerReason}
                  onChange={(e) => setManpowerReason(e.target.value)}
                  required
                  placeholder="e.g. Current at road junction is too strong for solo extraction. Need 2 swimmers to hold safety lifeline."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!activeTask}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Transmit Manpower Request to EOC Command
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION 7: REQUEST RESOURCES */}
        {activeTab === 'request-resources' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-4">
            <div className="border-b pb-3">
              <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded">
                Logistics Dispatch Channel
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Request Emergency Resources & Equipment
              </h2>
              <p className="text-xs text-slate-500">
                Order boats, pumps, trauma kits, or rations directly to your staging coordinates.
              </p>
            </div>

            <form onSubmit={handleSubmitResource} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Resource Category *</label>
                  <select
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value as ResourceCategory)}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Boats">Boats (Inflatable / Motor)</option>
                    <option value="Vehicles">Vehicles (4x4 High-Clearance)</option>
                    <option value="Generators">Generators & Power Units</option>
                    <option value="Food">Food / Rations</option>
                    <option value="Water">Clean Drinking Water</option>
                    <option value="Medical supplies">Medical & Trauma Supplies</option>
                    <option value="Rescue equipment">Rescue Gear & Life Vests</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity Requested *</label>
                  <input
                    type="number"
                    min={1}
                    value={resQuantity}
                    onChange={(e) => setResQuantity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specific Item Title *</label>
                <input
                  type="text"
                  value={resSpecificItem}
                  onChange={(e) => setResSpecificItem(e.target.value)}
                  placeholder="e.g. 8-person motorized dinghy with outboard motor"
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Urgency Level</label>
                <select
                  value={resUrgency}
                  onChange={(e) => setResUrgency(e.target.value as Priority)}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-red-600"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason & Staging Notes *</label>
                <textarea
                  rows={3}
                  value={resReason}
                  onChange={(e) => setResReason(e.target.value)}
                  placeholder="e.g. Submerged streets prevent foot approach. Deliver to north ramp staging point."
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!activeTask}
                  className="px-6 py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Order Dispatch from Logistics Hub
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION 5: MAP */}
        {activeTab === 'map' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Tactical Sector Map & Rescuer Locator
                </h2>
                <p className="text-xs text-slate-500">
                  Live interactive map displaying your {searchRadiusKm} km coverage perimeter and active emergencies.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details & Radius</span>
                </button>
                <button
                  onClick={handleDetectVolunteerLocation}
                  disabled={locDetecting}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
                >
                  <Locate className={`w-3.5 h-3.5 ${locDetecting ? 'animate-spin' : ''}`} />
                  <span>Update Location</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Radius Control Bar on Map */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">Live Coverage Circle: </span>
                  <span className="font-mono font-black text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                    {searchRadiusKm} km
                  </span>
                  <span className="text-slate-500 text-[11px] ml-2">
                    (Visualized on map below as green dashed perimeter around {locationName})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={searchRadiusKm}
                  onChange={(e) => handleRadiusSliderChange(Number(e.target.value))}
                  className="w-36 sm:w-48 accent-emerald-600 h-2 bg-emerald-200 rounded-lg cursor-pointer"
                  title="Drag slider to expand or shrink rescue radius"
                />
                <div className="flex gap-1 text-[10px]">
                  {[5, 15, 25, 50].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleRadiusSliderChange(preset)}
                      className={`px-2 py-0.5 rounded font-bold transition ${
                        searchRadiusKm === preset
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {preset}k
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <InteractiveMap
              requests={requests}
              volunteers={volunteers}
              camps={store.getReliefCamps()}
              resources={store.getResources()}
              height="550px"
              volunteerLocation={{
                lat: volLat,
                lng: volLng,
                radiusKm: searchRadiusKm,
                name: myProfile?.name || 'You (Volunteer)',
              }}
              showRadiusCircle={true}
            />
          </div>
        )}

        {/* SECTION 8: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-black text-slate-900">
              Volunteer Mission Notifications
            </h2>
            <div className="space-y-2 text-xs">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 border rounded-xl">
                  <div className="font-bold text-slate-900">{n.title}</div>
                  <p className="text-slate-600">{n.message}</p>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {new Date(n.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 9: HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Field Mission Record
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {completedHistoryTasks.length} missions
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Completed Task History
                </h2>
                <p className="text-xs text-slate-500">
                  Official log of emergency missions completed by {myProfile?.name}.
                </p>
              </div>
            </div>

            {completedHistoryTasks.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                  📋
                </div>
                <h3 className="font-bold text-sm text-slate-700">No Completed Tasks Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you finish an assigned emergency and submit your completion report, it will automatically update in this task history.
                </p>
                <button
                  onClick={() => setActiveTab('my-tasks')}
                  className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Check Assigned Tasks
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {completedHistoryTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-5 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 border border-emerald-200 rounded-2xl shadow-xs space-y-3 transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                          {task.requestId}
                        </span>
                        <PriorityBadge priority={task.priority} />
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {task.emergencyType} Emergency
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {task.status === 'CLOSED'
                            ? 'Verified & Closed'
                            : 'Completed (Resolution Pending)'}
                        </span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Location</span>
                        <strong className="text-slate-800">📍 {task.locationName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Citizen / Caller</span>
                        <strong className="text-slate-800">👤 {task.citizenName}</strong>
                        <span className="text-slate-500 text-[11px] block">{task.citizenPhone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">People Affected</span>
                        <strong className="text-slate-800">👥 {task.affectedPeopleCount} people</strong>
                      </div>
                    </div>

                    {task.completionReport && (
                      <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl text-xs space-y-2">
                        <div className="flex items-center justify-between text-emerald-950 font-bold text-[11px]">
                          <span>MISSION COMPLETION REPORT</span>
                          <span className="text-slate-500 font-normal">
                            Completed: {new Date(task.completionReport.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-800 italic">
                          "{task.completionReport.summary}"
                        </p>
                        <div className="flex flex-wrap gap-3 pt-1 border-t border-emerald-200/60 text-[11px] font-semibold text-emerald-900">
                          <span>✓ Rescued: <strong>{task.completionReport.rescuedCount}</strong></span>
                          {task.completionReport.hospitalTransfers > 0 && (
                            <span>🏥 Hospital Transfers: <strong>{task.completionReport.hospitalTransfers}</strong></span>
                          )}
                          {task.completionReport.casualties > 0 && (
                            <span className="text-rose-700">⚠️ Casualties: <strong>{task.completionReport.casualties}</strong></span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 10: MY PROFILE & COVERAGE RADIUS */}
        {activeTab === 'profile' && (() => {
          const openTasksWithinRadius = openTasks.filter(
            (t) => calculateDistanceKm(volLat, volLng, t.lat, t.lng) <= searchRadiusKm
          ).length;

          return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6 text-xs font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Field Identity & Perimeter
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    ID: {myProfile.id}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  Volunteer Profile & Coverage Radius
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your contact details, certified skills, operational base, and real-time rescue dispatch radius.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {volunteers.length > 1 && (
                  <select
                    value={selectedVolunteerId}
                    onChange={(e) => setSelectedVolunteerId(e.target.value)}
                    className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-2.5 py-2 font-bold"
                  >
                    {volunteers.map((v) => (
                      <option key={v.id} value={v.id}>
                        Switch: {v.name}
                      </option>
                    ))}
                  </select>
                )}

                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile & Radius</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </div>

            {profileSaveSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl font-bold flex items-center gap-2.5 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Volunteer details and rescue radius have been saved successfully and synchronized across dispatch consoles!</span>
              </div>
            )}

            {/* Coverage Radius Interactive Tuner Box (Prominently featured) */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 p-5 rounded-2xl space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Rescue Coverage Radius Setting
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Controls proximity dispatch matching for available emergencies around your field base.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Active Radius:</span>
                  <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-xl border border-emerald-300 shadow-2xs">
                    <span className="font-mono font-black text-emerald-700 text-base">{searchRadiusKm}</span>
                    <span className="text-xs text-emerald-600 font-bold">km</span>
                  </div>
                </div>
              </div>

              {/* Slider + Numeric Input */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={searchRadiusKm}
                    onChange={(e) => handleRadiusSliderChange(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 h-2.5 bg-emerald-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={searchRadiusKm}
                      onChange={(e) => handleRadiusSliderChange(Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-white border border-emerald-300 text-emerald-800 font-mono font-bold rounded-lg text-center"
                    />
                    <span className="text-xs font-semibold text-slate-500">km</span>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 font-semibold mr-1">Radius Presets:</span>
                  {RADIUS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleRadiusSliderChange(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        searchRadiusKm === preset
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {preset} km
                    </button>
                  ))}
                </div>

                {/* Impact Indicator */}
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs text-slate-700">
                  <span>
                    ⚡ <strong>{openTasksWithinRadius}</strong> of <strong>{openTasks.length}</strong> available emergency rescues fall inside your {searchRadiusKm} km perimeter.
                  </span>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-emerald-700 hover:underline font-bold text-[11px] ml-2 shrink-0"
                  >
                    View Radius Circle on Map →
                  </button>
                </div>
              </div>
            </div>

            {!isEditingProfile ? (
              /* Profile Details Overview View */
              <div className="space-y-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Rescuer Full Name</span>
                      <div className="font-black text-slate-900 text-base">{myProfile.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Availability:</span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        myProfile.availability === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : myProfile.availability === 'BUSY'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        {myProfile.availability === 'AVAILABLE' ? 'Ready for Deployment' : myProfile.availability === 'BUSY' ? 'Engaged on Mission' : 'Off-Duty Standby'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Mobile Phone</span>
                      <div className="text-slate-900 font-bold text-sm mt-0.5">📞 {myProfile.phone}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Official Email</span>
                      <div className="text-slate-800 font-medium text-xs mt-0.5 truncate">✉️ {myProfile.email}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Base Sector / Coordinates</span>
                      <div className="text-slate-900 font-semibold text-xs mt-0.5">📍 {myProfile.serviceArea}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {myProfile.lat?.toFixed(4)}, {myProfile.lng?.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  {myProfile.experience && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Field Experience & Bio</span>
                      <p className="text-slate-700 text-xs mt-1 leading-relaxed">
                        {myProfile.experience}
                      </p>
                    </div>
                  )}

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Certified Skills & Tactical Capabilities ({myProfile.skills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {myProfile.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Emergency Next-of-Kin Contact</span>
                    <div className="text-slate-800 font-semibold mt-1">
                      <strong>{myProfile.emergencyContact.name}</strong> ({myProfile.emergencyContact.relation || 'Family'}):{' '}
                      <span className="text-blue-700 font-bold">{myProfile.emergencyContact.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Volunteer Details & Radius</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Editable Profile Form with Comprehensive Fields */
              <form onSubmit={handleSaveVolunteerProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Volunteer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Kavitha Raman"
                      className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +91 98840 12345"
                      className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Email Address *</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="e.g. volunteer@chennaidisaster.org"
                      className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Rescue Coverage Radius (km) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        required
                        value={editRadius}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditRadius(val);
                          setSearchRadiusKm(val);
                        }}
                        className="w-24 px-3 py-2 border rounded-xl bg-white font-mono font-bold text-emerald-700 text-xs text-center"
                      />
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={editRadius}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditRadius(val);
                          setSearchRadiusKm(val);
                        }}
                        className="flex-1 accent-emerald-600 h-2 bg-emerald-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Base Sector & Location Controls */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700">Deployment Base / Sector *</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-semibold">Quick Sector:</span>
                      <select
                        value={editServiceArea}
                        onChange={(e) => {
                          const sec = POPULAR_SECTORS.find((s) => s.name === e.target.value);
                          setEditServiceArea(e.target.value);
                          if (sec) {
                            setVolLat(sec.lat);
                            setVolLng(sec.lng);
                            setLocationName(sec.name);
                          }
                        }}
                        className="bg-white border text-slate-800 text-[11px] rounded-lg px-2 py-1"
                      >
                        <option value="">Select popular sector...</option>
                        {POPULAR_SECTORS.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={editServiceArea}
                      onChange={(e) => setEditServiceArea(e.target.value)}
                      placeholder="e.g. South Chennai, Velachery & Tambaram"
                      className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleDetectVolunteerLocation}
                      disabled={locDetecting}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl whitespace-nowrap text-xs flex items-center gap-1.5 shadow-2xs transition"
                      title="Auto-detect current GPS location"
                    >
                      <Locate className={`w-3.5 h-3.5 ${locDetecting ? 'animate-spin' : ''}`} />
                      <span>{locDetecting ? 'Detecting...' : 'Detect GPS'}</span>
                    </button>
                  </div>
                </div>

                {/* Experience & Bio */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Field Experience / Specialized Training Bio
                  </label>
                  <textarea
                    rows={2}
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    placeholder="e.g. 4 years disaster volunteer, certified rescue diver, completed Red Cross BLS triage training."
                    className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                  />
                </div>

                {/* Skills Interactive Tag Selector */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700">
                      Certified Skills & Specializations *
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Click chips to toggle or type below
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_VOLUNTEER_SKILLS.map((skill) => {
                      const isSelected = editSkills
                        .toLowerCase()
                        .includes(skill.toLowerCase());
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkillChip(skill)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{isSelected ? '✓' : '+'}</span>
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    required
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    placeholder="e.g. Water Rescue, First Aid, Boat Operation, Swimmer"
                    className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold"
                  />
                </div>

                {/* Field Availability Selector */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Field Readiness / Availability Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['AVAILABLE', 'BUSY', 'UNAVAILABLE'] as VolunteerStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditAvailability(st)}
                        className={`py-2 px-3 rounded-xl text-center text-xs font-bold border transition ${
                          editAvailability === st
                            ? st === 'AVAILABLE'
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : st === 'BUSY'
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                              : 'bg-rose-600 text-white border-rose-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {st === 'AVAILABLE' ? '🟢 Ready (Available)' : st === 'BUSY' ? '🔵 Busy on Mission' : '🔴 Off-Duty Standby'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 text-xs block">
                    Next-of-Kin Emergency Contact (Safety Protocol)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1 text-[11px] font-semibold">Contact Name *</label>
                      <input
                        type="text"
                        required
                        value={editEmergencyName}
                        onChange={(e) => setEditEmergencyName(e.target.value)}
                        placeholder="e.g. Suresh Raman"
                        className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 text-[11px] font-semibold">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={editEmergencyPhone}
                        onChange={(e) => setEditEmergencyPhone(e.target.value)}
                        placeholder="e.g. +91 98840 99887"
                        className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 text-[11px] font-semibold">Relationship</label>
                      <select
                        value={editEmergencyRelation}
                        onChange={(e) => setEditEmergencyRelation(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                      >
                        <option value="Family">Family</option>
                        <option value="Parent">Parent</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Friend">Friend</option>
                        <option value="Colleague">Colleague</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 text-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Volunteer Details & Radius</span>
                  </button>
                </div>
              </form>
            )}
          </div>
          );
        })()}
      </main>

      {/* MODAL: COMPLETION REPORT */}
      {showCompletionModal && activeTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900 text-emerald-800">
              Submit Field Completion Report ({activeTask.requestId})
            </h3>
            <form onSubmit={handleSubmitCompletion} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Surviving Evacuees / Rescued Count *</label>
                <input
                  type="number"
                  min={0}
                  value={rescuedCount}
                  onChange={(e) => setRescuedCount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Hospital Transfers</label>
                  <input
                    type="number"
                    min={0}
                    value={hospitalTransfers}
                    onChange={(e) => setHospitalTransfers(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Casualties (if any)</label>
                  <input
                    type="number"
                    min={0}
                    value={casualtiesCount}
                    onChange={(e) => setCasualtiesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Mission Summary & Relocation Details *</label>
                <textarea
                  rows={3}
                  value={completionSummary}
                  onChange={(e) => setCompletionSummary(e.target.value)}
                  placeholder="e.g. All 5 individuals safely evacuated via boat and transferred to St. Peter Relief Camp."
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompletionModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-600 text-white rounded-xl shadow-md"
                >
                  Submit for Government Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: QUICK EDIT VOLUNTEER DETAILS & RADIUS */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-xs my-8 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Quick Profile & Perimeter Editor
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Edit Volunteer Details & Coverage Radius
                </h3>
                <p className="text-[11px] text-slate-500">
                  Update your contact info, skills, deployment base, and rescue radius.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVolunteerProfile} className="space-y-4">
              {/* Coverage Radius setting */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-700" />
                    <label className="font-bold text-slate-900 text-xs">
                      Rescue Coverage Radius (km) *
                    </label>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-black text-emerald-800 text-sm">
                    <span>{editRadius} km</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={editRadius}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditRadius(val);
                      setSearchRadiusKm(val);
                    }}
                    className="flex-1 accent-emerald-600 h-2 bg-emerald-200 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editRadius}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditRadius(val);
                      setSearchRadiusKm(val);
                    }}
                    className="w-16 px-2 py-1 bg-white border border-emerald-300 font-mono font-bold text-center rounded-lg text-emerald-800"
                  />
                </div>

                <div className="flex flex-wrap gap-1 text-[10px]">
                  <span className="text-slate-500 py-0.5 mr-1 font-semibold">Presets:</span>
                  {RADIUS_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setEditRadius(p);
                        setSearchRadiusKm(p);
                      }}
                      className={`px-2 py-0.5 rounded font-bold transition ${
                        editRadius === p
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {p}km
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  />
                </div>
              </div>

              {/* Email & Sector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Deployment Base *</label>
                    <select
                      value={editServiceArea}
                      onChange={(e) => {
                        const sec = POPULAR_SECTORS.find((s) => s.name === e.target.value);
                        setEditServiceArea(e.target.value);
                        if (sec) {
                          setVolLat(sec.lat);
                          setVolLng(sec.lng);
                          setLocationName(sec.name);
                        }
                      }}
                      className="text-[10px] bg-slate-50 border rounded px-1.5 py-0.5"
                    >
                      <option value="">Popular sector...</option>
                      {POPULAR_SECTORS.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      value={editServiceArea}
                      onChange={(e) => setEditServiceArea(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleDetectVolunteerLocation}
                      disabled={locDetecting}
                      className="px-2.5 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-[10px] shrink-0 flex items-center gap-1"
                      title="Detect GPS"
                    >
                      <Locate className={`w-3 h-3 ${locDetecting ? 'animate-spin' : ''}`} />
                      <span>GPS</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio & Skills */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rescue Experience / Bio</label>
                <textarea
                  rows={2}
                  value={editExperience}
                  onChange={(e) => setEditExperience(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white text-xs"
                />
              </div>

              {/* Skills Interactive Tag Selector */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-[11px] block">
                  Certified Skills (click to toggle):
                </span>
                <div className="flex flex-wrap gap-1">
                  {COMMON_VOLUNTEER_SKILLS.map((skill) => {
                    const isSelected = editSkills.toLowerCase().includes(skill.toLowerCase());
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkillChip(skill)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  required
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  placeholder="Water Rescue, First Aid, Boat Operation"
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Availability</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['AVAILABLE', 'BUSY', 'UNAVAILABLE'] as VolunteerStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditAvailability(st)}
                      className={`py-1.5 rounded-xl text-center text-xs font-bold border transition ${
                        editAvailability === st
                          ? st === 'AVAILABLE'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : st === 'BUSY'
                            ? 'bg-blue-600 text-white border-blue-700'
                            : 'bg-rose-600 text-white border-rose-700'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {st === 'AVAILABLE' ? '🟢 Ready' : st === 'BUSY' ? '🔵 Busy' : '🔴 Off-Duty'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-[11px] block">Emergency Contact:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-0.5 text-[10px]">Name *</label>
                    <input
                      type="text"
                      required
                      value={editEmergencyName}
                      onChange={(e) => setEditEmergencyName(e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5 text-[10px]">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={editEmergencyPhone}
                      onChange={(e) => setEditEmergencyPhone(e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5 text-[10px]">Relation</label>
                    <select
                      value={editEmergencyRelation}
                      onChange={(e) => setEditEmergencyRelation(e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg bg-white"
                    >
                      <option value="Family">Family</option>
                      <option value="Parent">Parent</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Colleague">Colleague</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Volunteer Details & Radius</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING SUCCESS FEEDBACK TOAST */}
      {radiusSaveFeedback && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-600 flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{radiusSaveFeedback}</span>
          <button
            onClick={() => setRadiusSaveFeedback('')}
            className="ml-2 text-emerald-300 hover:text-white p-1 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

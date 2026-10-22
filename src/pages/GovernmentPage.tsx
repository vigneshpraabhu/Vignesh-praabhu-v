import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import {
  EmergencyRequest,
  VolunteerProfile,
  ResourceItem,
  ReliefCamp,
  Alert,
  ManpowerRequest,
  ResourceRequest,
  Priority,
  RequestStatus,
  DashboardStats,
  User,
} from '../types';
import { PriorityBadge, StatusBadge } from '../components/common/PriorityBadge';
import { InteractiveMap } from '../components/common/InteractiveMap';
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Compass,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Layers,
  MapPin,
  Home,
  Box,
  Radio,
  FileBarChart,
  Settings,
  ChevronRight,
  UserPlus,
  RefreshCw,
  Send,
  LifeBuoy,
  Eye,
  CheckCheck,
  Flame,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const GovernmentPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [stats, setStats] = useState<DashboardStats>(store.getDashboardStats());
  const [requests, setRequests] = useState<EmergencyRequest[]>(store.getRequests());
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>(store.getVolunteers());
  const [resources, setResources] = useState<ResourceItem[]>(store.getResources());
  const [camps, setCamps] = useState<ReliefCamp[]>(store.getReliefCamps());
  const [alerts, setAlerts] = useState<Alert[]>(store.getAlerts());
  const [manpowerReqs, setManpowerReqs] = useState<ManpowerRequest[]>(store.getManpowerRequests());
  const [resourceReqs, setResourceReqs] = useState<ResourceRequest[]>(store.getResourceRequests());

  // Navigation
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'requests'
    | 'map'
    | 'volunteers'
    | 'resources'
    | 'camps'
    | 'operations'
    | 'manpower'
    | 'escalated'
    | 'alerts'
    | 'reports'
  >('overview');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<EmergencyRequest | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAssignVolModal, setShowAssignVolModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [overridePriority, setOverridePriority] = useState<Priority>('CRITICAL');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [closeOfficialNotes, setCloseOfficialNotes] = useState('');

  // Camp Form
  const [newCampName, setNewCampName] = useState('');
  const [newCampAddress, setNewCampAddress] = useState('');
  const [newCampCapacity, setNewCampCapacity] = useState(300);
  const [newCampContact, setNewCampContact] = useState('');
  const [newCampPhone, setNewCampPhone] = useState('+91 94444 88990');
  const [showAddCamp, setShowAddCamp] = useState(false);

  // Alert Form
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<Alert['alertType']>('Flood warning');
  const [alertSeverity, setAlertSeverity] = useState<Priority>('HIGH');
  const [alertArea, setAlertArea] = useState('Velachery & Adyar Basin');
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setStats(store.getDashboardStats());
      setRequests(store.getRequests());
      setVolunteers(store.getVolunteers());
      setResources(store.getResources());
      setCamps(store.getReliefCamps());
      setAlerts(store.getAlerts());
      setManpowerReqs(store.getManpowerRequests());
      setResourceReqs(store.getResourceRequests());
    });
    return unsub;
  }, []);

  // Filtered Requests Table
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || r.emergencyType === typeFilter;
    return matchesSearch && matchesPriority && matchesStatus && matchesType;
  });

  const escalatedList = requests.filter((r) => r.isEscalated && r.status !== 'CLOSED');

  // Actions
  const handleVerify = () => {
    if (!selectedRequest) return;
    store.verifyRequest(
      selectedRequest.id,
      currentUser?.name || 'SDMA Operations Officer',
      overridePriority
    );
    setShowVerifyModal(false);
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectReason.trim()) {
      alert('Please state a reason for rejecting or archiving this request.');
      return;
    }
    store.rejectRequest(
      selectedRequest.id,
      currentUser?.name || 'SDMA Operations Officer',
      rejectReason
    );
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  const handleAssignVolunteer = () => {
    if (!selectedRequest || !selectedVolunteerId) {
      alert('Please choose a volunteer.');
      return;
    }
    try {
      store.assignVolunteerToRequest(selectedRequest.id, selectedVolunteerId);
      setShowAssignVolModal(false);
      setSelectedRequest(null);
      setSelectedVolunteerId('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCloseRequest = () => {
    if (!selectedRequest) return;
    store.closeCompletedRequest(
      selectedRequest.id,
      currentUser?.name || 'Dr. Rajesh Sundaram (IAS)',
      closeOfficialNotes
    );
    setShowCloseModal(false);
    setSelectedRequest(null);
    setCloseOfficialNotes('');
  };

  const handleCreateCamp = (e: React.FormEvent) => {
    e.preventDefault();
    store.createReliefCamp({
      name: newCampName,
      address: newCampAddress,
      lat: 12.98,
      lng: 80.22,
      totalCapacity: Number(newCampCapacity),
      currentOccupancy: 0,
      bedAvailability: Number(newCampCapacity),
      foodAvailability: true,
      waterAvailability: true,
      medicalSupport: true,
      contactPerson: newCampContact || 'Relief Officer',
      contactPhone: newCampPhone,
      operatingStatus: 'OPERATIONAL',
    });
    setShowAddCamp(false);
    setNewCampName('');
    setNewCampAddress('');
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    store.createAlert({
      title: alertTitle,
      message: alertMessage,
      alertType,
      severity: alertSeverity,
      affectedArea: alertArea,
      authorName: currentUser?.name || 'Disaster EOC Bureau',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      active: true,
    });
    setShowAlertModal(false);
    setAlertTitle('');
    setAlertMessage('');
  };

  const handleFulfillManpower = (mpr: ManpowerRequest) => {
    const availableVol = volunteers.find((v) => v.availability === 'AVAILABLE');
    if (!availableVol) {
      alert('No available volunteers in pool. Please mobilize off-duty personnel.');
      return;
    }
    store.assignManpowerVolunteers(mpr.id, [availableVol.id], 'Reinforcement unit mobilized by EOC.');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Tactical Dark Navy Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 p-4 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="px-2 py-1">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>SDMA EOC Command</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Incident Commander: <strong>{currentUser?.name || 'Dr. Rajesh Sundaram'}</strong>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: FileBarChart },
              { id: 'requests', label: `Emergency Requests (${requests.length})`, icon: LifeBuoy },
              { id: 'map', label: 'GIS Operations Map', icon: Compass },
              { id: 'volunteers', label: `Volunteer Force (${volunteers.length})`, icon: Users },
              { id: 'manpower', label: `Manpower Reqs (${manpowerReqs.length})`, icon: UserPlus },
              { id: 'resources', label: `Resource Assets (${resources.length})`, icon: Box },
              { id: 'camps', label: `Relief Camps (${camps.length})`, icon: Home },
              { id: 'escalated', label: `Escalated Queue (${escalatedList.length})`, icon: Flame, badge: escalatedList.length > 0 },
              { id: 'alerts', label: `Public Advisories (${alerts.length})`, icon: Radio },
              { id: 'reports', label: 'Analytics & Reports', icon: TrendingUp },
            ].map((nav) => {
              const Icon = nav.icon;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                    activeTab === nav.id
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/50'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{nav.label}</span>
                  </div>
                  {nav.badge && (
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tactical Control Utilities */}
        <div className="pt-4 border-t border-slate-800 text-xs space-y-2">
          <button
            onClick={() => {
              const count = store.checkEscalations(0.1); // Force immediate escalation of any unassigned critical
              alert(`Escalation check complete! ${count} critical item(s) escalated.`);
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Check SLA Escalations
          </button>
          <div className="text-[10px] text-slate-500 text-center">
            System Clock: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </aside>

      {/* Main Tactical Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
        {/* Escalated Emergency Emergency Alert Banner */}
        {escalatedList.length > 0 && (
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-lg border border-red-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-800 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-black text-sm uppercase tracking-wider">
                  ⚠️ CRITICAL SLA BREACH: {escalatedList.length} Emergency Request(s) Escalated!
                </div>
                <div className="text-xs text-red-100">
                  {escalatedList[0].requestId} ({escalatedList[0].locationName}) has remained unassigned beyond emergency response threshold.
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('escalated')}
              className="px-4 py-2 bg-white text-red-700 font-bold rounded-xl text-xs hover:bg-red-50 shrink-0 transition"
            >
              Resolve Escalations
            </button>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Disaster Control Room Operations Center
              </h1>
              <p className="text-xs text-slate-500">
                Live situational picture across coastal sectors and evacuation zones.
              </p>
            </div>

            {/* Actual Database Counts Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500 font-medium">Total Requests</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalRequests}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Database total</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-amber-700 font-medium">Pending Triage</div>
                <div className="text-2xl font-black text-amber-600 mt-1">{stats.pendingRequests}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Awaiting review</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-red-700 font-medium">Critical Priority</div>
                <div className="text-2xl font-black text-red-600 mt-1">{stats.criticalRequests}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Life-threatening</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-rose-700 font-medium">Escalated SLA</div>
                <div className="text-2xl font-black text-rose-600 mt-1">{stats.escalatedRequests}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Time exceeded</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-cyan-700 font-medium">Active Operations</div>
                <div className="text-2xl font-black text-cyan-600 mt-1">{stats.activeRescueOperations}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Units in field</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-emerald-700 font-medium">Available Rescuers</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{stats.availableVolunteers}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Ready for dispatch</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-600 font-medium">Engaged Rescuers</div>
                <div className="text-2xl font-black text-slate-800 mt-1">{stats.busyVolunteers}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">On missions</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-purple-700 font-medium">Ready Resources</div>
                <div className="text-2xl font-black text-purple-600 mt-1">{stats.availableResources}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Boats, trucks, kits</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-600 font-medium">Relief Camps</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{stats.registeredReliefCamps}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Safe shelters open</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-blue-700 font-medium">Field Manpower Reqs</div>
                <div className="text-2xl font-black text-blue-600 mt-1">{manpowerReqs.length}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Reinforcements needed</div>
              </div>
            </div>

            {/* Tactical Map Snapshot & Urgent Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    Live Spatial Overview (Chennai / Coastal Belt)
                  </h3>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Expand GIS Map <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <InteractiveMap
                  requests={requests}
                  volunteers={volunteers}
                  camps={camps}
                  resources={resources}
                  height="360px"
                  onSelectRequest={(r) => {
                    setSelectedRequest(r);
                    setShowVerifyModal(true);
                  }}
                />
              </div>

              {/* Urgent Action Queue */}
              <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Immediate Triage Queue
                  </h3>

                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto text-xs">
                    {requests
                      .filter((r) => r.status === 'PENDING' || r.isEscalated)
                      .slice(0, 5)
                      .map((req) => (
                        <div
                          key={req.id}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-900">
                              {req.requestId}
                            </span>
                            <PriorityBadge priority={req.priority} />
                          </div>
                          <div className="font-semibold text-slate-800">
                            {req.emergencyType} — {req.affectedPeopleCount} people affected
                          </div>
                          <div className="text-slate-500 text-[11px] truncate">
                            📍 {req.locationName}
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setOverridePriority(req.priority);
                                setShowVerifyModal(true);
                              }}
                              className="text-[11px] font-bold text-blue-600 hover:underline"
                            >
                              Verify & Assign →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs font-bold text-blue-700 hover:underline"
                  >
                    View All {requests.length} Requests
                  </button>
                  <button
                    onClick={() => setShowAlertModal(true)}
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Radio className="w-3.5 h-3.5" /> Broadcast Warning
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. EMERGENCY REQUESTS MANAGEMENT TAB */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Emergency Requests Incident Register
                </h2>
                <p className="text-xs text-slate-500">
                  Verify citizens calls, adjust priority classification, assign specialized personnel and resources.
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by ID, location, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filters:
              </span>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50 font-medium"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLUTION_PENDING">RESOLUTION_PENDING</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50 font-medium"
              >
                <option value="ALL">All Types</option>
                <option value="Rescue">Rescue</option>
                <option value="Medical">Medical</option>
                <option value="Food">Food</option>
                <option value="Water">Water</option>
                <option value="Shelter">Shelter</option>
              </select>

              <span className="text-slate-400 text-xs ml-auto">
                Showing <strong>{filteredRequests.length}</strong> of {requests.length} records
              </span>
            </div>

            {/* Emergency Requests Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="p-3.5">Request ID</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Affected</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Assigned Rescuer</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No matching emergency requests found.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr
                          key={req.id}
                          className={`hover:bg-slate-50 transition ${
                            req.isEscalated && req.status !== 'CLOSED' ? 'bg-red-50/60' : ''
                          }`}
                        >
                          <td className="p-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {req.requestId}
                              {req.isEscalated && (
                                <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                                  Escalated
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-sans">
                              {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-800">
                            {req.emergencyType}
                          </td>
                          <td className="p-3.5 max-w-[200px]">
                            <div className="font-medium text-slate-900 truncate">
                              {req.locationName}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {req.description}
                            </div>
                          </td>
                          <td className="p-3.5 font-bold text-slate-800">
                            {req.affectedPeopleCount} pax
                          </td>
                          <td className="p-3.5">
                            <PriorityBadge priority={req.priority} />
                          </td>
                          <td className="p-3.5">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="p-3.5">
                            {req.assignedVolunteerName ? (
                              <span className="text-blue-700 font-medium">
                                🧑‍🚒 {req.assignedVolunteerName}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">None assigned</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {req.status === 'PENDING' && (
                                <button
                                  onClick={() => {
                                    setSelectedRequest(req);
                                    setOverridePriority(req.priority);
                                    setShowVerifyModal(true);
                                  }}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px]"
                                >
                                  Verify
                                </button>
                              )}

                              {['VERIFIED', 'PENDING'].includes(req.status) && (
                                <button
                                  onClick={() => {
                                    setSelectedRequest(req);
                                    setShowAssignVolModal(true);
                                  }}
                                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[11px]"
                                >
                                  Assign Rescuer
                                </button>
                              )}

                              {req.status === 'RESOLUTION_PENDING' && (
                                <button
                                  onClick={() => {
                                    setSelectedRequest(req);
                                    setShowCloseModal(true);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
                                >
                                  Review & Close
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setShowRejectModal(true);
                                }}
                                className="px-2 py-1 text-slate-400 hover:text-red-600 rounded-lg text-[11px]"
                                title="Reject or Archive"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. GIS OPERATIONS MAP TAB */}
        {activeTab === 'map' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  Tactical Spatial Operations Map
                </h2>
                <p className="text-xs text-slate-500">
                  Full GIS visualization showing emergency callers, volunteer squads, relief shelters, and logistics staging posts.
                </p>
              </div>
            </div>

            <InteractiveMap
              requests={requests}
              volunteers={volunteers}
              camps={camps}
              resources={resources}
              height="600px"
              onSelectRequest={(req) => {
                setSelectedRequest(req);
                setOverridePriority(req.priority);
                setShowVerifyModal(true);
              }}
            />
          </div>
        )}

        {/* 4. VOLUNTEER FORCE TAB */}
        {activeTab === 'volunteers' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Registered Rescue & Relief Personnel ({volunteers.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Track readiness, skills, certifications, and active tactical deployments.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{vol.name}</h4>
                      <p className="text-xs text-slate-500">📍 {vol.serviceArea}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        vol.availability === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : vol.availability === 'BUSY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {vol.availability}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600">
                    <div>📞 Direct Phone: <strong>{vol.phone}</strong></div>
                    <div>🎯 Coverage Radius: <strong>{vol.serviceRadiusKm} km</strong></div>
                    {vol.activeOperationId && (
                      <div className="text-blue-700 font-semibold">
                        ⚡ Active Task: {vol.activeOperationId}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Certified Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {vol.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                    <span>Missions Completed: <strong>{vol.completedTasksCount}</strong></span>
                    <span>Emergency Contact: {vol.emergencyContact.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. MANPOWER REQUESTS TAB */}
        {activeTab === 'manpower' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-black text-slate-900">
                Volunteer Field Reinforcement Demands
              </h2>
              <p className="text-xs text-slate-500">
                Requests for additional rescue swimmers, drivers, and medical personnel submitted from active flood zones.
              </p>
            </div>

            {manpowerReqs.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center text-slate-400 text-xs">
                No open manpower requests from the field.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {manpowerReqs.map((mpr) => (
                  <div
                    key={mpr.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        Task: {mpr.requestId}
                      </span>
                      <PriorityBadge priority={mpr.urgency} />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Requested by: {mpr.volunteerName}
                      </h4>
                      <p className="text-xs text-slate-500">📍 {mpr.locationName}</p>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <strong>Needs: {mpr.additionalVolunteersNeeded} Additional Rescuer(s)</strong>
                      <p className="mt-1">{mpr.reason}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Required Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {mpr.requiredSkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Status: <strong className="text-blue-700">{mpr.status}</strong>
                      </span>
                      {mpr.status === 'PENDING' && (
                        <button
                          onClick={() => handleFulfillManpower(mpr)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
                        >
                          Approve & Dispatch Reinforcements
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Emergency Resources & Mobilization Asset Register
                </h2>
                <p className="text-xs text-slate-500">
                  Boats, high-water rescue trucks, generators, ration kits, and medical triage packs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded">
                        {res.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{res.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        res.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{res.description}</p>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Available Stock:</span>
                      <strong className="text-slate-900">
                        {res.availableQuantity} / {res.totalQuantity} {res.unit}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Staging Yard:</span>
                      <span className="text-slate-700 font-medium truncate">
                        {res.locationName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Provider:</span>
                      <span className="text-slate-700 font-medium">{res.providerName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. RELIEF CAMPS TAB */}
        {activeTab === 'camps' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Relief Camps & Evacuation Shelters
                </h2>
                <p className="text-xs text-slate-500">
                  Government safe houses: manage total capacities and update live evacuee intake.
                </p>
              </div>
              <button
                onClick={() => setShowAddCamp(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                + Register New Relief Camp
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {camps.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{camp.name}</h4>
                      <p className="text-xs text-slate-500">📍 {camp.address}</p>
                    </div>
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
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Current Intake:</span>
                      <strong>{camp.currentOccupancy} / {camp.totalCapacity}</strong>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (camp.currentOccupancy / camp.totalCapacity) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Available Capacity: <strong className="text-emerald-700">{camp.availableSpaces}</strong></span>
                      <span>Beds: {camp.bedAvailability}</span>
                    </div>
                  </div>

                  {/* Fast Update Occupancy */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500">Update Intake:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const newOcc = Math.max(0, camp.currentOccupancy - 10);
                          store.updateReliefCampOccupancy(camp.id, newOcc);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => {
                          const newOcc = Math.min(camp.totalCapacity, camp.currentOccupancy + 10);
                          store.updateReliefCampOccupancy(camp.id, newOcc);
                        }}
                        className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-xs font-bold"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => {
                          const custom = prompt('Enter new current occupancy count:', String(camp.currentOccupancy));
                          if (custom !== null && !isNaN(Number(custom))) {
                            store.updateReliefCampOccupancy(camp.id, Number(custom));
                          }
                        }}
                        className="px-2 py-1 bg-slate-800 text-white rounded text-xs font-semibold"
                      >
                        Set Exact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. ESCALATED QUEUE TAB */}
        {activeTab === 'escalated' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-red-700 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-600" />
                  Escalated Critical Emergencies ({escalatedList.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Critical life-threatening requests that remained unassigned beyond emergency SLA thresholds.
                </p>
              </div>
            </div>

            {escalatedList.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl text-center space-y-2 border border-slate-200">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Escalated Incidents</h3>
                <p className="text-xs text-slate-500">All critical requests have been assigned to active rescue units.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {escalatedList.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white p-5 rounded-2xl border-2 border-red-400 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900 bg-red-100 text-red-900 px-2.5 py-1 rounded">
                          {req.requestId}
                        </span>
                        <PriorityBadge priority="CRITICAL" />
                        <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          ⚠️ BREACHED SLA
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        Reported: {new Date(req.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-950">
                      <strong>Escalation Reason:</strong> {req.escalationReason || 'Unassigned critical incident exceeded response time limit.'}
                    </div>

                    <div className="text-xs space-y-1">
                      <div>📍 Location: <strong>{req.locationName}</strong></div>
                      <div>👥 Affected: <strong>{req.affectedPeopleCount} people trapped</strong></div>
                      <div>Details: {req.description}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setShowAssignVolModal(true);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md"
                      >
                        🚨 Mobilize Nearest Available Rescuer Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. ALERTS TAB */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Public Alerts & Weather Advisories ({alerts.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Broadcast cyclone warnings, road closures, and flood warnings to citizens and volunteers.
                </p>
              </div>
              <button
                onClick={() => setShowAlertModal(true)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                + Broadcast New Warning
              </button>
            </div>

            <div className="space-y-3">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {al.alertType}
                      </span>
                      <PriorityBadge priority={al.severity} />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${al.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {al.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <button
                      onClick={() => store.toggleAlertActive(al.id)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      {al.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{al.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{al.message}</p>
                  <div className="text-[11px] text-slate-400 pt-1 flex justify-between">
                    <span>Region: {al.affectedArea}</span>
                    <span>Issued By: {al.authorName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. REPORTS & ANALYTICS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-black text-slate-900">
                Disaster Response Analytics & Operations Summary
              </h2>
              <p className="text-xs text-slate-500">
                Derived statistics from verified database incident logs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-sm text-slate-900 mb-3">Requests by Emergency Type</h4>
                <div className="space-y-2 text-xs">
                  {['Rescue', 'Medical', 'Food', 'Water', 'Shelter'].map((t) => {
                    const count = requests.filter((r) => r.emergencyType === t).length;
                    const pct = requests.length ? Math.round((count / requests.length) * 100) : 0;
                    return (
                      <div key={t} className="space-y-1">
                        <div className="flex justify-between">
                          <span>{t}</span>
                          <span className="font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-sm text-slate-900 mb-3">Requests by Priority Level</h4>
                <div className="space-y-2 text-xs">
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => {
                    const count = requests.filter((r) => r.priority === p).length;
                    const pct = requests.length ? Math.round((count / requests.length) * 100) : 0;
                    return (
                      <div key={p} className="space-y-1">
                        <div className="flex justify-between">
                          <span>{p}</span>
                          <span className="font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${p === 'CRITICAL' ? 'bg-red-600' : p === 'HIGH' ? 'bg-orange-500' : 'bg-amber-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-sm text-slate-900 mb-3">Incident Status Breakdown</h4>
                <div className="space-y-2 text-xs">
                  {['PENDING', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'CLOSED'].map((st) => {
                    const count = requests.filter((r) => r.status === st).length;
                    const pct = requests.length ? Math.round((count / requests.length) * 100) : 0;
                    return (
                      <div key={st} className="space-y-1">
                        <div className="flex justify-between">
                          <span>{st}</span>
                          <span className="font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: VERIFY & SET PRIORITY */}
      {showVerifyModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Verify Emergency Request ({selectedRequest.requestId})
            </h3>
            <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-xl">
              <div>Type: <strong>{selectedRequest.emergencyType}</strong></div>
              <div>Location: <strong>{selectedRequest.locationName}</strong></div>
              <div>Affected: <strong>{selectedRequest.affectedPeopleCount} people</strong></div>
              <div>Caller: {selectedRequest.citizenName} ({selectedRequest.citizenPhone})</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assign / Override Priority Level
              </label>
              <select
                value={overridePriority}
                onChange={(e) => setOverridePriority(e.target.value as Priority)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
              >
                <option value="CRITICAL">CRITICAL (Drowning / Life Threatening / Trapped)</option>
                <option value="HIGH">HIGH (Urgent Medical / Vulnerable People)</option>
                <option value="MEDIUM">MEDIUM (Food / Clean Water / Relocation)</option>
                <option value="LOW">LOW (Non-Urgent / General Relief)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-md"
              >
                Confirm Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN VOLUNTEER */}
      {showAssignVolModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Assign Volunteer Rescuer to {selectedRequest.requestId}
            </h3>
            <p className="text-xs text-slate-500">
              Matching for location: <strong>{selectedRequest.locationName}</strong>
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Select Rescuer from Available Roster:
              </label>
              <select
                value={selectedVolunteerId}
                onChange={(e) => setSelectedVolunteerId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              >
                <option value="">-- Choose Volunteer --</option>
                {volunteers.map((v) => (
                  <option
                    key={v.id}
                    value={v.id}
                  >
                    {v.name} ({v.availability}) — {v.skills.slice(0, 2).join(', ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAssignVolModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignVolunteer}
                className="px-4 py-2 text-xs font-bold bg-purple-600 text-white rounded-xl shadow-md"
              >
                Assign & Dispatch Rescuer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT / ARCHIVE */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 text-rose-700">
              Reject / Archive Request ({selectedRequest.requestId})
            </h3>
            <p className="text-xs text-slate-500">
              Specify reason (e.g. duplicate submission, non-disaster inquiry, unreachable phone).
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for closure..."
              className="w-full px-3 py-2 border rounded-xl text-xs"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CLOSE COMPLETED REQUEST */}
      {showCloseModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 text-emerald-800">
              Review Completion & Formally Close {selectedRequest.requestId}
            </h3>

            {selectedRequest.completionReport && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <div>Surviving Rescued Count: <strong>{selectedRequest.completionReport.rescuedCount}</strong></div>
                <div>Summary: {selectedRequest.completionReport.summary}</div>
                <div>Casualties: {selectedRequest.completionReport.casualties}</div>
                <div>Transfers: {selectedRequest.completionReport.hospitalTransfers}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Verification Notes:
              </label>
              <input
                type="text"
                value={closeOfficialNotes}
                onChange={(e) => setCloseOfficialNotes(e.target.value)}
                placeholder="e.g. Verified with camp superintendent. Case officially resolved."
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseRequest}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md"
              >
                Verify & Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD RELIEF CAMP */}
      {showAddCamp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Register New Relief Camp</h3>
            <form onSubmit={handleCreateCamp} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Camp / Facility Name</label>
                <input
                  type="text"
                  required
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  placeholder="e.g. Community Hall Sector 5"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Address / Landmark</label>
                <input
                  type="text"
                  required
                  value={newCampAddress}
                  onChange={(e) => setNewCampAddress(e.target.value)}
                  placeholder="e.g. Near Bus Stand, Madipakkam"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Total Capacity</label>
                <input
                  type="number"
                  min={10}
                  required
                  value={newCampCapacity}
                  onChange={(e) => setNewCampCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCamp(false)}
                  className="px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-600 text-white rounded-xl shadow-md"
                >
                  Register Camp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST ALERT */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Broadcast Public Emergency Warning</h3>
            <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Alert Headline</label>
                <input
                  type="text"
                  required
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="e.g. Red Warning: Rising Water Levels at Basin..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Message Body</label>
                <textarea
                  rows={3}
                  required
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="Advisory details..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Alert Category</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Flood warning">Flood warning</option>
                    <option value="Cyclone warning">Cyclone warning</option>
                    <option value="Evacuation advisory">Evacuation advisory</option>
                    <option value="Road closure">Road closure</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Severity</label>
                  <select
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-red-600 text-white rounded-xl shadow-md"
                >
                  Transmit Warning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import {
  EmergencyRequest,
  VolunteerProfile,
  ResourceItem,
  ReliefCamp,
  Alert,
  ManpowerRequest,
  ResourceRequest,
  AppNotification,
  User,
  Role,
  Priority,
  RequestStatus,
  VolunteerStatus,
  DashboardStats,
  OfflineSyncQueueItem,
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_VOLUNTEERS,
  INITIAL_REQUESTS,
  INITIAL_RESOURCES,
  INITIAL_CAMPS,
  INITIAL_ALERTS,
  INITIAL_MANPOWER_REQUESTS,
  INITIAL_RESOURCE_REQUESTS,
  INITIAL_NOTIFICATIONS,
} from './seedData';

const STORAGE_KEYS = {
  USERS: 'resqlink_users_v1',
  CURRENT_USER: 'resqlink_current_user_v1',
  REQUESTS: 'resqlink_requests_v1',
  VOLUNTEERS: 'resqlink_volunteers_v1',
  RESOURCES: 'resqlink_resources_v1',
  CAMPS: 'resqlink_camps_v1',
  ALERTS: 'resqlink_alerts_v1',
  MANPOWER: 'resqlink_manpower_v1',
  RESOURCE_REQUESTS: 'resqlink_resource_reqs_v1',
  NOTIFICATIONS: 'resqlink_notifs_v1',
  OFFLINE_QUEUE: 'resqlink_offline_queue_v1',
  SIMULATED_OFFLINE: 'resqlink_sim_offline_v1',
};

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error loading storage key ${key}:`, err);
    return defaultValue;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving storage key ${key}:`, err);
  }
}

class ResQLinkStore {
  private users: User[] = [];
  private currentUser: User | null = null;
  private requests: EmergencyRequest[] = [];
  private volunteers: VolunteerProfile[] = [];
  private resources: ResourceItem[] = [];
  private camps: ReliefCamp[] = [];
  private alerts: Alert[] = [];
  private manpowerRequests: ManpowerRequest[] = [];
  private resourceRequests: ResourceRequest[] = [];
  private notifications: AppNotification[] = [];
  private offlineQueue: OfflineSyncQueueItem[] = [];
  private simulatedOffline: boolean = false;
  private listeners: Set<() => void> = new Set();
  private escalationInterval: any = null;

  constructor() {
    this.init();
  }

  private init() {
    this.users = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.requests = loadStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    this.volunteers = loadStorage(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
    this.resources = loadStorage(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    this.camps = loadStorage(STORAGE_KEYS.CAMPS, INITIAL_CAMPS);
    this.alerts = loadStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    this.manpowerRequests = loadStorage(STORAGE_KEYS.MANPOWER, INITIAL_MANPOWER_REQUESTS);
    this.resourceRequests = loadStorage(STORAGE_KEYS.RESOURCE_REQUESTS, INITIAL_RESOURCE_REQUESTS);
    this.notifications = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.offlineQueue = loadStorage(STORAGE_KEYS.OFFLINE_QUEUE, []);
    this.simulatedOffline = loadStorage(STORAGE_KEYS.SIMULATED_OFFLINE, false);

    const savedUser = loadStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    this.currentUser = savedUser; // Default to null (unauthenticated guest) so user can see and use the Login page

    // Start auto-escalation check (runs every 15 seconds)
    this.startEscalationWatch();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private persist() {
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    saveStorage(STORAGE_KEYS.REQUESTS, this.requests);
    saveStorage(STORAGE_KEYS.VOLUNTEERS, this.volunteers);
    saveStorage(STORAGE_KEYS.RESOURCES, this.resources);
    saveStorage(STORAGE_KEYS.CAMPS, this.camps);
    saveStorage(STORAGE_KEYS.ALERTS, this.alerts);
    saveStorage(STORAGE_KEYS.MANPOWER, this.manpowerRequests);
    saveStorage(STORAGE_KEYS.RESOURCE_REQUESTS, this.resourceRequests);
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    saveStorage(STORAGE_KEYS.OFFLINE_QUEUE, this.offlineQueue);
    saveStorage(STORAGE_KEYS.SIMULATED_OFFLINE, this.simulatedOffline);
    this.notify();
  }

  public resetToDefaultDemoData() {
    this.users = [...INITIAL_USERS];
    this.requests = [...INITIAL_REQUESTS];
    this.volunteers = [...INITIAL_VOLUNTEERS];
    this.resources = [...INITIAL_RESOURCES];
    this.camps = [...INITIAL_CAMPS];
    this.alerts = [...INITIAL_ALERTS];
    this.manpowerRequests = [...INITIAL_MANPOWER_REQUESTS];
    this.resourceRequests = [...INITIAL_RESOURCE_REQUESTS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.offlineQueue = [];
    this.currentUser = null;
    this.persist();
  }

  // --- Network / Offline Simulation ---
  public isOffline(): boolean {
    if (this.simulatedOffline) return true;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
    return false;
  }

  public toggleSimulatedOffline(): boolean {
    this.simulatedOffline = !this.simulatedOffline;
    this.persist();
    return this.simulatedOffline;
  }

  public getOfflineQueue(): OfflineSyncQueueItem[] {
    return [...this.offlineQueue];
  }

  public syncOfflineQueue(): { synced: number; failed: number } {
    let synced = 0;
    let failed = 0;
    const remaining: OfflineSyncQueueItem[] = [];

    for (const item of this.offlineQueue) {
      try {
        if (item.action === 'CREATE_REQUEST') {
          // Idempotency check: verify request id doesn't already exist
          const exists = this.requests.some(
            (r) => r.id === item.payload.id || r.requestId === item.payload.requestId
          );
          if (!exists) {
            this.requests.unshift(item.payload);
            this.pushNotification({
              roleTarget: 'GOVERNMENT',
              title: `Offline Request Synced: ${item.payload.requestId}`,
              message: `Emergency reported offline by ${item.payload.citizenName} has been successfully synchronized.`,
              type: 'STATUS',
              timestamp: new Date().toISOString(),
            });
          }
          synced++;
        } else if (item.action === 'ADD_FIELD_NOTE') {
          const req = this.requests.find((r) => r.id === item.payload.requestId);
          if (req) {
            req.fieldNotes.push(item.payload.fieldNote);
            req.updatedAt = new Date().toISOString();
            synced++;
          }
        } else if (item.action === 'UPDATE_VOLUNTEER_STATUS') {
          const vol = this.volunteers.find((v) => v.id === item.payload.volunteerId);
          if (vol) {
            vol.availability = item.payload.status;
            vol.updatedAt = new Date().toISOString();
            synced++;
          }
        } else if (item.action === 'SUBMIT_COMPLETION') {
          const req = this.requests.find((r) => r.id === item.payload.requestId);
          if (req) {
            req.completionReport = item.payload.report;
            req.status = 'RESOLUTION_PENDING';
            req.updatedAt = new Date().toISOString();
            synced++;
          }
        }
      } catch (err: any) {
        failed++;
        item.status = 'FAILED';
        item.error = err.message || 'Sync error';
        item.retryCount = (item.retryCount || 0) + 1;
        remaining.push(item);
      }
    }

    this.offlineQueue = remaining;
    this.persist();
    return { synced, failed };
  }

  // --- Escalation Watcher ---
  private startEscalationWatch() {
    if (this.escalationInterval) clearInterval(this.escalationInterval);
    this.escalationInterval = setInterval(() => {
      this.checkEscalations();
    }, 15000);
  }

  public checkEscalations(thresholdMinutes = 5): number {
    let escalatedCount = 0;
    const now = Date.now();

    this.requests.forEach((req) => {
      // Escalation condition: Priority is CRITICAL, not yet assigned/closed, not already escalated
      if (
        req.priority === 'CRITICAL' &&
        (req.status === 'PENDING' || req.status === 'VERIFIED') &&
        !req.assignedVolunteerId &&
        !req.isEscalated
      ) {
        const createdMs = new Date(req.createdAt).getTime();
        const diffMinutes = (now - createdMs) / (1000 * 60);

        if (diffMinutes >= thresholdMinutes) {
          req.isEscalated = true;
          req.escalationReason = `CRITICAL emergency unassigned for ${Math.round(
            diffMinutes
          )} minutes (exceeded ${thresholdMinutes}m SLA threshold).`;
          req.escalatedAt = new Date().toISOString();
          req.updatedAt = new Date().toISOString();
          escalatedCount++;

          this.pushNotification({
            roleTarget: 'GOVERNMENT',
            title: `CRITICAL ESCALATION: ${req.requestId}`,
            message: `Emergency at ${req.locationName} has remained unassigned for over ${thresholdMinutes}m! Immediate action required.`,
            type: 'ALERT',
            timestamp: new Date().toISOString(),
            link: '/government/escalated',
          });
        }
      }
    });

    if (escalatedCount > 0) {
      this.persist();
    }
    return escalatedCount;
  }

  public triggerManualEscalation(requestId: string): boolean {
    const req = this.requests.find((r) => r.id === requestId || r.requestId === requestId);
    if (!req) return false;
    req.isEscalated = true;
    req.escalationReason = 'Manual escalation initiated by Field Supervisor due to deteriorating conditions.';
    req.escalatedAt = new Date().toISOString();
    req.updatedAt = new Date().toISOString();

    this.pushNotification({
      roleTarget: 'GOVERNMENT',
      title: `URGENT MANUAL ESCALATION: ${req.requestId}`,
      message: `${req.emergencyType} request at ${req.locationName} manually escalated!`,
      type: 'ALERT',
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return true;
  }

  // --- Auth / User Management ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify();
  }

  public switchDemoUser(role: Role): User {
    const found = this.users.find((u) => u.role === role);
    if (found) {
      this.setCurrentUser(found);
      return found;
    }
    return this.users[0];
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  public registerUser(params: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: Role;
    address?: string;
    organization?: string;
    volunteerData?: Partial<VolunteerProfile>;
  }): User {
    const existing = this.users.find((u) => u.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    if (params.role === 'GOVERNMENT') {
      // In production, public registration as GOVERNMENT is forbidden
      throw new Error('Government authority accounts cannot be created via public registration. Please use administrative credentials.');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: params.name,
      email: params.email,
      phone: params.phone,
      role: params.role,
      address: params.address,
      organization: params.organization,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);

    if (params.role === 'VOLUNTEER') {
      const volProfile: VolunteerProfile = {
        id: `vol-prof-${Date.now()}`,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        skills: params.volunteerData?.skills || ['First Aid', 'Supply Distribution'],
        experience: params.volunteerData?.experience || 'Newly registered disaster volunteer',
        serviceArea: params.volunteerData?.serviceArea || params.address || 'Chennai Central',
        lat: params.volunteerData?.lat || 13.00,
        lng: params.volunteerData?.lng || 80.22,
        serviceRadiusKm: params.volunteerData?.serviceRadiusKm || 15,
        availability: 'AVAILABLE',
        emergencyContact: params.volunteerData?.emergencyContact || {
          name: 'Primary Contact',
          phone: newUser.phone,
          relation: 'Family',
        },
        completedTasksCount: 0,
        activeTasksCount: 0,
        updatedAt: new Date().toISOString(),
      };
      this.volunteers.push(volProfile);
    }

    this.setCurrentUser(newUser);
    this.persist();
    return newUser;
  }

  public loginUser(email: string, _password?: string): User {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password. Please use a registered or demo account.');
    }
    this.setCurrentUser(user);
    return user;
  }

  public logoutUser() {
    this.setCurrentUser(null);
  }

  // --- Requests ---
  public getRequests(): EmergencyRequest[] {
    return [...this.requests];
  }

  public getRequestById(id: string): EmergencyRequest | undefined {
    return this.requests.find((r) => r.id === id || r.requestId === id);
  }

  public createRequest(data: {
    citizenId: string;
    citizenName: string;
    citizenPhone: string;
    emergencyType: EmergencyRequest['emergencyType'];
    description: string;
    affectedPeopleCount: number;
    locationName: string;
    lat: number;
    lng: number;
    specialInstructions?: string;
  }): { request: EmergencyRequest; isOfflineQueued: boolean } {
    const count = this.requests.length + 1001;
    const reqId = `REQ-2026-${count}`;

    // Initial suggested classification based on emergency type
    let initialPriority: Priority = 'MEDIUM';
    if (data.emergencyType === 'Rescue') initialPriority = 'CRITICAL';
    else if (data.emergencyType === 'Medical') initialPriority = 'HIGH';
    else if (data.emergencyType === 'Food' || data.emergencyType === 'Water') initialPriority = 'MEDIUM';
    else initialPriority = 'LOW';

    const newRequest: EmergencyRequest = {
      id: `req-${Date.now()}`,
      requestId: reqId,
      citizenId: data.citizenId,
      citizenName: data.citizenName,
      citizenPhone: data.citizenPhone,
      emergencyType: data.emergencyType,
      description: data.description,
      affectedPeopleCount: data.affectedPeopleCount,
      locationName: data.locationName,
      lat: data.lat,
      lng: data.lng,
      specialInstructions: data.specialInstructions,
      priority: initialPriority,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedResourceIds: [],
      isEscalated: false,
      fieldNotes: [],
    };

    if (this.isOffline()) {
      // Queue offline
      const queueItem: OfflineSyncQueueItem = {
        id: `queue-${Date.now()}`,
        idempotencyKey: `idemp-${Date.now()}-${Math.random()}`,
        action: 'CREATE_REQUEST',
        payload: newRequest,
        timestamp: new Date().toISOString(),
        status: 'PENDING_SYNC',
        retryCount: 0,
      };
      this.offlineQueue.push(queueItem);
      this.persist();
      return { request: newRequest, isOfflineQueued: true };
    }

    this.requests.unshift(newRequest);

    // Notify government
    this.pushNotification({
      roleTarget: 'GOVERNMENT',
      title: `New Emergency Request: ${newRequest.requestId}`,
      message: `${newRequest.emergencyType} emergency reported at ${newRequest.locationName} (${newRequest.affectedPeopleCount} people affected).`,
      type: 'ALERT',
      timestamp: new Date().toISOString(),
      link: '/government/requests',
    });

    this.persist();
    return { request: newRequest, isOfflineQueued: false };
  }

  public verifyRequest(
    requestId: string,
    verifiedBy: string,
    priorityOverride?: Priority
  ): EmergencyRequest {
    const req = this.requests.find((r) => r.id === requestId || r.requestId === requestId);
    if (!req) throw new Error('Request not found');

    req.status = 'VERIFIED';
    req.verifiedBy = verifiedBy;
    req.verifiedAt = new Date().toISOString();
    if (priorityOverride) {
      req.priority = priorityOverride;
    }
    req.updatedAt = new Date().toISOString();

    this.pushNotification({
      userId: req.citizenId,
      title: `Emergency Request Verified (${req.requestId})`,
      message: `Your request has been verified by ${verifiedBy}. Priority set to ${req.priority}. Matching with nearest rescue units.`,
      type: 'STATUS',
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return req;
  }

  public rejectRequest(requestId: string, rejectedBy: string, reason: string): EmergencyRequest {
    const req = this.requests.find((r) => r.id === requestId || r.requestId === requestId);
    if (!req) throw new Error('Request not found');

    req.status = 'REJECTED';
    req.rejectionReason = reason;
    req.verifiedBy = rejectedBy;
    req.verifiedAt = new Date().toISOString();
    req.updatedAt = new Date().toISOString();

    this.pushNotification({
      userId: req.citizenId,
      title: `Request Not Actionable (${req.requestId})`,
      message: `Your request was reviewed and closed: ${reason}`,
      type: 'STATUS',
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return req;
  }

  public setRequestPriority(requestId: string, priority: Priority): EmergencyRequest {
    const req = this.requests.find((r) => r.id === requestId || r.requestId === requestId);
    if (!req) throw new Error('Request not found');

    req.priority = priority;
    req.updatedAt = new Date().toISOString();
    this.persist();
    return req;
  }

  public assignVolunteerToRequest(
    requestId: string,
    volunteerProfileId: string
  ): EmergencyRequest {
    const req = this.requests.find((r) => r.id === requestId || r.requestId === requestId);
    if (!req) throw new Error('Request not found');

    const vol = this.volunteers.find((v) => v.id === volunteerProfileId);
    if (!vol) throw new Error('Volunteer not found');

    req.assignedVolunteerId = vol.id;
    req.assignedVolunteerName = vol.name;
    req.status = 'ASSIGNED';
    req.operationId = req.operationId || `OP-${req.requestId.replace('REQ-2026-', '')}`;
    req.updatedAt = new Date().toISOString();

    vol.availability = 'BUSY';
    vol.activeOperationId = req.requestId;
    vol.activeTasksCount = (vol.activeTasksCount || 0) + 1;
    vol.updatedAt = new Date().toISOString();

    // Push notification to Volunteer
    this.pushNotification({
      userId: vol.userId,
      title: `New Mission Assigned: ${req.requestId}`,
      message: `You have been assigned to ${req.emergencyType} emergency at ${req.locationName}. Review instructions immediately.`,
      type: 'ASSIGNMENT',
      timestamp: new Date().toISOString(),
      link: '/volunteer/tasks',
    });

    // Push notification to Citizen
    this.pushNotification({
      userId: req.citizenId,
      title: `Rescuer Assigned to Your Request`,
      message: `Volunteer ${vol.name} has been assigned to assist you. Contact: ${vol.phone}.`,
      type: 'STATUS',
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return req;
  }

  public updateRequestStatus(
    requestId: string,
    newStatus: RequestStatus,
    volunteerId?: string
  ): EmergencyRequest {
    const req = this.requests.find((r) => r.id === requestId || r.requestId === requestId);
    if (!req) throw new Error('Request not found');

    // Validation on status transition
    req.status = newStatus;
    req.updatedAt = new Date().toISOString();

    if (volunteerId) {
      const vol = this.volunteers.find((v) => v.id === volunteerId);
      if (vol && (newStatus === 'CLOSED' || newStatus === 'REJECTED')) {
        vol.availability = 'AVAILABLE';
        vol.activeOperationId = undefined;
        vol.activeTasksCount = Math.max(0, vol.activeTasksCount - 1);
        if (newStatus === 'CLOSED') {
          vol.completedTasksCount += 1;
        }
      }
    }

    this.persist();
    return req;
  }

  public addFieldNote(
    requestId: string,
    volunteerId: string,
    volunteerName: string,
    note: string,
    isBlocker = false
  ): EmergencyRequest {
    const req = this.requests.find((r) => r.id === requestId || r.requestId === requestId);
    if (!req) throw new Error('Request not found');

    const fieldNote = {
      id: `fn-${Date.now()}`,
      volunteerId,
      volunteerName,
      note,
      timestamp: new Date().toISOString(),
      isBlocker,
    };

    if (this.isOffline()) {
      this.offlineQueue.push({
        id: `queue-${Date.now()}`,
        idempotencyKey: `idemp-fn-${Date.now()}`,
        action: 'ADD_FIELD_NOTE',
        payload: { requestId, fieldNote },
        timestamp: new Date().toISOString(),
        status: 'PENDING_SYNC',
        retryCount: 0,
      });
      this.persist();
      return req;
    }

    req.fieldNotes.push(fieldNote);
    req.updatedAt = new Date().toISOString();

    if (isBlocker) {
      this.pushNotification({
        roleTarget: 'GOVERNMENT',
        title: `BLOCKER Reported on ${req.requestId}`,
        message: `${volunteerName} reported a critical obstacle: "${note}"`,
        type: 'ALERT',
        timestamp: new Date().toISOString(),
      });
    }

    this.persist();
    return req;
  }

  public submitCompletionReport(
    requestId: string,
    reportData: {
      summary: string;
      rescuedCount: number;
      casualties: number;
      hospitalTransfers: number;
      fieldNotes: string;
    },
    markAsClosed = true
  ): EmergencyRequest {
    const req = this.requests.find((r) => r.id === requestId || r.requestId === requestId);
    if (!req) throw new Error('Request not found');

    req.completionReport = {
      ...reportData,
      submittedAt: new Date().toISOString(),
      verifiedByGovernment: markAsClosed,
      closedAt: markAsClosed ? new Date().toISOString() : undefined,
    };
    req.status = markAsClosed ? 'CLOSED' : 'RESOLUTION_PENDING';
    req.updatedAt = new Date().toISOString();

    // Release volunteer active mission and increment completed tasks count
    if (req.assignedVolunteerId) {
      const vol = this.volunteers.find((v) => v.id === req.assignedVolunteerId);
      if (vol) {
        if (vol.activeOperationId === req.requestId || vol.activeOperationId === req.id) {
          vol.activeOperationId = undefined;
        }
        vol.completedTasksCount = (vol.completedTasksCount || 0) + 1;
        vol.activeTasksCount = Math.max(0, (vol.activeTasksCount || 1) - 1);
        if (vol.activeTasksCount === 0) {
          vol.availability = 'AVAILABLE';
        }
        vol.updatedAt = new Date().toISOString();
      }
    }

    this.pushNotification({
      roleTarget: 'GOVERNMENT',
      title: `Mission Completed: ${req.requestId}`,
      message: `Rescuer completed mission: ${reportData.rescuedCount} rescued. Added to task history.`,
      type: 'STATUS',
      timestamp: new Date().toISOString(),
    });

    if (req.assignedVolunteerId) {
      const vol = this.volunteers.find((v) => v.id === req.assignedVolunteerId);
      if (vol) {
        this.pushNotification({
          userId: vol.userId,
          title: `Mission Completed: ${req.requestId}`,
          message: `Your mission completion report for ${req.requestId} was successfully recorded in your Task History.`,
          type: 'STATUS',
          timestamp: new Date().toISOString(),
        });
      }
    }

    this.pushNotification({
      userId: req.citizenId,
      title: `Rescue Mission Completed: ${req.requestId}`,
      message: `Rescue team has completed operations for your request. Stay safe.`,
      type: 'STATUS',
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return req;
  }

  public closeCompletedRequest(
    requestId: string,
    governmentOfficialName: string,
    governmentNotes?: string
  ): EmergencyRequest {
    const req = this.requests.find((r) => r.id === requestId || r.requestId === requestId);
    if (!req) throw new Error('Request not found');

    const wasAlreadyClosed = req.status === 'CLOSED';

    if (req.completionReport) {
      req.completionReport.verifiedByGovernment = true;
      req.completionReport.governmentNotes = governmentNotes || 'Verified by EOC authority.';
      req.completionReport.closedAt = req.completionReport.closedAt || new Date().toISOString();
    }

    req.status = 'CLOSED';
    req.updatedAt = new Date().toISOString();

    // Release volunteer
    if (req.assignedVolunteerId && !wasAlreadyClosed) {
      const vol = this.volunteers.find((v) => v.id === req.assignedVolunteerId);
      if (vol) {
        vol.availability = 'AVAILABLE';
        vol.activeOperationId = undefined;
        if (!req.completionReport) {
          vol.completedTasksCount = (vol.completedTasksCount || 0) + 1;
        }
        vol.activeTasksCount = Math.max(0, (vol.activeTasksCount || 1) - 1);
        vol.updatedAt = new Date().toISOString();
      }
    }

    // Release assigned resources
    if (req.assignedResourceIds && req.assignedResourceIds.length > 0) {
      req.assignedResourceIds.forEach((resId) => {
        const res = this.resources.find((r) => r.id === resId);
        if (res && res.status === 'IN_USE') {
          res.status = 'AVAILABLE';
          res.assignedOperationId = undefined;
          res.availableQuantity = Math.min(res.totalQuantity, res.availableQuantity + 1);
        }
      });
    }

    this.pushNotification({
      userId: req.citizenId,
      title: `Emergency Case Closed (${req.requestId})`,
      message: `Your emergency response has been completed and verified by disaster authorities.`,
      type: 'STATUS',
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return req;
  }

  // --- Volunteers ---
  public getVolunteers(): VolunteerProfile[] {
    return [...this.volunteers];
  }

  public getVolunteerByUserId(userId: string): VolunteerProfile | undefined {
    return this.volunteers.find((v) => v.userId === userId);
  }

  public getVolunteerById(id: string): VolunteerProfile | undefined {
    return this.volunteers.find((v) => v.id === id);
  }

  public updateVolunteerAvailability(
    volunteerId: string,
    availability: VolunteerStatus
  ): VolunteerProfile {
    const vol = this.volunteers.find((v) => v.id === volunteerId);
    if (!vol) throw new Error('Volunteer not found');

    // Rule: Volunteer cannot set to AVAILABLE while in active operation
    if (vol.activeOperationId && availability === 'AVAILABLE') {
      throw new Error('Cannot set status to AVAILABLE while participating in an active operation. Complete or close the task first.');
    }

    vol.availability = availability;
    vol.updatedAt = new Date().toISOString();
    this.persist();
    return vol;
  }

  public updateVolunteerProfile(
    volunteerId: string,
    data: Partial<VolunteerProfile>
  ): VolunteerProfile {
    const vol = this.volunteers.find((v) => v.id === volunteerId);
    if (!vol) throw new Error('Volunteer not found');

    Object.assign(vol, data);
    vol.updatedAt = new Date().toISOString();

    // Synchronize linked User account
    if (vol.userId) {
      const u = this.users.find((user) => user.id === vol.userId);
      if (u) {
        if (data.name) u.name = data.name;
        if (data.phone) u.phone = data.phone;
        if (data.email) u.email = data.email;
        if (data.serviceArea) u.address = data.serviceArea;
        if (data.lat !== undefined && data.lng !== undefined) {
          u.location = { lat: data.lat, lng: data.lng };
        }
      }
      if (this.currentUser && (this.currentUser.id === vol.userId || this.currentUser.email === vol.email)) {
        if (data.name) this.currentUser.name = data.name;
        if (data.phone) this.currentUser.phone = data.phone;
        if (data.email) this.currentUser.email = data.email;
        if (data.serviceArea) this.currentUser.address = data.serviceArea;
        if (data.lat !== undefined && data.lng !== undefined) {
          this.currentUser.location = { lat: data.lat, lng: data.lng };
        }
      }
    }

    // Keep assigned emergency requests' volunteer name in sync
    if (data.name) {
      this.requests.forEach((r) => {
        if (r.assignedVolunteerId === vol.id) {
          r.assignedVolunteerName = data.name;
        }
      });
    }

    this.persist();
    return vol;
  }

  // --- Manpower Requests ---
  public getManpowerRequests(): ManpowerRequest[] {
    return [...this.manpowerRequests];
  }

  public createManpowerRequest(data: {
    operationId: string;
    requestId: string;
    volunteerId: string;
    volunteerName: string;
    additionalVolunteersNeeded: number;
    reason: string;
    requiredSkills: string[];
    urgency: Priority;
    locationName: string;
    lat: number;
    lng: number;
    additionalNotes?: string;
  }): ManpowerRequest {
    const newMpr: ManpowerRequest = {
      id: `mpr-${Date.now()}`,
      operationId: data.operationId,
      requestId: data.requestId,
      volunteerId: data.volunteerId,
      volunteerName: data.volunteerName,
      additionalVolunteersNeeded: data.additionalVolunteersNeeded,
      reason: data.reason,
      requiredSkills: data.requiredSkills,
      urgency: data.urgency,
      locationName: data.locationName,
      lat: data.lat,
      lng: data.lng,
      additionalNotes: data.additionalNotes,
      status: 'PENDING',
      assignedVolunteerIds: [],
      assignedVolunteerNames: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.manpowerRequests.unshift(newMpr);

    this.pushNotification({
      roleTarget: 'GOVERNMENT',
      title: `URGENT MANPOWER REQUEST: ${data.requestId}`,
      message: `${data.volunteerName} urgently requested ${data.additionalVolunteersNeeded} additional rescuer(s) at ${data.locationName}.`,
      type: 'MANPOWER',
      timestamp: new Date().toISOString(),
      link: '/government/manpower',
    });

    this.persist();
    return newMpr;
  }

  public assignManpowerVolunteers(
    manpowerId: string,
    volunteerIds: string[],
    reviewNotes?: string
  ): ManpowerRequest {
    const mpr = this.manpowerRequests.find((m) => m.id === manpowerId);
    if (!mpr) throw new Error('Manpower request not found');

    const assignedNames: string[] = [];

    volunteerIds.forEach((volId) => {
      const vol = this.volunteers.find((v) => v.id === volId);
      if (vol) {
        vol.availability = 'BUSY';
        vol.activeOperationId = mpr.requestId;
        vol.activeTasksCount += 1;
        vol.updatedAt = new Date().toISOString();
        assignedNames.push(vol.name);

        this.pushNotification({
          userId: vol.userId,
          title: `Reinforcement Mission Assigned: ${mpr.requestId}`,
          message: `You have been deployed as reinforcement to assist ${mpr.volunteerName} at ${mpr.locationName}.`,
          type: 'ASSIGNMENT',
          timestamp: new Date().toISOString(),
        });
      }
    });

    mpr.assignedVolunteerIds = volunteerIds;
    mpr.assignedVolunteerNames = assignedNames;
    mpr.status = 'FULFILLED';
    mpr.reviewNotes = reviewNotes || 'Reinforcements approved and dispatched by EOC Command.';
    mpr.updatedAt = new Date().toISOString();

    // Notify requesting volunteer
    const requestingVol = this.volunteers.find((v) => v.id === mpr.volunteerId);
    if (requestingVol) {
      this.pushNotification({
        userId: requestingVol.userId,
        title: `Manpower Request Fulfilled!`,
        message: `${assignedNames.join(', ')} assigned to assist your operation at ${mpr.locationName}.`,
        type: 'MANPOWER',
        timestamp: new Date().toISOString(),
      });
    }

    this.persist();
    return mpr;
  }

  // --- Resources ---
  public getResources(): ResourceItem[] {
    return [...this.resources];
  }

  public createResource(data: Omit<ResourceItem, 'id' | 'updatedAt'>): ResourceItem {
    const newRes: ResourceItem = {
      ...data,
      id: `res-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    this.resources.push(newRes);
    this.persist();
    return newRes;
  }

  public updateResource(id: string, data: Partial<ResourceItem>): ResourceItem {
    const res = this.resources.find((r) => r.id === id);
    if (!res) throw new Error('Resource not found');
    Object.assign(res, data);
    res.updatedAt = new Date().toISOString();
    this.persist();
    return res;
  }

  // --- Resource Requests ---
  public getResourceRequests(): ResourceRequest[] {
    return [...this.resourceRequests];
  }

  public createResourceRequest(data: {
    operationId: string;
    requestId: string;
    volunteerId: string;
    volunteerName: string;
    resourceCategory: ResourceItem['category'];
    specificItem: string;
    quantityRequested: number;
    urgency: Priority;
    deliveryLocation: string;
    lat: number;
    lng: number;
    reason: string;
    additionalNotes?: string;
  }): ResourceRequest {
    const newReq: ResourceRequest = {
      id: `res-req-${Date.now()}`,
      operationId: data.operationId,
      requestId: data.requestId,
      volunteerId: data.volunteerId,
      volunteerName: data.volunteerName,
      resourceCategory: data.resourceCategory,
      specificItem: data.specificItem,
      quantityRequested: data.quantityRequested,
      urgency: data.urgency,
      deliveryLocation: data.deliveryLocation,
      lat: data.lat,
      lng: data.lng,
      reason: data.reason,
      additionalNotes: data.additionalNotes,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.resourceRequests.unshift(newReq);

    this.pushNotification({
      roleTarget: 'GOVERNMENT',
      title: `Emergency Resource Needed: ${data.specificItem}`,
      message: `${data.volunteerName} requested ${data.quantityRequested}x ${data.specificItem} for ${data.requestId}.`,
      type: 'RESOURCE',
      timestamp: new Date().toISOString(),
      link: '/government/resources',
    });

    this.persist();
    return newReq;
  }

  public assignResourceToRequest(
    resourceRequestId: string,
    resourceId: string,
    notes?: string
  ): ResourceRequest {
    const rReq = this.resourceRequests.find((r) => r.id === resourceRequestId);
    if (!rReq) throw new Error('Resource request not found');

    const res = this.resources.find((r) => r.id === resourceId);
    if (!res) throw new Error('Selected resource item not found');

    if (res.availableQuantity < rReq.quantityRequested) {
      throw new Error(`Insufficient quantity available. Requested: ${rReq.quantityRequested}, Available: ${res.availableQuantity}`);
    }

    res.availableQuantity -= rReq.quantityRequested;
    if (res.availableQuantity === 0) {
      res.status = 'IN_USE';
    }
    res.assignedOperationId = rReq.operationId;
    res.updatedAt = new Date().toISOString();

    rReq.status = 'ASSIGNED';
    rReq.assignedResourceId = res.id;
    rReq.assignedResourceName = res.name;
    rReq.reviewNotes = notes || 'Assigned and dispatched by Disaster Management Authority.';
    rReq.updatedAt = new Date().toISOString();

    // Also link resource to the emergency request
    const emergReq = this.requests.find((r) => r.requestId === rReq.requestId);
    if (emergReq) {
      if (!emergReq.assignedResourceIds.includes(res.id)) {
        emergReq.assignedResourceIds.push(res.id);
        emergReq.updatedAt = new Date().toISOString();
      }
    }

    // Notify volunteer
    const vol = this.volunteers.find((v) => v.id === rReq.volunteerId);
    if (vol) {
      this.pushNotification({
        userId: vol.userId,
        title: `Resource Assigned: ${res.name}`,
        message: `${res.name} has been dispatched to ${rReq.deliveryLocation}. Contact provider: ${res.providerPhone}.`,
        type: 'RESOURCE',
        timestamp: new Date().toISOString(),
      });
    }

    // Notify resource provider
    this.pushNotification({
      userId: res.providerId,
      title: `Resource Mobilization Order`,
      message: `${rReq.quantityRequested}x ${res.name} dispatched for emergency operation ${rReq.operationId}.`,
      type: 'RESOURCE',
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return rReq;
  }

  // --- Relief Camps ---
  public getReliefCamps(): ReliefCamp[] {
    return [...this.camps];
  }

  public createReliefCamp(data: Omit<ReliefCamp, 'id' | 'availableSpaces' | 'updatedAt'>): ReliefCamp {
    if (data.currentOccupancy > data.totalCapacity) {
      throw new Error('Current occupancy cannot exceed total camp capacity.');
    }

    const availableSpaces = Math.max(0, data.totalCapacity - data.currentOccupancy);
    let operatingStatus = data.operatingStatus;
    if (availableSpaces === 0) operatingStatus = 'FULL';
    else if (availableSpaces <= data.totalCapacity * 0.15) operatingStatus = 'NEAR_CAPACITY';

    const newCamp: ReliefCamp = {
      ...data,
      id: `camp-${Date.now()}`,
      availableSpaces,
      operatingStatus,
      updatedAt: new Date().toISOString(),
    };

    this.camps.push(newCamp);
    this.persist();
    return newCamp;
  }

  public updateReliefCampOccupancy(
    campId: string,
    currentOccupancy: number,
    bedAvailability?: number
  ): ReliefCamp {
    const camp = this.camps.find((c) => c.id === campId);
    if (!camp) throw new Error('Relief camp not found');

    if (currentOccupancy > camp.totalCapacity) {
      throw new Error(`Occupancy (${currentOccupancy}) cannot exceed total capacity (${camp.totalCapacity}).`);
    }

    camp.currentOccupancy = currentOccupancy;
    camp.availableSpaces = Math.max(0, camp.totalCapacity - currentOccupancy);
    if (bedAvailability !== undefined) camp.bedAvailability = bedAvailability;

    if (camp.availableSpaces === 0) {
      camp.operatingStatus = 'FULL';
    } else if (camp.availableSpaces <= camp.totalCapacity * 0.15) {
      camp.operatingStatus = 'NEAR_CAPACITY';
    } else {
      camp.operatingStatus = 'OPERATIONAL';
    }

    camp.updatedAt = new Date().toISOString();
    this.persist();
    return camp;
  }

  // --- Alerts ---
  public getAlerts(): Alert[] {
    return [...this.alerts];
  }

  public createAlert(data: Omit<Alert, 'id' | 'createdAt'>): Alert {
    const newAlert: Alert = {
      ...data,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.alerts.unshift(newAlert);

    this.pushNotification({
      title: `PUBLIC WARNING: ${newAlert.title}`,
      message: `${newAlert.message} (Area: ${newAlert.affectedArea})`,
      type: 'ALERT',
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return newAlert;
  }

  public toggleAlertActive(alertId: string): Alert {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) throw new Error('Alert not found');
    alert.active = !alert.active;
    this.persist();
    return alert;
  }

  // --- Notifications ---
  public getNotifications(userId?: string, role?: Role): AppNotification[] {
    return this.notifications.filter((n) => {
      if (n.userId && userId && n.userId === userId) return true;
      if (n.roleTarget && role && n.roleTarget === role) return true;
      if (!n.userId && !n.roleTarget) return true; // broadcast
      return false;
    });
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.persist();
    }
  }

  public markAllNotificationsAsRead(userId?: string, role?: Role) {
    this.notifications.forEach((n) => {
      if (
        (n.userId && userId && n.userId === userId) ||
        (n.roleTarget && role && n.roleTarget === role) ||
        (!n.userId && !n.roleTarget)
      ) {
        n.read = true;
      }
    });
    this.persist();
  }

  public pushNotification(notif: Omit<AppNotification, 'id' | 'read'>): AppNotification {
    const item: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
    };
    this.notifications.unshift(item);
    this.persist();
    return item;
  }

  // --- Real Database Stats ---
  public getDashboardStats(): DashboardStats {
    const totalRequests = this.requests.length;
    const pendingRequests = this.requests.filter((r) => r.status === 'PENDING').length;
    const criticalRequests = this.requests.filter((r) => r.priority === 'CRITICAL' && r.status !== 'CLOSED').length;
    const escalatedRequests = this.requests.filter((r) => r.isEscalated && r.status !== 'CLOSED').length;
    const activeRescueOperations = this.requests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length;
    const availableVolunteers = this.volunteers.filter((v) => v.availability === 'AVAILABLE').length;
    const busyVolunteers = this.volunteers.filter((v) => v.availability === 'BUSY').length;
    const availableResources = this.resources.filter((r) => r.status === 'AVAILABLE').length;
    const registeredReliefCamps = this.camps.length;

    return {
      totalRequests,
      pendingRequests,
      criticalRequests,
      escalatedRequests,
      activeRescueOperations,
      availableVolunteers,
      busyVolunteers,
      availableResources,
      registeredReliefCamps,
    };
  }
}

export const store = new ResQLinkStore();

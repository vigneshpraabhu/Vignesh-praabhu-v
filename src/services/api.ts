import { store } from './store';
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
  VolunteerStatus,
  Role,
} from '../types';

/**
 * Standard REST API Client wrapper.
 * Communicates with the reactive ResQLink data engine and supports online/offline transparently.
 */
export const api = {
  auth: {
    login: async (email: string, password?: string) => {
      return store.loginUser(email, password);
    },
    register: async (params: {
      name: string;
      email: string;
      phone: string;
      password?: string;
      role: Role;
      address?: string;
      organization?: string;
      volunteerData?: Partial<VolunteerProfile>;
    }) => {
      return store.registerUser(params);
    },
    getCurrentUser: async () => {
      return store.getCurrentUser();
    },
    logout: async () => {
      store.logoutUser();
    },
  },

  requests: {
    getAll: async () => {
      return store.getRequests();
    },
    getById: async (id: string) => {
      const req = store.getRequestById(id);
      if (!req) throw new Error('Emergency request not found');
      return req;
    },
    create: async (data: {
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
    }) => {
      return store.createRequest(data);
    },
    verify: async (id: string, verifiedBy: string, priorityOverride?: Priority) => {
      return store.verifyRequest(id, verifiedBy, priorityOverride);
    },
    reject: async (id: string, rejectedBy: string, reason: string) => {
      return store.rejectRequest(id, rejectedBy, reason);
    },
    setPriority: async (id: string, priority: Priority) => {
      return store.setRequestPriority(id, priority);
    },
    assignVolunteer: async (id: string, volunteerId: string) => {
      return store.assignVolunteerToRequest(id, volunteerId);
    },
    updateStatus: async (id: string, status: RequestStatus, volunteerId?: string) => {
      return store.updateRequestStatus(id, status, volunteerId);
    },
    addFieldNote: async (
      id: string,
      volunteerId: string,
      volunteerName: string,
      note: string,
      isBlocker = false
    ) => {
      return store.addFieldNote(id, volunteerId, volunteerName, note, isBlocker);
    },
    submitCompletion: async (
      id: string,
      report: {
        summary: string;
        rescuedCount: number;
        casualties: number;
        hospitalTransfers: number;
        fieldNotes: string;
      }
    ) => {
      return store.submitCompletionReport(id, report);
    },
    close: async (id: string, officialName: string, notes?: string) => {
      return store.closeCompletedRequest(id, officialName, notes);
    },
    escalateManual: async (id: string) => {
      return store.triggerManualEscalation(id);
    },
  },

  volunteers: {
    getAll: async () => {
      return store.getVolunteers();
    },
    getByUserId: async (userId: string) => {
      return store.getVolunteerByUserId(userId);
    },
    getById: async (id: string) => {
      return store.getVolunteerById(id);
    },
    setAvailability: async (id: string, status: VolunteerStatus) => {
      return store.updateVolunteerAvailability(id, status);
    },
    updateProfile: async (id: string, data: Partial<VolunteerProfile>) => {
      return store.updateVolunteerProfile(id, data);
    },
  },

  manpower: {
    getAll: async () => {
      return store.getManpowerRequests();
    },
    create: async (data: {
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
    }) => {
      return store.createManpowerRequest(data);
    },
    fulfill: async (id: string, volunteerIds: string[], reviewNotes?: string) => {
      return store.assignManpowerVolunteers(id, volunteerIds, reviewNotes);
    },
  },

  resources: {
    getAll: async () => {
      return store.getResources();
    },
    create: async (data: Omit<ResourceItem, 'id' | 'updatedAt'>) => {
      return store.createResource(data);
    },
    update: async (id: string, data: Partial<ResourceItem>) => {
      return store.updateResource(id, data);
    },
    getRequests: async () => {
      return store.getResourceRequests();
    },
    createRequest: async (data: {
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
    }) => {
      return store.createResourceRequest(data);
    },
    assignRequest: async (requestId: string, resourceId: string, notes?: string) => {
      return store.assignResourceToRequest(requestId, resourceId, notes);
    },
  },

  camps: {
    getAll: async () => {
      return store.getReliefCamps();
    },
    create: async (data: Omit<ReliefCamp, 'id' | 'availableSpaces' | 'updatedAt'>) => {
      return store.createReliefCamp(data);
    },
    updateOccupancy: async (id: string, occupancy: number, beds?: number) => {
      return store.updateReliefCampOccupancy(id, occupancy, beds);
    },
  },

  alerts: {
    getAll: async () => {
      return store.getAlerts();
    },
    create: async (data: Omit<Alert, 'id' | 'createdAt'>) => {
      return store.createAlert(data);
    },
    toggle: async (id: string) => {
      return store.toggleAlertActive(id);
    },
  },

  notifications: {
    getAll: async (userId?: string, role?: Role) => {
      return store.getNotifications(userId, role);
    },
    markRead: async (id: string) => {
      store.markNotificationAsRead(id);
    },
    markAllRead: async (userId?: string, role?: Role) => {
      store.markAllNotificationsAsRead(userId, role);
    },
  },

  reports: {
    getStats: async () => {
      return store.getDashboardStats();
    },
  },

  offline: {
    isOffline: () => store.isOffline(),
    toggleSimulatedOffline: () => store.toggleSimulatedOffline(),
    getQueue: () => store.getOfflineQueue(),
    sync: () => store.syncOfflineQueue(),
  },
};

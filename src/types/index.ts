export type Role = 'CITIZEN' | 'VOLUNTEER' | 'GOVERNMENT' | 'RESOURCE_PROVIDER';

export type EmergencyType = 'Rescue' | 'Medical' | 'Food' | 'Water' | 'Shelter';

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RequestStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLUTION_PENDING'
  | 'CLOSED'
  | 'REJECTED';

export type VolunteerStatus = 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';

export type OperationStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'RESOLUTION_PENDING'
  | 'CLOSED';

export type ManpowerStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'FULFILLED';

export type ResourceRequestStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'DELIVERED'
  | 'CANCELLED';

export type ResourceCategory =
  | 'Boats'
  | 'Vehicles'
  | 'Generators'
  | 'Food'
  | 'Water'
  | 'Medical supplies'
  | 'Rescue equipment'
  | 'Other emergency supplies';

export type ResourceItemStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'ASSIGNED'
  | 'IN_USE'
  | 'MAINTENANCE'
  | 'UNAVAILABLE';

export type CampStatus = 'OPERATIONAL' | 'NEAR_CAPACITY' | 'FULL' | 'INACTIVE';

export type AlertType =
  | 'Flood warning'
  | 'Cyclone warning'
  | 'Evacuation advisory'
  | 'Road closure'
  | 'Relief camp update'
  | 'Safety information';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  address?: string;
  location?: { lat: number; lng: number };
  organization?: string;
  createdAt: string;
}

export interface VolunteerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  serviceArea: string;
  lat: number;
  lng: number;
  serviceRadiusKm: number;
  availability: VolunteerStatus;
  activeOperationId?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  completedTasksCount: number;
  activeTasksCount: number;
  updatedAt: string;
}

export interface FieldNote {
  id: string;
  volunteerId: string;
  volunteerName: string;
  note: string;
  timestamp: string;
  isBlocker?: boolean;
}

export interface CompletionReport {
  summary: string;
  rescuedCount: number;
  casualties: number;
  hospitalTransfers: number;
  fieldNotes: string;
  submittedAt: string;
  verifiedByGovernment?: boolean;
  governmentNotes?: string;
  closedAt?: string;
}

export interface EmergencyRequest {
  id: string;
  requestId: string; // e.g. REQ-2026-1042
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  emergencyType: EmergencyType;
  description: string;
  affectedPeopleCount: number;
  locationName: string;
  lat: number;
  lng: number;
  specialInstructions?: string;
  priority: Priority;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  assignedResourceIds: string[];
  operationId?: string;
  isEscalated: boolean;
  escalationReason?: string;
  escalatedAt?: string;
  fieldNotes: FieldNote[];
  completionReport?: CompletionReport;
}

export interface ResourceItem {
  id: string;
  resourceId: string; // e.g. RES-BOAT-01
  providerId: string;
  providerName: string;
  providerPhone: string;
  category: ResourceCategory;
  name: string;
  description: string;
  totalQuantity: number;
  availableQuantity: number;
  unit: string;
  locationName: string;
  lat: number;
  lng: number;
  status: ResourceItemStatus;
  assignedOperationId?: string;
  lastMaintained?: string;
  updatedAt: string;
}

export interface ReliefCamp {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  totalCapacity: number;
  currentOccupancy: number;
  availableSpaces: number;
  bedAvailability: number;
  foodAvailability: boolean;
  waterAvailability: boolean;
  medicalSupport: boolean;
  contactPerson: string;
  contactPhone: string;
  operatingStatus: CampStatus;
  updatedAt: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  alertType: AlertType;
  severity: Priority;
  affectedArea: string;
  authorName: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
}

export interface ManpowerRequest {
  id: string;
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
  status: ManpowerStatus;
  assignedVolunteerIds: string[];
  assignedVolunteerNames: string[];
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceRequest {
  id: string;
  operationId: string;
  requestId: string;
  volunteerId: string;
  volunteerName: string;
  resourceCategory: ResourceCategory;
  specificItem: string;
  quantityRequested: number;
  urgency: Priority;
  deliveryLocation: string;
  lat: number;
  lng: number;
  reason: string;
  additionalNotes?: string;
  status: ResourceRequestStatus;
  assignedResourceId?: string;
  assignedResourceName?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId?: string; // target user or undefined for public/role
  roleTarget?: Role;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'MANPOWER' | 'RESOURCE' | 'ALERT' | 'OPERATION' | 'STATUS';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface OfflineSyncQueueItem {
  id: string;
  idempotencyKey: string;
  action: 'CREATE_REQUEST' | 'UPDATE_VOLUNTEER_STATUS' | 'ADD_FIELD_NOTE' | 'SUBMIT_COMPLETION';
  payload: any;
  timestamp: string;
  status: 'PENDING_SYNC' | 'SYNCED' | 'FAILED';
  retryCount: number;
  error?: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  criticalRequests: number;
  escalatedRequests: number;
  activeRescueOperations: number;
  availableVolunteers: number;
  busyVolunteers: number;
  availableResources: number;
  registeredReliefCamps: number;
}

/**
 * MongoDB Mongoose Model: EmergencyRequest
 * Tracks disaster rescue calls with geospatial indexing and lifecycle stages.
 */
export interface IEmergencyRequest {
  requestId: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  emergencyType: 'Rescue' | 'Medical' | 'Food' | 'Water' | 'Shelter';
  description: string;
  affectedPeopleCount: number;
  locationName: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  specialInstructions?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status:
    | 'PENDING'
    | 'VERIFIED'
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'RESOLUTION_PENDING'
    | 'CLOSED'
    | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  assignedVolunteerId?: string;
  assignedResourceIds: string[];
  operationId?: string;
  isEscalated: boolean;
  escalationReason?: string;
  escalatedAt?: Date;
  fieldNotes: Array<{
    volunteerId: string;
    volunteerName: string;
    note: string;
    timestamp: Date;
    isBlocker: boolean;
  }>;
  completionReport?: {
    summary: string;
    rescuedCount: number;
    casualties: number;
    hospitalTransfers: number;
    submittedAt: Date;
    verifiedByGovernment: boolean;
    governmentNotes?: string;
    closedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const EmergencyRequestSchemaDefinition = {
  requestId: { type: String, required: true, unique: true, index: true },
  citizenId: { type: String, required: true, index: true },
  citizenName: { type: String, required: true },
  citizenPhone: { type: String, required: true },
  emergencyType: {
    type: String,
    enum: ['Rescue', 'Medical', 'Food', 'Water', 'Shelter'],
    required: true,
  },
  description: { type: String, required: true },
  affectedPeopleCount: { type: Number, required: true, min: 1 },
  locationName: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  specialInstructions: { type: String },
  priority: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM',
    index: true,
  },
  status: {
    type: String,
    enum: [
      'PENDING',
      'VERIFIED',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLUTION_PENDING',
      'CLOSED',
      'REJECTED',
    ],
    default: 'PENDING',
    index: true,
  },
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  rejectionReason: { type: String },
  assignedVolunteerId: { type: String, index: true },
  assignedResourceIds: [{ type: String }],
  operationId: { type: String },
  isEscalated: { type: Boolean, default: false, index: true },
  escalationReason: { type: String },
  escalatedAt: { type: Date },
  fieldNotes: [
    {
      volunteerId: String,
      volunteerName: String,
      note: String,
      timestamp: { type: Date, default: Date.now },
      isBlocker: { type: Boolean, default: false },
    },
  ],
  completionReport: {
    summary: String,
    rescuedCount: Number,
    casualties: Number,
    hospitalTransfers: Number,
    submittedAt: Date,
    verifiedByGovernment: { type: Boolean, default: false },
    governmentNotes: String,
    closedAt: Date,
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
};

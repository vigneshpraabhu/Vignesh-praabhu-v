/**
 * MongoDB Mongoose Model: VolunteerProfile & ReliefCamp
 */
export interface IVolunteerProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  serviceArea: string;
  serviceRadiusKm: number;
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  activeOperationId?: string;
  completedTasksCount: number;
  updatedAt: Date;
}

export const VolunteerProfileSchemaDefinition = {
  userId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  skills: [{ type: String }],
  experience: { type: String },
  serviceArea: { type: String },
  serviceRadiusKm: { type: Number, default: 15 },
  availability: {
    type: String,
    enum: ['AVAILABLE', 'BUSY', 'UNAVAILABLE'],
    default: 'AVAILABLE',
    index: true,
  },
  activeOperationId: { type: String },
  completedTasksCount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
};

export interface IReliefCamp {
  name: string;
  address: string;
  totalCapacity: number;
  currentOccupancy: number;
  availableSpaces: number;
  bedAvailability: number;
  foodAvailability: boolean;
  waterAvailability: boolean;
  medicalSupport: boolean;
  contactPerson: string;
  contactPhone: string;
  operatingStatus: 'OPERATIONAL' | 'NEAR_CAPACITY' | 'FULL' | 'INACTIVE';
  updatedAt: Date;
}

export const ReliefCampSchemaDefinition = {
  name: { type: String, required: true },
  address: { type: String, required: true },
  totalCapacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  availableSpaces: { type: Number, required: true },
  bedAvailability: { type: Number, default: 0 },
  foodAvailability: { type: Boolean, default: true },
  waterAvailability: { type: Boolean, default: true },
  medicalSupport: { type: Boolean, default: true },
  contactPerson: { type: String, required: true },
  contactPhone: { type: String, required: true },
  operatingStatus: {
    type: String,
    enum: ['OPERATIONAL', 'NEAR_CAPACITY', 'FULL', 'INACTIVE'],
    default: 'OPERATIONAL',
  },
  updatedAt: { type: Date, default: Date.now },
};

/**
 * MongoDB Mongoose Model: User
 * Roles: CITIZEN, VOLUNTEER, GOVERNMENT, RESOURCE_PROVIDER
 */
export interface IUser {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'CITIZEN' | 'VOLUNTEER' | 'GOVERNMENT' | 'RESOURCE_PROVIDER';
  address?: string;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchemaDefinition = {
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['CITIZEN', 'VOLUNTEER', 'GOVERNMENT', 'RESOURCE_PROVIDER'],
    required: true,
    default: 'CITIZEN',
  },
  address: { type: String },
  organization: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

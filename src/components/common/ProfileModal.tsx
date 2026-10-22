import React, { useState } from 'react';
import { store } from '../../services/store';
import { User, VolunteerProfile, Role } from '../../types';
import { UserCheck, X, Check, ShieldAlert, Phone, Mail, MapPin, Award } from 'lucide-react';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address || '');
  const [organization, setOrganization] = useState(user.organization || '');

  // Volunteer specific
  const volProfile = user.role === 'VOLUNTEER' ? store.getVolunteerByUserId(user.id) : null;
  const [skills, setSkills] = useState(volProfile?.skills.join(', ') || 'Water Rescue, First Aid');
  const [serviceArea, setServiceArea] = useState(volProfile?.serviceArea || 'South Chennai & Coastal Belt');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(volProfile?.serviceRadiusKm || 15);

  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Update user
    user.name = name;
    user.phone = phone;
    user.address = address;
    if (organization) user.organization = organization;

    // Update volunteer profile if applicable
    if (volProfile) {
      store.updateVolunteerProfile(volProfile.id, {
        name,
        phone,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        serviceArea,
        serviceRadiusKm: Number(serviceRadiusKm),
      });
    }

    store.setCurrentUser(user);
    setSuccessMsg('Profile and account settings updated successfully!');
    setTimeout(() => {
      onUpdate(user);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-sans">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
              <UserCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Profile & Account Settings</h3>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                Role: {user.role} (Permanent)
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl font-semibold flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Registered Email (Cannot be changed)</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Address / Locality</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 14, Main Road, Adyar"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          {user.role === 'RESOURCE_PROVIDER' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organization Name</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Marina Marine Logistics"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          )}

          {user.role === 'VOLUNTEER' && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-[11px]">Volunteer Operational Settings:</span>
              <div>
                <label className="block text-slate-600 mb-0.5">Skills (comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-0.5">Service Area</label>
                  <input
                    type="text"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-0.5">Radius (km)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Update Password (Optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { store } from '../../services/store';
import { User, Role } from '../../types';
import {
  LifeBuoy,
  Users,
  Box,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  MapPin,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Building2,
  Award,
} from 'lucide-react';

interface RegisterPageProps {
  initialRole?: Role;
  onSuccess: (user: User) => void;
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  initialRole = 'CITIZEN',
  onSuccess,
  onNavigate,
}) => {
  const [selectedRole, setSelectedRole] = useState<Role>(
    initialRole === 'GOVERNMENT' ? 'CITIZEN' : initialRole
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Volunteer specific fields
  const [skills, setSkills] = useState('First Aid, Water Rescue');
  const [experience, setExperience] = useState('Civil Defense certified volunteer');
  const [serviceArea, setServiceArea] = useState('Chennai Coastal Sector');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedRole === 'GOVERNMENT') {
      setError('Government authority accounts cannot be created publicly. Contact the SDMA Systems Administrator.');
      return;
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const newUser = store.registerUser({
          name,
          email,
          phone: phone || '+91 98000 00000',
          password,
          role: selectedRole,
          address,
          organization: selectedRole === 'RESOURCE_PROVIDER' ? organization : undefined,
          volunteerData:
            selectedRole === 'VOLUNTEER'
              ? {
                  skills: skills.split(',').map((s) => s.trim()),
                  experience,
                  serviceArea,
                }
              : undefined,
        });
        setLoading(false);
        onSuccess(newUser);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Registration failed.');
      }
    }, 350);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            Already registered? <span className="text-red-400 font-bold ml-1">Sign In</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Create a ResQLink Account
            </h1>
            <p className="text-xs text-slate-400">
              Join the unified disaster response and coordination network.
            </p>
          </div>

          {/* Role Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Account Type:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { role: 'CITIZEN' as Role, label: '🙋 Citizen', color: 'border-red-500 bg-red-950/40 text-red-200' },
                  { role: 'VOLUNTEER' as Role, label: '🧑‍🚒 Volunteer', color: 'border-emerald-500 bg-emerald-950/40 text-emerald-200' },
                  { role: 'RESOURCE_PROVIDER' as Role, label: '📦 Logistics / NGO', color: 'border-purple-500 bg-purple-950/40 text-purple-200' },
                ]
              ).map((item) => (
                <button
                  type="button"
                  key={item.role}
                  onClick={() => {
                    setSelectedRole(item.role);
                    setError(null);
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition ${
                    selectedRole === item.role
                      ? `${item.color} shadow-sm ring-1 ring-white/20`
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">
                  Full Name / Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98400 11223"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-300">
                Primary Residential Address / Sector
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 12, Lake View Road, Madipakkam, Chennai"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs"
              />
            </div>

            {/* Role specific extras */}
            {selectedRole === 'VOLUNTEER' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-900/50 space-y-3">
                <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Volunteer Credentials & Operational Zone
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold text-[11px]">Specializations (Comma separated)</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="Water Rescue, First Aid, Boat Driver"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold text-[11px]">Operational Service Area</label>
                    <input
                      type="text"
                      value={serviceArea}
                      onChange={(e) => setServiceArea(e.target.value)}
                      placeholder="South Chennai & Coastal Belt"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'RESOURCE_PROVIDER' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-purple-900/50 space-y-3">
                <h4 className="font-bold text-purple-400 text-xs flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  Organization & Facility Details
                </h4>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold text-[11px]">NGO / Warehouse Organization Name</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Coastal Rescue Alliance & Relief Depot"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/50 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                'Creating Account...'
              ) : (
                <>
                  <span>Complete Registration & Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

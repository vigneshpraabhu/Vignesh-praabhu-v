import React, { useState } from 'react';
import { store } from '../../services/store';
import { User, Role } from '../../types';
import {
  Users,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Eye,
  EyeOff,
  Radio,
  ArrowLeft,
  ChevronRight,
  Compass,
  Award,
  Activity,
} from 'lucide-react';

interface VolunteerLoginPageProps {
  onSuccess: (user: User) => void;
  onNavigate: (tab: string, roleParam?: Role) => void;
  onOpenRegister?: () => void;
}

export const VolunteerLoginPage: React.FC<VolunteerLoginPageProps> = ({
  onSuccess,
  onNavigate,
  onOpenRegister,
}) => {
  const [email, setEmail] = useState('kavitha.rescuer@gmail.com');
  const [password, setPassword] = useState('volunteer123');
  const [callSign, setCallSign] = useState('RESCUER-SQUAD-CHN-04');
  const [operationalZone, setOperationalZone] = useState('South Chennai Coastal Belt');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoVolunteers = [
    {
      name: 'Kavitha Ramachandran',
      email: 'kavitha.rescuer@gmail.com',
      pass: 'volunteer123',
      callSign: 'BRAVO-RESCUE-01',
      skills: ['Water Rescue', 'Motorboat Operator', 'First Aid'],
      area: 'Velachery Lowland & Pallikaranai Marsh',
      badge: 'Certified Disaster Specialist',
    },
    {
      name: 'Sneha Fernandez (Paramedic)',
      email: 'sneha.medic@emergency.org',
      pass: 'volunteer123',
      callSign: 'MEDIC-SQUAD-03',
      skills: ['Trauma First Aid', 'Triage Care', 'Pediatric Rescue'],
      area: 'Besant Nagar & Adyar Riverbanks',
      badge: 'Field Medical Officer',
    },
    {
      name: 'Arun Kumar',
      email: 'arun.volunteer@gmail.com',
      pass: 'volunteer123',
      callSign: 'ALPHA-SCOUT-02',
      skills: ['Urban Search & Rescue', 'Heavy Vehicle Driver'],
      area: 'Madipakkam & St. Thomas Mount',
      badge: 'Ground Search Specialist',
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      try {
        const user = store.loginUser(email, password);
        if (user.role !== 'VOLUNTEER') {
          setError(`This account is registered as ${user.role}. Please use the ${user.role} portal.`);
          store.logoutUser();
          setLoading(false);
          return;
        }
        setLoading(false);
        onSuccess(user);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    }, 300);
  };

  const handleSelectDemo = (vol: typeof demoVolunteers[0]) => {
    setEmail(vol.email);
    setPassword(vol.pass);
    setCallSign(vol.callSign);
    setOperationalZone(vol.area);
    setError(null);
  };

  const handleInstantDemoLogin = (volEmail: string) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const user = store.loginUser(volEmail);
        setLoading(false);
        onSuccess(user);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Login failed');
      }
    }, 200);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Navigation Breadcrumb / Portal Selector */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Other Portals:</span>
            <button
              onClick={() => onNavigate('login-citizen')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 transition"
            >
              🙋 Citizen
            </button>
            <button
              onClick={() => onNavigate('login-government')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition"
            >
              🏛️ Gov EOC
            </button>
            <button
              onClick={() => onNavigate('login-provider')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 transition hidden sm:inline-block"
            >
              📦 Logistics
            </button>
          </div>
        </div>

        {/* Tactical Readiness Banner */}
        <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-emerald-950/30">
          <div className="flex items-center gap-2.5 text-emerald-200">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 font-black">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-white">Tactical Rescue Force Network: ONLINE</span>
              <p className="text-[11px] text-emerald-300">
                Live Geolocation Dispatch & Offline Mission Synchronization active across all response sectors.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-900 text-emerald-300 border border-emerald-700 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>42 Certified Units on Standby</span>
            </span>
          </div>
        </div>

        {/* Main Grid: Card Form + Info Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Login Card */}
          <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6">
              {/* Card Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[11px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Certified Ground Responders</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Volunteer Field Console Login
                </h1>
                <p className="text-xs text-slate-400">
                  Mobilize for assigned rescue missions, navigate submerged routes, log field obstacle blockers, and summon reinforcements.
                </p>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300">
                    Rescuer Email / Certified Account
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      id="volunteer-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. kavitha.rescuer@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">
                      Tactical Call Sign / Squad ID
                    </label>
                    <div className="relative">
                      <Radio className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        id="volunteer-callsign-input"
                        type="text"
                        value={callSign}
                        onChange={(e) => setCallSign(e.target.value)}
                        placeholder="RESCUER-SQUAD-04"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">
                      Primary Operational Sector
                    </label>
                    <div className="relative">
                      <Compass className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        id="volunteer-zone-input"
                        type="text"
                        value={operationalZone}
                        onChange={(e) => setOperationalZone(e.target.value)}
                        placeholder="Velachery / Coastal Belt"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-300">
                      Security Passphrase
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Demo default: <code className="text-emerald-400">volunteer123</code>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      id="volunteer-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs"
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

                <button
                  id="volunteer-login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    'Synchronizing Squad Roster...'
                  ) : (
                    <>
                      <span>Deploy to Rescuer Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Register Action */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Want to enlist in the certified disaster response corps?{' '}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenRegister) onOpenRegister();
                    else onNavigate('register');
                  }}
                  className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-1"
                >
                  Register as Volunteer Rescuer
                </button>
              </p>
            </div>
          </div>

          {/* Right Column: Demo Accounts & Capabilities */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Quick 1-Click Demo Rescuers */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Verified Squad Demo Profiles
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click any profile to test field operations, mission status workflows, and reinforcement summons:
              </p>

              <div className="space-y-2.5">
                {demoVolunteers.map((vol) => (
                  <div
                    key={vol.email}
                    className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-emerald-500/50 transition group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>🧑‍🚒</span>
                          <span>{vol.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Award className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{vol.badge}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {vol.callSign}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[9px]">
                      {vol.skills.map((skill) => (
                        <span key={skill} className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSelectDemo(vol)}
                        className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-[11px] rounded-lg border border-slate-700 transition"
                      >
                        Autofill
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInstantDemoLogin(vol.email)}
                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-xs transition flex items-center justify-center gap-1"
                      >
                        <span>Instant Login</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Volunteer Console Capabilities */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-3 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Rescuer Console Capabilities
              </h4>
              <ul className="space-y-2 text-slate-400 text-[11px]">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Mission Status Progression:</strong> Update status from <em>EN ROUTE</em> to <em>ARRIVED</em> and <em>COMPLETED</em> with 1-click.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Summon Emergency Manpower:</strong> Request additional squad reinforcements when submerged terrain traps victims.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Request Heavy Logistics:</strong> Order motorized boats, 4x4 trucks, or trauma medical packs direct from depots.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

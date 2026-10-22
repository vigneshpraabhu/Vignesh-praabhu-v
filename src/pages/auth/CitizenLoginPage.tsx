import React, { useState } from 'react';
import { store } from '../../services/store';
import { User, Role } from '../../types';
import {
  LifeBuoy,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Users,
  Eye,
  EyeOff,
  Radio,
  ArrowLeft,
  ChevronRight,
  Send,
} from 'lucide-react';

interface CitizenLoginPageProps {
  onSuccess: (user: User) => void;
  onNavigate: (tab: string, roleParam?: Role) => void;
  onOpenRegister?: () => void;
}

export const CitizenLoginPage: React.FC<CitizenLoginPageProps> = ({
  onSuccess,
  onNavigate,
  onOpenRegister,
}) => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('ramesh.citizen@gmail.com');
  const [password, setPassword] = useState('citizen123');
  const [phone, setPhone] = useState('+91 98412 34567');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoCitizens = [
    {
      name: 'Ramesh Balan',
      email: 'ramesh.citizen@gmail.com',
      pass: 'citizen123',
      location: 'AGS Colony, Velachery (Sector 4)',
      status: 'Flood Inundation Level: High',
      phone: '+91 98412 34567',
    },
    {
      name: 'Deepa Natarajan',
      email: 'deepa.citizen@gmail.com',
      pass: 'citizen123',
      location: '4th Cross Street, Perumbakkam',
      status: 'Relief Food & Water Needed',
      phone: '+91 94441 23890',
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      try {
        if (authMethod === 'phone') {
          // Find citizen with this phone or log in default citizen
          const users = store.getAllUsers();
          const found = users.find(
            (u) => u.role === 'CITIZEN' && u.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, '')
          );
          if (found) {
            store.loginUser(found.email);
            setLoading(false);
            onSuccess(found);
            return;
          }
          // Default to first citizen if mock OTP matched
          const user = store.switchDemoUser('CITIZEN');
          setLoading(false);
          onSuccess(user);
        } else {
          const user = store.loginUser(email, password);
          if (user.role !== 'CITIZEN') {
            setError(`This account is registered as ${user.role}. Please use the ${user.role} portal.`);
            store.logoutUser();
            setLoading(false);
            return;
          }
          setLoading(false);
          onSuccess(user);
        }
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    }, 300);
  };

  const handleSelectDemo = (citizen: typeof demoCitizens[0]) => {
    setEmail(citizen.email);
    setPassword(citizen.pass);
    setPhone(citizen.phone);
    setError(null);
  };

  const handleInstantDemoLogin = (citizenEmail: string) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const user = store.loginUser(citizenEmail);
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
              onClick={() => onNavigate('login-volunteer')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
            >
              🧑‍🚒 Volunteer
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

        {/* Emergency Alert Banner */}
        <div className="bg-red-950/80 border border-red-800/80 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-950/30">
          <div className="flex items-center gap-2.5 text-red-200">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 font-black animate-pulse">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">Direct Life Threatening Emergency?</span>
              <p className="text-[11px] text-red-300">
                Call Disaster Toll-Free <strong className="text-white">1070</strong> | Police <strong className="text-white">112</strong> | Ambulance <strong className="text-white">108</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              store.switchDemoUser('CITIZEN');
              onNavigate('citizen');
            }}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>⚡ Quick Emergency SOS</span>
          </button>
        </div>

        {/* Main Grid: Card Form + Info Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Login Card */}
          <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6">
              {/* Card Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800/60 text-[11px] font-bold uppercase tracking-wider">
                  <LifeBuoy className="w-3.5 h-3.5" />
                  <span>Citizen Disaster Support</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Citizen Portal Login
                </h1>
                <p className="text-xs text-slate-400">
                  Access emergency rescue requests, monitor assigned field volunteers, and find nearby relief shelters.
                </p>
              </div>

              {/* Login Method Toggle */}
              <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('email');
                    setError(null);
                  }}
                  className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    authMethod === 'email'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email & Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('phone');
                    setError(null);
                  }}
                  className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    authMethod === 'phone'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile OTP Login</span>
                </button>
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
                {authMethod === 'email' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-slate-300">
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          id="citizen-email-input"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. ramesh.citizen@gmail.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block font-semibold text-slate-300">
                          Password
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Demo default: <code className="text-red-400">citizen123</code>
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          id="citizen-password-input"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs"
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
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-slate-300">
                        Mobile Phone Number (India)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          id="citizen-phone-input"
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98412 34567"
                          className="w-full pl-10 pr-24 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(true);
                            setOtp('524108');
                          }}
                          className="absolute right-2 top-1.5 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-[10px] transition"
                        >
                          {otpSent ? 'Resend' : 'Send OTP'}
                        </button>
                      </div>
                    </div>

                    {otpSent && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block font-semibold text-slate-300">
                            6-Digit Verification Code
                          </label>
                          <span className="text-[11px] text-emerald-400">
                            Simulated OTP auto-filled: 524108
                          </span>
                        </div>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="524108"
                          maxLength={6}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white tracking-widest text-center font-mono font-bold focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
                        />
                      </div>
                    )}
                  </>
                )}

                <button
                  id="citizen-login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/50 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    'Verifying Credentials...'
                  ) : (
                    <>
                      <span>Enter Citizen Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Register Action */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                New to ResQLink?{' '}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenRegister) onOpenRegister();
                    else onNavigate('register');
                  }}
                  className="font-bold text-red-400 hover:text-red-300 underline underline-offset-2 ml-1"
                >
                  Create a Free Citizen Account
                </button>
              </p>
            </div>
          </div>

          {/* Right Column: Demo Accounts & Guidance */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Quick 1-Click Demo Profiles */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  1-Click Examiner Demo Profiles
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click any profile to instantly authenticate as an affected citizen with active emergency requests in the system:
              </p>

              <div className="space-y-2.5">
                {demoCitizens.map((citizen) => (
                  <div
                    key={citizen.email}
                    className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-red-500/50 transition group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>🙋</span>
                          <span>{citizen.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="truncate">{citizen.location}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        {citizen.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSelectDemo(citizen)}
                        className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-[11px] rounded-lg border border-slate-700 transition"
                      >
                        Autofill
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInstantDemoLogin(citizen.email)}
                        className="flex-1 py-1.5 px-2 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded-lg shadow-xs transition flex items-center justify-center gap-1"
                      >
                        <span>Instant Login</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citizen Features Showcase */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-3 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Citizen Console Capabilities
              </h4>
              <ul className="space-y-2 text-slate-400 text-[11px]">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span><strong>Pin Precise GPS Location:</strong> Drop an exact map pin even when cellular street names are flooded.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span><strong>Track Assigned Rescuers:</strong> Live status updates from <em>VERIFIED</em> to <em>EN ROUTE</em> and <em>ARRIVED</em>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span><strong>Nearby Relief Camps:</strong> Check real-time remaining capacity, food, water, and medical resources.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

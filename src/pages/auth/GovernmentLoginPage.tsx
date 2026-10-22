import React, { useState } from 'react';
import { store } from '../../services/store';
import { User, Role } from '../../types';
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronRight,
  KeyRound,
  Fingerprint,
  Landmark,
  BadgeAlert,
  FileCheck2,
} from 'lucide-react';

interface GovernmentLoginPageProps {
  onSuccess: (user: User) => void;
  onNavigate: (tab: string, roleParam?: Role) => void;
}

export const GovernmentLoginPage: React.FC<GovernmentLoginPageProps> = ({
  onSuccess,
  onNavigate,
}) => {
  const [email, setEmail] = useState('admin@disaster.gov.in');
  const [password, setPassword] = useState('admin123');
  const [officerCode, setOfficerCode] = useState('IAS-TN-EOC-2024-09');
  const [twoFactorCode, setTwoFactorCode] = useState('891-442');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoOfficer = {
    name: 'Dr. Rajesh Sundaram (IAS)',
    email: 'admin@disaster.gov.in',
    pass: 'admin123',
    code: 'IAS-TN-EOC-2024-09',
    designation: 'State Incident Commander & EOC Director',
    department: 'State Disaster Management Authority (SDMA)',
    clearance: 'Level-4 Executive Authority',
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      try {
        const user = store.loginUser(email, password);
        if (user.role !== 'GOVERNMENT') {
          setError(`This account is registered as ${user.role}. Please use the ${user.role} portal.`);
          store.logoutUser();
          setLoading(false);
          return;
        }
        setLoading(false);
        onSuccess(user);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Authorization failed. Verify your government credentials.');
      }
    }, 350);
  };

  const handleAutofillDemo = () => {
    setEmail(demoOfficer.email);
    setPassword(demoOfficer.pass);
    setOfficerCode(demoOfficer.code);
    setError(null);
  };

  const handleInstantDemoLogin = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const user = store.loginUser(demoOfficer.email);
        setLoading(false);
        onSuccess(user);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Login failed');
      }
    }, 200);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#020617] via-[#091124] to-[#020617] text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans">
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
              onClick={() => onNavigate('login-volunteer')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
            >
              🧑‍🚒 Volunteer
            </button>
            <button
              onClick={() => onNavigate('login-provider')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 transition hidden sm:inline-block"
            >
              📦 Logistics
            </button>
          </div>
        </div>

        {/* High Security Clearance Statutory Banner */}
        <div className="bg-amber-950/60 border border-amber-800/80 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
          <div className="flex items-center gap-2.5 text-amber-200">
            <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-slate-950 shrink-0 font-black">
              <BadgeAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-100">RESTRICTED GOVERNMENT CLEARANCE — LEVEL 4</span>
              <p className="text-[11px] text-amber-300/90">
                Authorized administrative access only. System audited in compliance with the Disaster Management Act, 2005.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-900/60 text-amber-300 border border-amber-700">
            SEC-CLEARANCE-ACTIVE
          </span>
        </div>

        {/* Main Grid: Card Form + Info Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Login Card */}
          <div className="lg:col-span-7 bg-[#0b152e]/90 backdrop-blur-md border border-blue-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6">
              {/* Card Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 text-[11px] font-bold uppercase tracking-wider">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>State Disaster Management Authority</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  EOC Incident Command Login
                </h1>
                <p className="text-xs text-slate-400">
                  Control room portal for verified emergency triage, volunteer assignments, SLA escalation, and spatial GIS incident tracking.
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
                    Official Government Email (.gov.in / Designated)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      id="gov-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@disaster.gov.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#030919] border border-blue-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">
                      Officer Cadre / Employee ID
                    </label>
                    <div className="relative">
                      <Fingerprint className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        id="gov-code-input"
                        type="text"
                        value={officerCode}
                        onChange={(e) => setOfficerCode(e.target.value)}
                        placeholder="IAS-TN-EOC-2024-09"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#030919] border border-blue-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">
                      Digital 2FA Token Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        id="gov-2fa-input"
                        type="text"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder="891-442"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#030919] border border-blue-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs font-mono"
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
                      Demo default: <code className="text-blue-400">admin123</code>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      id="gov-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#030919] border border-blue-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs"
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
                  id="gov-login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-950/50 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    'Authenticating Security Clearance...'
                  ) : (
                    <>
                      <span>Enter EOC Command Room</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Security Note */}
            <div className="mt-6 pt-5 border-t border-blue-900/40 text-center">
              <p className="text-[11px] text-slate-400">
                Government administrator accounts require departmental commission. Public registration is prohibited.
              </p>
            </div>
          </div>

          {/* Right Column: Demo Account & EOC Capabilities */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Quick 1-Click Demo Officer */}
            <div className="bg-[#0b152e]/80 border border-blue-900/50 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Authorized Incident Commander Profile
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click below to instantly sign in as the chief state disaster commissioner with full command authority:
              </p>

              <div className="p-3.5 bg-[#030919] rounded-2xl border border-blue-900/60 hover:border-blue-500/50 transition group space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>🏛️</span>
                      <span>{demoOfficer.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {demoOfficer.designation}
                    </div>
                    <div className="text-[10px] text-blue-300 font-mono mt-0.5">
                      {demoOfficer.department}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    CLEARANCE: L4
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAutofillDemo}
                    className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-[11px] rounded-lg border border-slate-700 transition"
                  >
                    Autofill
                  </button>
                  <button
                    type="button"
                    onClick={handleInstantDemoLogin}
                    className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg shadow-xs transition flex items-center justify-center gap-1"
                  >
                    <span>Instant Login</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* EOC Command Room Capabilities */}
            <div className="bg-[#0b152e]/60 border border-blue-900/40 rounded-3xl p-5 space-y-3 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                EOC Incident Command Privileges
              </h4>
              <ul className="space-y-2 text-slate-400 text-[11px]">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>Verify & Prioritize Incidents:</strong> Audit incoming citizen distress calls and elevate to <em>CRITICAL</em>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>Mobilize Volunteer Squads:</strong> Dispatch certified rescuers according to proximity and operational skills.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>SLA Escalation Engine:</strong> Background monitor automatically flags unassigned critical cases exceeding 5 mins.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

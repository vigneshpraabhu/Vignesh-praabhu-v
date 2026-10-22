import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { DashboardStats, Alert, Role } from '../types';
import {
  LifeBuoy,
  Users,
  Sparkles,
} from 'lucide-react';
interface HomePageProps {
  onNavigate: (tab: string, role?: Role) => void;
  onOpenAuth?: (mode: 'login' | 'register', role?: Role) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuth }) => {
  const [stats, setStats] = useState<DashboardStats>(store.getDashboardStats());
  const [alerts, setAlerts] = useState<Alert[]>(store.getAlerts());

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setStats(store.getDashboardStats());
      setAlerts(store.getAlerts());
    });
    return unsub;
  }, []);

  const activeAlerts = alerts.filter((a) => a.active);

  const handleRoleLogin = (role: Role) => {
    if (onOpenAuth) {
      onOpenAuth('login', role);
    } else {
      onNavigate('login', role);
    }
  };

  const handleQuickDemoAccess = (role: Role) => {
    store.switchDemoUser(role);
    if (role === 'GOVERNMENT') onNavigate('government');
    else if (role === 'VOLUNTEER') onNavigate('volunteer');
    else if (role === 'CITIZEN') onNavigate('citizen');
    else if (role === 'RESOURCE_PROVIDER') onNavigate('provider');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Active Advisory Banner (if any emergency alert active) */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-700 text-white px-4 py-2 text-xs font-semibold shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="truncate">
              ⚠️ <strong>{activeAlerts[0].title}:</strong> {activeAlerts[0].message}
            </span>
            <button
              onClick={() => handleQuickDemoAccess('CITIZEN')}
              className="ml-3 text-[11px] bg-white text-red-800 font-bold px-2.5 py-0.5 rounded shrink-0 hover:bg-red-50"
            >
              Report Need
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col justify-center space-y-8">
        
        {/* Hero Headline */}
        <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Emergency Response & Relief Network
          </h1>
          <p className="text-sm text-slate-300">
            Connect citizens in distress with certified rescue volunteers, emergency authorities, and relief shelters in real time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('login-citizen')}
              className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Report Emergency</span>
            </button>
            <button
              onClick={() => onNavigate('login-volunteer')}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Volunteer Console</span>
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>All Role Portals</span>
            </button>
          </div>
        </div>

        {/* 4 Clean Portals */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Role Portals & Dedicated Logins
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Citizen */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 hover:border-red-500/80 flex flex-col justify-between space-y-4 transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 border border-red-800 flex items-center justify-center text-xl mb-3">
                  🙋
                </div>
                <h3 className="font-bold text-white text-base">Citizen Portal</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Request rescue, food, clean water, or locate nearby verified relief shelters.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('login-citizen')}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <span>Citizen Login Portal →</span>
                </button>
                <button
                  onClick={() => handleQuickDemoAccess('CITIZEN')}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-700/80 text-slate-300 font-medium text-[11px] rounded-lg border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>1-Click Demo Access</span>
                </button>
              </div>
            </div>

            {/* 2. Volunteer */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 hover:border-emerald-500/80 flex flex-col justify-between space-y-4 transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-xl mb-3">
                  🧑‍🚒
                </div>
                <h3 className="font-bold text-white text-base">Volunteer Console</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Set service radius, browse nearby emergencies, mobilize, and log mission reports.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('login-volunteer')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <span>Volunteer Login Portal →</span>
                </button>
                <button
                  onClick={() => handleQuickDemoAccess('VOLUNTEER')}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-700/80 text-slate-300 font-medium text-[11px] rounded-lg border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>1-Click Demo Access</span>
                </button>
              </div>
            </div>

            {/* 3. Government */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 hover:border-blue-500/80 flex flex-col justify-between space-y-4 transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center text-xl mb-3">
                  🏛️
                </div>
                <h3 className="font-bold text-white text-base">Government EOC</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Central control room for incident triage, volunteer dispatch, and spatial GIS tracking.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('login-government')}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <span>Government EOC Login →</span>
                </button>
                <button
                  onClick={() => handleQuickDemoAccess('GOVERNMENT')}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-700/80 text-slate-300 font-medium text-[11px] rounded-lg border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span>1-Click Demo Access</span>
                </button>
              </div>
            </div>

            {/* 4. Resource Provider */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 hover:border-purple-500/80 flex flex-col justify-between space-y-4 transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center text-xl mb-3">
                  📦
                </div>
                <h3 className="font-bold text-white text-base">Resource Provider & Camps</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage rescue boats, 4x4 trucks, food crates, and live relief camp capacities.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('login-provider')}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <span>Resource Provider Login →</span>
                </button>
                <button
                  onClick={() => handleQuickDemoAccess('RESOURCE_PROVIDER')}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-700/80 text-slate-300 font-medium text-[11px] rounded-lg border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>1-Click Demo Access</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* "How Does It Work?" 3 Simple Steps */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              How Does It Work?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-2 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="font-bold text-white text-base">1. Report Your Need</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pin your location on the map, select the need (Rescue, Food, Medical, Shelter), and state how many people need help.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-2 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="font-bold text-white text-base">2. Proximity Matching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Volunteers set their personal rescue radius. Responders within range are alerted immediately for quick turnaround.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-2 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="font-bold text-white text-base">3. Rapid Relief & Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Volunteers deliver supplies or rescue, update progress in real time, and mark missions safely completed.
              </p>
            </div>
          </div>
        </div>

        {/* Compact Live Status Counts Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-800/60 p-4 rounded-2xl border border-slate-800 max-w-4xl mx-auto w-full">
          <div className="text-center">
            <span className="text-slate-400 block text-[11px]">Total Incidents Reported</span>
            <strong className="text-white text-base">{stats.totalRequests}</strong>
          </div>
          <div className="text-center">
            <span className="text-amber-400 block text-[11px]">Pending Triage</span>
            <strong className="text-amber-300 text-base">{stats.pendingRequests}</strong>
          </div>
          <div className="text-center">
            <span className="text-emerald-400 block text-[11px]">Active Rescuers</span>
            <strong className="text-emerald-300 text-base">{stats.availableVolunteers}</strong>
          </div>
          <div className="text-center">
            <span className="text-cyan-400 block text-[11px]">Safe Relief Camps</span>
            <strong className="text-cyan-300 text-base">{stats.registeredReliefCamps}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { store } from '../../services/store';
import { User, Role } from '../../types';
import {
  LifeBuoy,
  Users,
  Building2,
  Box,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Landmark,
  Truck,
  CheckCircle2,
} from 'lucide-react';

interface RoleSelectLoginPageProps {
  onSelectRole: (role: Role) => void;
  onSuccess: (user: User) => void;
  onNavigate: (tab: string) => void;
  onOpenRegister?: () => void;
}

export const RoleSelectLoginPage: React.FC<RoleSelectLoginPageProps> = ({
  onSelectRole,
  onSuccess,
  onNavigate,
  onOpenRegister,
}) => {
  const rolesData: {
    role: Role;
    title: string;
    subtitle: string;
    icon: string;
    lucideIcon: React.ReactNode;
    color: string;
    borderColor: string;
    glowColor: string;
    badge: string;
    description: string;
    primaryDemoUser: string;
    targetTab: string;
    features: string[];
  }[] = [
    {
      role: 'CITIZEN',
      title: 'Citizen Portal',
      subtitle: 'Emergency Reporting & Relief',
      icon: '🙋',
      lucideIcon: <LifeBuoy className="w-5 h-5 text-red-400" />,
      color: 'bg-red-600 hover:bg-red-500',
      borderColor: 'border-red-500/40 hover:border-red-500',
      glowColor: 'bg-red-600/10',
      badge: 'Public Emergency Access',
      description: 'Report life-threatening entrapments, food/water shortages, and track rescue teams in real time.',
      primaryDemoUser: 'ramesh.citizen@gmail.com',
      targetTab: 'login-citizen',
      features: ['GPS Pinpoint Reporting', 'Assigned Rescuer Live Tracking', 'Nearby Relief Camps Map'],
    },
    {
      role: 'VOLUNTEER',
      title: 'Volunteer Rescuer',
      subtitle: 'Tactical Field Operations',
      icon: '🧑‍🚒',
      lucideIcon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      color: 'bg-emerald-600 hover:bg-emerald-500',
      borderColor: 'border-emerald-500/40 hover:border-emerald-500',
      glowColor: 'bg-emerald-600/10',
      badge: 'Certified Ground Units',
      description: 'Tactical field console with offline synchronization, obstacle blocker reporting, and reinforcement summons.',
      primaryDemoUser: 'kavitha.rescuer@gmail.com',
      targetTab: 'login-volunteer',
      features: ['Field Mission Lifecycle', 'Request Additional Manpower', 'Summon Rescue Boats & Gear'],
    },
    {
      role: 'GOVERNMENT',
      title: 'Government EOC',
      subtitle: 'Incident Command Room',
      icon: '🏛️',
      lucideIcon: <Landmark className="w-5 h-5 text-blue-400" />,
      color: 'bg-blue-600 hover:bg-blue-500',
      borderColor: 'border-blue-500/40 hover:border-blue-500',
      glowColor: 'bg-blue-600/10',
      badge: 'SDMA / NDRF Level-4 Access',
      description: 'Central incident command to verify calls, override triage priorities, track spatial distributions, and enforce SLAs.',
      primaryDemoUser: 'admin@disaster.gov.in',
      targetTab: 'login-government',
      features: ['Incident Triage & Verification', 'Volunteer Mobilization', '5-Min Critical SLA Escalation'],
    },
    {
      role: 'RESOURCE_PROVIDER',
      title: 'Resource Provider',
      subtitle: 'Logistics Fleets & Shelters',
      icon: '📦',
      lucideIcon: <Truck className="w-5 h-5 text-purple-400" />,
      color: 'bg-purple-600 hover:bg-purple-500',
      borderColor: 'border-purple-500/40 hover:border-purple-500',
      glowColor: 'bg-purple-600/10',
      badge: 'Supply Chain & Camps',
      description: 'Logistics asset registry (motorized boats, 4x4 trucks, generators, ration crates) and live camp capacity monitoring.',
      primaryDemoUser: 'operations@marina-rescue.org',
      targetTab: 'login-provider',
      features: ['Rescue Fleet Management', 'Relief Camp Live Occupancy', 'Rescuer Equipment Dispatch'],
    },
  ];

  const handleInstantDemo = (email: string) => {
    try {
      const user = store.loginUser(email);
      onSuccess(user);
    } catch {
      // fallback
      const user = store.switchDemoUser('CITIZEN');
      onSuccess(user);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Unified Multi-Role Disaster Gateway</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Select Your Role Login Portal
          </h1>
          <p className="text-sm text-slate-400">
            ResQLink provides dedicated, role-tailored authentication portals with custom operational consoles for every stakeholder.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {rolesData.map((item) => (
            <div
              key={item.role}
              className={`bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 border ${item.borderColor} shadow-xl flex flex-col justify-between space-y-5 transition relative overflow-hidden group hover:-translate-y-1`}
            >
              <div className={`absolute -top-12 -right-12 w-32 h-32 ${item.glowColor} rounded-full blur-2xl pointer-events-none`} />

              <div className="space-y-4">
                {/* Top Role Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                    {item.badge}
                  </span>
                </div>

                {/* Title & Desc */}
                <div>
                  <h3 className="font-extrabold text-white text-lg tracking-tight">
                    {item.title}
                  </h3>
                  <div className="text-xs font-medium text-slate-400">
                    {item.subtitle}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Key Features */}
                <div className="space-y-1.5 pt-1">
                  {item.features.map((feat) => (
                    <div key={feat} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    onSelectRole(item.role);
                    onNavigate(item.targetTab);
                  }}
                  className={`w-full py-2.5 ${item.color} text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer`}
                >
                  <span>Open {item.title} Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleInstantDemo(item.primaryDemoUser)}
                  className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-[11px] rounded-lg border border-slate-800 transition flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Instant 1-Click Demo</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Registration & SOS Help Strip */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <LifeBuoy className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              Don't have an account yet? Register as a <strong>Citizen</strong>, <strong>Volunteer Rescuer</strong>, or <strong>Resource Provider</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onOpenRegister) onOpenRegister();
              else onNavigate('register');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition shrink-0"
          >
            Register New Account →
          </button>
        </div>

      </div>
    </div>
  );
};

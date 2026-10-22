import React, { useState } from 'react';
import {
  GraduationCap,
  X,
  Compass,
  MapPin,
  LifeBuoy,
  Users,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight,
  BookOpen,
  Code,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Role } from '../../types';

interface StudentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickRoleSelect: (role: Role) => void;
}

export const StudentGuideModal: React.FC<StudentGuideModalProps> = ({
  isOpen,
  onClose,
  onQuickRoleSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'how-to-use' | 'volunteer-guide' | 'viva-script' | 'architecture'>('how-to-use');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-5 sm:p-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shrink-0">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Simple Student Guide
                </span>
                <span className="text-[10px] text-emerald-200 font-semibold">
                  College Project & Volunteer Playbook
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                How a College Student Uses ResQLink
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-1.5 overflow-x-auto shrink-0 text-xs font-bold">
          {[
            { id: 'how-to-use', label: '1. How Does It Work?', icon: BookOpen },
            { id: 'volunteer-guide', label: '2. Student Volunteer Guide (Radius & Skills)', icon: Sliders },
            { id: 'viva-script', label: '3. 3-Minute College Viva / Presentation Script', icon: Zap },
            { id: 'architecture', label: '4. Tech Stack & Architecture', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-800 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* TAB 1: How Does It Work */}
          {activeTab === 'how-to-use' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-950">
                <h3 className="font-black text-sm text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  The Big Picture in Plain English
                </h3>
                <p className="mt-1 text-xs text-emerald-800">
                  During a flood, cyclone, or emergency, phone lines get jammed and chaos happens.
                  ResQLink connects <strong>4 groups of people</strong> into one synchronized real-time web platform:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span className="text-xl">🙋</span>
                    <span>1. Citizen in Need</span>
                  </div>
                  <p className="text-slate-600">
                    If you or your family/roommates are stranded in a waterlogged area, you drop a GPS pin, choose the emergency type (Rescue, Food, Medical, Shelter), and hit submit. No login barriers needed.
                  </p>
                  <button
                    onClick={() => {
                      onQuickRoleSelect('CITIZEN');
                      onClose();
                    }}
                    className="text-red-700 hover:text-red-800 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <span>Test Citizen Need Mode</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span className="text-xl">🧑‍🚒</span>
                    <span>2. Student Volunteer / Rescuer</span>
                  </div>
                  <p className="text-slate-600">
                    College students and NSS volunteers can sign up, set their operational radius (e.g. 5km around college campus), pick their skills (food distribution, first aid), and accept nearby calls.
                  </p>
                  <button
                    onClick={() => {
                      onQuickRoleSelect('VOLUNTEER');
                      onClose();
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <span>Test Student Volunteer Mode</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span className="text-xl">🏛️</span>
                    <span>3. Coordinator / EOC Authority</span>
                  </div>
                  <p className="text-slate-600">
                    Disaster management authorities or campus emergency coordinators monitor city-wide incidents on an interactive map, triage priority (CRITICAL/HIGH), and assign rescue squads.
                  </p>
                  <button
                    onClick={() => {
                      onQuickRoleSelect('GOVERNMENT');
                      onClose();
                    }}
                    className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <span>Test Coordinator / Authority Mode</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span className="text-xl">📦</span>
                    <span>4. Resource Provider</span>
                  </div>
                  <p className="text-slate-600">
                    NGOs and campus supply depots manage relief supplies: food packets, water cartons, inflatable rescue dinghies, 4x4 trucks, and power generators.
                  </p>
                  <button
                    onClick={() => {
                      onQuickRoleSelect('RESOURCE_PROVIDER');
                      onClose();
                    }}
                    className="text-purple-700 hover:text-purple-800 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <span>Test Resource Provider Mode</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Volunteer Guide (Radius & Skills) */}
          {activeTab === 'volunteer-guide' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <h3 className="font-bold text-emerald-900 text-sm">
                  How a College Student Volunteers (Step-by-Step)
                </h3>
                <p className="text-emerald-800 mt-1">
                  Students don't need to be deep-sea divers to help. Most emergency tasks during floods involve food distribution, guiding families to relief camps, and relaying communication!
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 text-sm block">Set Your Rescue Radius:</strong>
                    <p className="text-slate-600 mt-0.5">
                      As a student, you might only have a bicycle, bike, or be on foot. Use the <strong>Radius Slider</strong> in the volunteer console to set a safe distance (e.g. <strong>3 km to 10 km</strong> around your college campus or hostel). You will only see emergencies inside your zone!
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 text-sm block">Pick Your Skills & Equipment:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Click the skills pills in your profile: <em>"Relief Camp Logistics"</em>, <em>"Food Distribution"</em>, <em>"First Aid / CPR"</em>, or <em>"Water Rescue"</em>. Authorities match tasks to what you are certified or trained to do.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 text-sm block">Accept Assignment & Mobilize:</strong>
                    <p className="text-slate-600 mt-0.5">
                      When you click <strong>"Accept Assignment & Mobilize"</strong>, your status updates to <em>"En Route / Arrived"</em>. You can log field notes, report road obstacles, and when done, submit an official completion report with the count of people helped.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm block">Ready to try the Volunteer Console?</span>
                  <span className="text-slate-400 text-xs">Jump straight into Kavitha's volunteer profile with live radius controls.</span>
                </div>
                <button
                  onClick={() => {
                    onQuickRoleSelect('VOLUNTEER');
                    onClose();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                >
                  Open Volunteer Console →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Viva & Presentation Script */}
          {activeTab === 'viva-script' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                <h3 className="font-bold text-blue-900 text-sm">
                  3-Minute Demo Script for College Viva / Project Review
                </h3>
                <p className="text-blue-800 mt-1">
                  Memorize or reference this 4-step script when presenting this project to your external examiner or professor:
                </p>
              </div>

              <div className="space-y-3 font-sans">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Minute 1: The Problem & Citizen Request
                  </span>
                  <p className="text-slate-700 mt-2">
                    <em>"Good morning respected professors. Our capstone project is <strong>ResQLink</strong>. During real disasters like the Chennai floods, calls get lost across WhatsApp groups and phones. First, we demonstrate the <strong>Citizen Portal</strong>: a citizen stranded in Velachery pins their GPS location, requests medical evacuation for 3 people, and submits."</em>
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Minute 2: Dynamic Proximity Radius Engine
                  </span>
                  <p className="text-slate-700 mt-2">
                    <em>"Next, we switch to our <strong>Volunteer Console</strong>. Here we implement real-time <strong>Haversine geodesic distance calculation</strong>. Notice how the volunteer can change their operational radius from 5km to 20km. The Leaflet map instantly resizes the coverage boundary and filters only emergency incidents within that exact radius."</em>
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-mono font-bold text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    Minute 3: Multi-Role Coordination & Offline Resilience
                  </span>
                  <p className="text-slate-700 mt-2">
                    <em>"Finally, the volunteer requests inflatable rescue boats from the <strong>Resource Provider</strong>, submits field notes with blocker obstacles, and completes the ticket. The <strong>Government EOC</strong> verifies the evacuation count and closes the ticket with complete audit trails. Furthermore, our system features an <strong>IndexedDB offline queue</strong> that syncs once network returns."</em>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Architecture */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Software Architecture Summary</span>
                <h3 className="font-bold text-sm text-white">Full-Stack Reactive Disaster Management Architecture</h3>
                <p className="text-xs text-slate-300">
                  Designed adhering to modern single-page web architecture (SPA) with reactive pub/sub state synchronization and GIS spatial geometry.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-xs">💻 Frontend Stack</span>
                  <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                    <li>React 19 + TypeScript (strict typing)</li>
                    <li>Tailwind CSS (utility-first design)</li>
                    <li>Leaflet GIS Maps + OpenStreetMap API</li>
                    <li>Lucide Icons for tactical emergency symbols</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-xs">⚙️ State & Storage</span>
                  <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                    <li>Reactive Observable Store pattern</li>
                    <li>Local persistence across page reloads</li>
                    <li>Offline action queue with retry logic</li>
                    <li>Haversine formula for spherical distance</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            💡 Tip: You can switch between all 4 roles anytime from the home screen or navbar menu.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
          >
            Got It, Let's Explore!
          </button>
        </div>
      </div>
    </div>
  );
};

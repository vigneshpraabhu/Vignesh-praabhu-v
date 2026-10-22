import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { Role, User, AppNotification } from '../../types';
import {
  LifeBuoy,
  Bell,
  Wifi,
  WifiOff,
  ShieldAlert,
  Presentation,
  Terminal,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';

import { ProfileModal } from './ProfileModal';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, roleParam?: Role) => void;
  onOpenAuth: (mode: 'login' | 'register', role?: Role) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenAuth }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [isOffline, setIsOffline] = useState(store.isOffline());
  const [offlineQueue, setOfflineQueue] = useState(store.getOfflineQueue());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setIsOffline(store.isOffline());
      setOfflineQueue(store.getOfflineQueue());
      setNotifications(
        store.getNotifications(currentUser?.id, currentUser?.role)
      );
    });
    setNotifications(
      store.getNotifications(currentUser?.id, currentUser?.role)
    );
    return unsub;
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRoleSwitch = (role: Role) => {
    store.switchDemoUser(role);
    setShowUserMenu(false);
    if (role === 'GOVERNMENT') onNavigate('government');
    else if (role === 'VOLUNTEER') onNavigate('volunteer');
    else if (role === 'CITIZEN') onNavigate('citizen');
    else if (role === 'RESOURCE_PROVIDER') onNavigate('provider');
  };

  const handleLogout = () => {
    store.logoutUser();
    setShowUserMenu(false);
    onNavigate('home');
  };

  const getDashboardTabForRole = (role: Role): string => {
    if (role === 'GOVERNMENT') return 'government';
    if (role === 'VOLUNTEER') return 'volunteer';
    if (role === 'CITIZEN') return 'citizen';
    return 'provider';
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white">
                ResQLink
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5">
                Emergency Response
              </p>
            </div>
          </div>

          {/* Simple Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-1.5 text-xs font-medium">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentTab === 'home'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>

            {/* Direct Need Help Link */}
            <button
              onClick={() => {
                if (currentUser?.role === 'CITIZEN') {
                  onNavigate('citizen');
                } else {
                  onNavigate('login-citizen');
                }
              }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                currentTab === 'citizen' || currentTab === 'login-citizen'
                  ? 'bg-red-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Need Help</span>
            </button>

            {/* Direct Volunteer Link */}
            <button
              onClick={() => {
                if (currentUser?.role === 'VOLUNTEER') {
                  onNavigate('volunteer');
                } else {
                  onNavigate('login-volunteer');
                }
              }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                currentTab === 'volunteer' || currentTab === 'login-volunteer'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Volunteer</span>
            </button>

            <button
              onClick={() => onNavigate('camps')}
              className={`px-3 py-1.5 rounded-lg transition hidden md:inline-flex ${
                currentTab === 'camps'
                  ? 'bg-slate-800 text-amber-300 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Relief Camps
            </button>

            {!currentUser && (
              <>
                <div className="relative">
                  <button
                    id="navbar-login-btn"
                    onClick={() => setShowLoginMenu(!showLoginMenu)}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      currentTab.startsWith('login')
                        ? 'bg-red-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showLoginMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-2xl z-50 p-2 text-xs">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                        Dedicated Role Portals:
                      </div>
                      <button
                        onClick={() => {
                          setShowLoginMenu(false);
                          onNavigate('login-citizen');
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-red-400 flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="font-semibold">🙋 Citizen Login</span>
                        <span className="text-[10px] text-slate-500">Public</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowLoginMenu(false);
                          onNavigate('login-volunteer');
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-emerald-400 flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="font-semibold">🧑‍🚒 Volunteer Login</span>
                        <span className="text-[10px] text-slate-500">Rescuers</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowLoginMenu(false);
                          onNavigate('login-government');
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-blue-400 flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="font-semibold">🏛️ Government EOC</span>
                        <span className="text-[10px] text-slate-500">Command</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowLoginMenu(false);
                          onNavigate('login-provider');
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-purple-400 flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="font-semibold">📦 Resource Provider</span>
                        <span className="text-[10px] text-slate-500">Supplies</span>
                      </button>

                      <div className="border-t border-slate-800 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setShowLoginMenu(false);
                            onNavigate('login');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-amber-300 font-bold text-[11px] flex items-center justify-between transition cursor-pointer"
                        >
                          <span>All Portals Overview</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onNavigate('register')}
                  className={`px-3 py-1.5 rounded-lg transition hidden sm:flex items-center gap-1.5 ${
                    currentTab === 'register'
                      ? 'bg-red-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Tools: Offline Indicator, Notifications & User State */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Offline indicator */}
            <button
              onClick={() => store.toggleSimulatedOffline()}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                isOffline
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-slate-800 text-emerald-400 border-slate-700'
              }`}
              title={isOffline ? 'Offline mode active' : 'Online mode active'}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3 h-3 text-rose-400" />
                  <span>Offline ({offlineQueue.length})</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>Online</span>
                </>
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-2.5 bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
                    <span>Operations Feed ({notifications.length})</span>
                    <button
                      onClick={() => store.markAllNotificationsAsRead(currentUser?.id, currentUser?.role)}
                      className="text-[10px] text-amber-300 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">No notifications.</div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div key={n.id} className="p-2.5 hover:bg-slate-50 transition">
                          <div className="font-semibold text-slate-900 text-[11px]">{n.title}</div>
                          <div className="text-slate-600 text-[11px] leading-tight mt-0.5">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* IF LOGGED IN: Show My Dashboard and Profile */}
            {currentUser && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate(getDashboardTabForRole(currentUser.role))}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1 shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">My Dashboard</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-amber-300">
                      {currentUser.role}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-2xl z-50 p-2 text-xs">
                      <div className="p-2 border-b border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">{currentUser.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                          <span className="inline-block mt-1 bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            {currentUser.role}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowProfileModal(true);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] font-bold rounded border border-slate-700"
                        >
                          Edit Profile
                        </button>
                      </div>

                      <div className="p-2 text-[10px] font-bold uppercase text-slate-400">
                        Switch Role Portal:
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => handleRoleSwitch('GOVERNMENT')}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] text-slate-300"
                        >
                          🏛️ Government EOC
                        </button>
                        <button
                          onClick={() => handleRoleSwitch('VOLUNTEER')}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] text-slate-300"
                        >
                          🧑‍🚒 Volunteer Unit
                        </button>
                        <button
                          onClick={() => handleRoleSwitch('CITIZEN')}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] text-slate-300"
                        >
                          🙋 Citizen Portal
                        </button>
                        <button
                          onClick={() => handleRoleSwitch('RESOURCE_PROVIDER')}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] text-slate-300"
                        >
                          📦 Resource Provider
                        </button>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full px-2 py-1.5 rounded text-rose-400 hover:bg-rose-950/40 text-left flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out (Return to Guest)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProfileModal && currentUser && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(u) => setCurrentUser(u)}
        />
      )}
    </header>
  );
};

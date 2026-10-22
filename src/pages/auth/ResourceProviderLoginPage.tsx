import React, { useState } from 'react';
import { store } from '../../services/store';
import { User, Role } from '../../types';
import {
  Box,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Truck,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronRight,
  Warehouse,
  PackageCheck,
  Container,
} from 'lucide-react';

interface ResourceProviderLoginPageProps {
  onSuccess: (user: User) => void;
  onNavigate: (tab: string, roleParam?: Role) => void;
  onOpenRegister?: () => void;
}

export const ResourceProviderLoginPage: React.FC<ResourceProviderLoginPageProps> = ({
  onSuccess,
  onNavigate,
  onOpenRegister,
}) => {
  const [email, setEmail] = useState('operations@marina-rescue.org');
  const [password, setPassword] = useState('provider123');
  const [depotId, setDepotId] = useState('DEPOT-CHN-ROYAPURAM-03');
  const [category, setCategory] = useState('Marine Rescue & Heavy Logistics');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoProviders = [
    {
      name: 'Marina Marine Logistics & NGO',
      email: 'operations@marina-rescue.org',
      pass: 'provider123',
      depotId: 'DEPOT-CHN-ROYAPURAM-03',
      assets: 'Inflatable Boats, 4x4 Trucks, Portable Generators',
      category: 'Marine Fleets & Extraction Vehicles',
      location: 'Port Trust Yard 3, Royapuram',
    },
    {
      name: 'Apex Emergency Relief & Food Bank',
      email: 'apex.relief@chennaiaid.org',
      pass: 'provider123',
      depotId: 'DEPOT-GST-TAMBARAM-12',
      assets: 'Food Rations, Mineral Water, Trauma Medical Packs',
      category: 'Ration Crates & Medical Equipment',
      location: 'GST Road Warehouse 12, Tambaram',
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      try {
        const user = store.loginUser(email, password);
        if (user.role !== 'RESOURCE_PROVIDER') {
          setError(`This account is registered as ${user.role}. Please use the ${user.role} portal.`);
          store.logoutUser();
          setLoading(false);
          return;
        }
        setLoading(false);
        onSuccess(user);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Authentication failed. Please verify provider credentials.');
      }
    }, 300);
  };

  const handleSelectDemo = (provider: typeof demoProviders[0]) => {
    setEmail(provider.email);
    setPassword(provider.pass);
    setDepotId(provider.depotId);
    setCategory(provider.category);
    setError(null);
  };

  const handleInstantDemoLogin = (providerEmail: string) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const user = store.loginUser(providerEmail);
        setLoading(false);
        onSuccess(user);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Login failed');
      }
    }, 200);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-[#100f24] to-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans">
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
              onClick={() => onNavigate('login-government')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition"
            >
              🏛️ Gov EOC
            </button>
          </div>
        </div>

        {/* Fleet & Supply Chain Status Banner */}
        <div className="bg-purple-950/80 border border-purple-800/80 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-purple-950/30">
          <div className="flex items-center gap-2.5 text-purple-200">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 font-black">
              <Truck className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-white">Emergency Logistics & Supply Chain: ACTIVE</span>
              <p className="text-[11px] text-purple-300">
                184 Assets Tracked · 6 Staging Depots · Direct dispatch link to certified rescue boats & medical supplies.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-900 text-purple-300 border border-purple-700 flex items-center gap-1">
            <Warehouse className="w-3 h-3" />
            <span>Depot Network Connected</span>
          </span>
        </div>

        {/* Main Grid: Card Form + Info Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Login Card */}
          <div className="lg:col-span-7 bg-[#13112c]/90 backdrop-blur-md border border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6">
              {/* Card Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 text-purple-400 border border-purple-800/60 text-[11px] font-bold uppercase tracking-wider">
                  <Box className="w-3.5 h-3.5" />
                  <span>Logistics & Camp Management</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Resource Provider Login
                </h1>
                <p className="text-xs text-slate-400">
                  Manage emergency supply inventories, fulfill rescuer equipment demands, and monitor live relief camp capacities.
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
                    Depot / Organization Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      id="provider-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. operations@marina-rescue.org"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">
                      Depot Facility ID
                    </label>
                    <div className="relative">
                      <Warehouse className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        id="provider-depot-input"
                        type="text"
                        value={depotId}
                        onChange={(e) => setDepotId(e.target.value)}
                        placeholder="DEPOT-CHN-ROYAPURAM-03"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">
                      Supply Category
                    </label>
                    <div className="relative">
                      <Container className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        id="provider-category-input"
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Marine Boats & Heavy Transport"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-300">
                      Depot Security Password
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Demo default: <code className="text-purple-400">provider123</code>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      id="provider-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-purple-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs"
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
                  id="provider-login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    'Connecting Depot Stock Database...'
                  ) : (
                    <>
                      <span>Enter Logistics Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Register Action */}
            <div className="mt-6 pt-5 border-t border-purple-900/40 text-center">
              <p className="text-xs text-slate-400">
                Operating a disaster warehouse or humanitarian NGO?{' '}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenRegister) onOpenRegister();
                    else onNavigate('register');
                  }}
                  className="font-bold text-purple-400 hover:text-purple-300 underline underline-offset-2 ml-1"
                >
                  Register Relief Depot / NGO
                </button>
              </p>
            </div>
          </div>

          {/* Right Column: Demo Accounts & Capabilities */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Quick 1-Click Demo Providers */}
            <div className="bg-[#13112c]/80 border border-purple-900/50 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Verified Depot Demo Profiles
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click any provider to test equipment inventory management, boat dispatch, and relief camp tracking:
              </p>

              <div className="space-y-2.5">
                {demoProviders.map((provider) => (
                  <div
                    key={provider.email}
                    className="p-3 bg-slate-950 rounded-2xl border border-purple-900/60 hover:border-purple-500/50 transition group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>📦</span>
                          <span>{provider.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Warehouse className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="truncate">{provider.location}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        {provider.depotId.split('-').slice(-2).join('-')}
                      </span>
                    </div>

                    <div className="text-[10px] text-purple-300/80 bg-slate-900/90 p-1.5 rounded-lg border border-purple-950">
                      <strong>Assets:</strong> {provider.assets}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSelectDemo(provider)}
                        className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-[11px] rounded-lg border border-slate-700 transition"
                      >
                        Autofill
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInstantDemoLogin(provider.email)}
                        className="flex-1 py-1.5 px-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-lg shadow-xs transition flex items-center justify-center gap-1"
                      >
                        <span>Instant Login</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics Capabilities */}
            <div className="bg-[#13112c]/60 border border-purple-900/40 rounded-3xl p-5 space-y-3 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                Depot Console Capabilities
              </h4>
              <ul className="space-y-2 text-slate-400 text-[11px]">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Equipment Dispatch:</strong> Assign motorized boats, 4x4 trucks, and generators to active rescue requests.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Relief Camp Occupancy:</strong> Monitor real-time evacuee intake and update remaining shelter spaces.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Inventory Restocking:</strong> Track availability statuses across warehouses in real-time.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

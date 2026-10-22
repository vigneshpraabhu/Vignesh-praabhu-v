import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { ResourceItem, ResourceCategory, ResourceItemStatus, User } from '../types';
import {
  Box,
  Plus,
  Truck,
  Phone,
  MapPin,
  Building2,
  Trash2,
  Filter,
  CheckCircle2,
  ShieldCheck,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';

export const ResourceProviderPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [allResources, setAllResources] = useState<ResourceItem[]>(store.getResources());
  const [allUsers, setAllUsers] = useState<User[]>(store.getAllUsers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // New Resource Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Boats');
  const [description, setDescription] = useState('');
  const [totalQuantity, setTotalQuantity] = useState(4);
  const [unit, setUnit] = useState('Boats');
  const [locationName, setLocationName] = useState('Port Staging Depot, Chennai');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setAllResources(store.getResources());
      setAllUsers(store.getAllUsers());
    });
    return unsub;
  }, []);

  // Provider isolation: Filter to strictly THIS provider's assets
  // If currentUser is a RESOURCE_PROVIDER, match by providerId or email/name fallback
  const isResourceProvider = currentUser?.role === 'RESOURCE_PROVIDER';
  const effectiveProviderId = currentUser?.id || 'user-res-1';

  // Only the resources owned by THIS specific provider:
  const myResources = allResources.filter((res) => {
    if (!isResourceProvider) return true; // non-provider preview fallback
    return (
      res.providerId === effectiveProviderId ||
      (currentUser?.name && res.providerName.toLowerCase() === currentUser.name.toLowerCase())
    );
  });

  const filteredResources = myResources.filter((r) => {
    if (selectedCategoryFilter === 'ALL') return true;
    return r.category === selectedCategoryFilter;
  });

  const totalRegisteredItems = myResources.reduce((acc, r) => acc + r.totalQuantity, 0);
  const totalAvailableItems = myResources.reduce((acc, r) => acc + r.availableQuantity, 0);
  const totalInUseItems = myResources.reduce((acc, r) => acc + (r.totalQuantity - r.availableQuantity), 0);

  // All registered Resource Providers for switcher
  const providerAccounts = allUsers.filter((u) => u.role === 'RESOURCE_PROVIDER');

  const handleSwitchProvider = (providerId: string) => {
    const targetUser = allUsers.find((u) => u.id === providerId);
    if (targetUser) {
      store.setCurrentUser(targetUser);
    }
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    store.createResource({
      resourceId: `RES-${category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      providerId: effectiveProviderId,
      providerName: currentUser?.organization || currentUser?.name || 'Authorized Resource Provider',
      providerPhone: currentUser?.phone || '+91 98408 99112',
      category,
      name,
      description,
      totalQuantity: Number(totalQuantity),
      availableQuantity: Number(totalQuantity),
      unit,
      locationName,
      lat: 13.003,
      lng: 80.252,
      status: 'AVAILABLE',
      lastMaintained: new Date().toISOString().split('T')[0],
    });
    setShowAddModal(false);
    setName('');
    setDescription('');
  };

  const handleUpdateStatus = (resId: string, status: ResourceItemStatus) => {
    store.updateResource(resId, { status });
  };

  const handleUpdateAvailableQuantity = (resId: string, newQty: number, totalQty: number) => {
    const clamped = Math.max(0, Math.min(totalQty, newQty));
    store.updateResource(resId, {
      availableQuantity: clamped,
      status: clamped === 0 ? 'UNAVAILABLE' : clamped < totalQty ? 'IN_USE' : 'AVAILABLE',
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Isolated Provider Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Isolated Provider Space
              </span>
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg font-mono">
                Provider ID: {effectiveProviderId}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-700" />
              {currentUser?.organization || currentUser?.name || 'Resource Provider Organization'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Official Contact: <strong>{currentUser?.phone || '+91 98408 99112'}</strong> • Email:{' '}
              <strong>{currentUser?.email || 'provider@rescue.org'}</strong> • Locality:{' '}
              {currentUser?.address || 'Chennai Central Depot'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Provider Persona Switcher */}
            {providerAccounts.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl text-xs">
                <span className="text-[11px] font-semibold text-slate-500">Provider Account:</span>
                <select
                  value={effectiveProviderId}
                  onChange={(e) => handleSwitchProvider(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2 py-1 outline-hidden"
                >
                  {providerAccounts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.organization || p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              + Register New Equipment / Rations
            </button>
          </div>
        </div>

        {/* Private Inventory Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Registered Asset Types</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{myResources.length}</div>
            <span className="text-[10px] text-slate-500">Distinct catalog units</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Fleet Stock</span>
            <div className="text-2xl font-black text-purple-700 mt-1">{totalRegisteredItems}</div>
            <span className="text-[10px] text-slate-500">Gross units registered</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase block">Ready for Mobilization</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{totalAvailableItems}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Available in depot</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-blue-700 uppercase block">Currently Deployed</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{totalInUseItems}</div>
            <span className="text-[10px] text-blue-600 font-medium">Engaged in active rescues</span>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">Filter By Category:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {['ALL', 'Boats', 'Vehicles', 'Medical supplies', 'Food', 'Water', 'Generators', 'Rescue equipment'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    selectedCategoryFilter === cat
                      ? 'bg-purple-700 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* Resources Cards Grid */}
        {filteredResources.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto text-xl font-bold">
              📦
            </div>
            <h3 className="font-bold text-slate-900 text-base">No Equipment in this Category</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This inventory is private to <strong>{currentUser?.name || 'your organization'}</strong>. Only the
              resources you register or own appear here.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              + Add First Asset to this Provider
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => {
              const inUseCount = res.totalQuantity - res.availableQuantity;
              const percentAvailable = Math.round((res.availableQuantity / res.totalQuantity) * 100);

              return (
                <div
                  key={res.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-300 shadow-xs space-y-3 flex flex-col justify-between transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded uppercase">
                        {res.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          res.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : res.status === 'IN_USE'
                            ? 'bg-blue-100 text-blue-800'
                            : res.status === 'RESERVED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mt-2.5 leading-snug">{res.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{res.description}</p>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{res.locationName}</span>
                    </div>
                  </div>

                  {/* Stock & Operational Controls */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    {/* Visual Stock Level Progress */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Remaining / Available:</span>
                        <strong className="text-slate-900">
                          {res.availableQuantity} of {res.totalQuantity} {res.unit}
                        </strong>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percentAvailable > 50
                              ? 'bg-emerald-500'
                              : percentAvailable > 20
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.max(4, Math.min(100, percentAvailable))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>{inUseCount} currently deployed</span>
                        <span>{percentAvailable}% in reserve</span>
                      </div>
                    </div>

                    {/* Quick Adjust Remaining Quantity */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500">Adjust Available:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            handleUpdateAvailableQuantity(res.id, res.availableQuantity - 1, res.totalQuantity)
                          }
                          disabled={res.availableQuantity <= 0}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold text-slate-800 flex items-center justify-center text-xs"
                          title="Decrease available stock by 1"
                        >
                          -1
                        </button>
                        <span className="px-2 font-mono font-bold text-slate-800 text-xs">
                          {res.availableQuantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateAvailableQuantity(res.id, res.availableQuantity + 1, res.totalQuantity)
                          }
                          disabled={res.availableQuantity >= res.totalQuantity}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold text-slate-800 flex items-center justify-center text-xs"
                          title="Increase available stock by 1"
                        >
                          +1
                        </button>
                      </div>
                    </div>

                    {/* Operational Status Switcher */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Set Operational Status:</span>
                      <select
                        value={res.status}
                        onChange={(e) => handleUpdateStatus(res.id, e.target.value as any)}
                        className="px-2 py-1 border border-slate-300 rounded text-[11px] bg-slate-50 font-semibold text-slate-700"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="IN_USE">IN_USE</option>
                        <option value="RESERVED">RESERVED</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="UNAVAILABLE">UNAVAILABLE</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD RESOURCE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-sans">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                Register New Emergency Asset
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Will be strictly assigned to: <strong>{currentUser?.organization || currentUser?.name || 'Your Fleet'}</strong>
              </p>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Asset Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="Boats">Boats (Inflatable, Dinghy, Motorboat)</option>
                  <option value="Vehicles">Vehicles (4x4, Amphibious, Wading Truck)</option>
                  <option value="Medical supplies">Medical supplies (Trauma kits, Defibrillators)</option>
                  <option value="Food">Food / Emergency Rations</option>
                  <option value="Water">Water Supplies / Purification</option>
                  <option value="Generators">Generators & Silent Power Backup</option>
                  <option value="Rescue equipment">Rescue equipment (Winch, Ropes, Sirens)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 25HP Yamaha Inflatable Dinghy"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Description & Readiness *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Includes life vests, spotlights, wading capability."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Total Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Unit of Measure *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Boats, Kits, Crates"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Staging Depot / Yard *</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-md transition"
                >
                  Save Resource Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

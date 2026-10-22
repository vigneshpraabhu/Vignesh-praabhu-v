import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { ReliefCamp } from '../types';
import { InteractiveMap } from '../components/common/InteractiveMap';
import { Home, Compass, Phone, Users, CheckCircle, Search, Filter } from 'lucide-react';

export const ReliefCampsPage: React.FC = () => {
  const [camps, setCamps] = useState<ReliefCamp[]>(store.getReliefCamps());
  const [filterOnlyAvailable, setFilterOnlyAvailable] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCamps(store.getReliefCamps());
    });
    return unsub;
  }, []);

  const filteredCamps = camps.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase());
    const matchesAvail = !filterOnlyAvailable || c.availableSpaces > 0;
    return matchesSearch && matchesAvail;
  });

  const totalCap = camps.reduce((sum, c) => sum + c.totalCapacity, 0);
  const totalOccupied = camps.reduce((sum, c) => sum + c.currentOccupancy, 0);
  const totalFree = camps.reduce((sum, c) => sum + c.availableSpaces, 0);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
              Public Safe House Grid
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              Disaster Relief Camps & Evacuation Shelters
            </h1>
            <p className="text-xs text-slate-500">
              Live capacity monitoring, verified food distribution hubs, and medical clinic safe houses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border p-3 rounded-xl text-center min-w-[90px]">
              <div className="text-[11px] text-slate-500 font-semibold">Total Capacity</div>
              <div className="text-lg font-bold text-slate-900">{totalCap}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center min-w-[90px]">
              <div className="text-[11px] text-blue-700 font-semibold">Sheltered</div>
              <div className="text-lg font-bold text-blue-900">{totalOccupied}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center min-w-[90px]">
              <div className="text-[11px] text-emerald-700 font-semibold">Spaces Free</div>
              <div className="text-lg font-bold text-emerald-900">{totalFree}</div>
            </div>
          </div>
        </div>

        {/* GIS Map */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            Active Camps Geographic Distribution
          </h3>
          <InteractiveMap camps={camps} height="380px" />
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search camp name or locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-xl w-64 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={filterOnlyAvailable}
              onChange={(e) => setFilterOnlyAvailable(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-0"
            />
            <span>Show Only Camps with Free Spaces</span>
          </label>
        </div>

        {/* Camp Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCamps.map((camp) => (
            <div
              key={camp.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      camp.operatingStatus === 'FULL'
                        ? 'bg-red-100 text-red-800'
                        : camp.operatingStatus === 'NEAR_CAPACITY'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {camp.operatingStatus}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mt-1">{camp.name}</h4>
                  <p className="text-xs text-slate-500">📍 {camp.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-700">
                    {camp.availableSpaces}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Spaces Open
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Occupancy: {camp.currentOccupancy} of {camp.totalCapacity}</span>
                  <span>Beds: {camp.bedAvailability}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (camp.currentOccupancy / camp.totalCapacity) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-[11px] text-slate-600 text-center">
                <div className="bg-slate-50 p-1.5 rounded">
                  {camp.foodAvailability ? '🍲 Food Ready' : '❌ No Food'}
                </div>
                <div className="bg-slate-50 p-1.5 rounded">
                  {camp.waterAvailability ? '💧 Clean Water' : '❌ Water Short'}
                </div>
                <div className="bg-slate-50 p-1.5 rounded">
                  {camp.medicalSupport ? '🩺 Clinic On-Site' : '❌ No Clinic'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Officer in charge: <strong>{camp.contactPerson}</strong></span>
                <a
                  href={`tel:${camp.contactPhone}`}
                  className="text-blue-600 font-bold hover:underline"
                >
                  📞 {camp.contactPhone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

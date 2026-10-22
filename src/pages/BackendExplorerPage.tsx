import React, { useState } from 'react';
import { store } from '../services/store';
import { api } from '../services/api';
import { Terminal, Database, Code, Play, Download, Server, CheckCircle2 } from 'lucide-react';

export const BackendExplorerPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'endpoints' | 'schemas' | 'tester' | 'setup'>('endpoints');
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET /api/requests');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const endpoints = [
    { method: 'POST', path: '/api/auth/register', desc: 'Register citizen, volunteer, or resource provider with hashed password & role assignment' },
    { method: 'POST', path: '/api/auth/login', desc: 'Authenticate user with bcrypt password check & sign JWT token' },
    { method: 'GET', path: '/api/auth/me', desc: 'Retrieve authenticated profile from JWT Bearer payload' },
    { method: 'POST', path: '/api/requests', desc: 'Citizen submits disaster emergency request with GPS lat/lng and initial priority' },
    { method: 'GET', path: '/api/requests', desc: 'Fetch all emergency requests with priority, status, and search filters' },
    { method: 'GET', path: '/api/requests/:id', desc: 'Get single incident details with field notes timeline & completion reports' },
    { method: 'PUT', path: '/api/requests/:id/verify', desc: 'Government officer verifies incident authenticity & assigns priority' },
    { method: 'PUT', path: '/api/requests/:id/priority', desc: 'Override triage priority (CRITICAL, HIGH, MEDIUM, LOW)' },
    { method: 'PUT', path: '/api/requests/:id/assign', desc: 'Assign suitable certified volunteer to emergency mission' },
    { method: 'PUT', path: '/api/requests/:id/status', desc: 'Volunteer or EOC updates operation status (EN_ROUTE, ARRIVED, IN_PROGRESS)' },
    { method: 'PUT', path: '/api/requests/:id/close', desc: 'Government audits completion report and formally closes request' },
    { method: 'GET', path: '/api/volunteers', desc: 'List volunteer roster with skills, geolocation, radius, and availability status' },
    { method: 'PUT', path: '/api/volunteers/me/availability', desc: 'Toggle readiness (AVAILABLE, BUSY, UNAVAILABLE)' },
    { method: 'POST', path: '/api/manpower-requests', desc: 'Volunteer in field requests additional squad reinforcements' },
    { method: 'PUT', path: '/api/manpower-requests/:id/assign', desc: 'Government dispatches available nearby rescuers to reinforce active op' },
    { method: 'POST', path: '/api/resource-requests', desc: 'Volunteer requests motorboats, trucks, medical crates, or generators' },
    { method: 'PUT', path: '/api/resource-requests/:id/assign', desc: 'Government mobilizes stock from registered resource providers' },
    { method: 'GET', path: '/api/camps', desc: 'List relief camps with live calculated available spaces (capacity - occupancy)' },
    { method: 'POST', path: '/api/alerts', desc: 'Publish public cyclone, flood, and evacuation warnings' },
    { method: 'GET', path: '/api/reports/summary', desc: 'Real-time database analytics for Review 1 & 2 presentation' },
  ];

  const handleRunTest = async () => {
    setTestLoading(true);
    setTestResponse(null);
    try {
      if (selectedEndpoint === 'GET /api/requests') {
        const data = await api.requests.getAll();
        setTestResponse({ status: 200, count: data.length, data: data.slice(0, 3) });
      } else if (selectedEndpoint === 'GET /api/volunteers') {
        const data = await api.volunteers.getAll();
        setTestResponse({ status: 200, count: data.length, data });
      } else if (selectedEndpoint === 'GET /api/camps') {
        const data = await api.camps.getAll();
        setTestResponse({ status: 200, count: data.length, data });
      } else if (selectedEndpoint === 'GET /api/reports/summary') {
        const data = await api.reports.getStats();
        setTestResponse({ status: 200, data });
      } else if (selectedEndpoint === 'GET /api/alerts') {
        const data = await api.alerts.getAll();
        setTestResponse({ status: 200, count: data.length, data });
      } else {
        const data = await api.requests.getAll();
        setTestResponse({ status: 200, message: `Tested ${selectedEndpoint}`, samplePayload: data[0] });
      }
    } catch (err: any) {
      setTestResponse({ status: 500, error: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  const handleExportDB = () => {
    const fullDB = {
      exportedAt: new Date().toISOString(),
      platform: 'ResQLink Emergency Management MERN Stack',
      users: store.getAllUsers(),
      requests: store.getRequests(),
      volunteers: store.getVolunteers(),
      resources: store.getResources(),
      camps: store.getReliefCamps(),
      alerts: store.getAlerts(),
      manpowerRequests: store.getManpowerRequests(),
      resourceRequests: store.getResourceRequests(),
      stats: store.getDashboardStats(),
    };
    const blob = new Blob([JSON.stringify(fullDB, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resqlink_mongodb_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono px-2.5 py-0.5 rounded font-bold">
                MERN ARCHITECTURE EXPLORER
              </span>
              <span className="text-slate-400 text-xs font-mono">
                MongoDB 7.0 • Express 4.21 • React 19 • Node 22
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-2 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-emerald-400" />
              REST API Endpoints, Mongoose Schemas & Backend Services
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Verify backend routes, database models, indexes, and full standalone server setup.
            </p>
          </div>

          <button
            onClick={handleExportDB}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 shrink-0 transition"
          >
            <Download className="w-4 h-4" />
            Export MongoDB JSON Database
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'endpoints', label: 'REST API Endpoints Register', icon: Server },
            { id: 'tester', label: 'Live Endpoint Tester', icon: Play },
            { id: 'schemas', label: 'Mongoose Database Models', icon: Database },
            { id: 'setup', label: 'Standalone Server Setup', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeSubTab === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* SUBTAB 1: ENDPOINTS REGISTER */}
        {activeSubTab === 'endpoints' && (
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-850 border-b border-slate-700 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300">
                Official REST API Contract ({endpoints.length} Routes)
              </span>
              <span className="text-slate-400 font-mono">Base URL: http://localhost:3000/api</span>
            </div>
            <div className="divide-y divide-slate-700/60 font-mono text-xs">
              {endpoints.map((ep, idx) => (
                <div key={idx} className="p-3.5 hover:bg-slate-750/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ep.method === 'GET'
                          ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                          : ep.method === 'POST'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-white font-semibold">{ep.path}</span>
                  </div>
                  <span className="text-slate-400 font-sans text-[11px] max-w-md text-right sm:text-right">
                    {ep.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 2: LIVE ENDPOINT TESTER */}
        {activeSubTab === 'tester' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-white">Execute Live Controller Test</h3>
              <div className="space-y-2 text-xs">
                <label className="text-slate-400 block">Choose Target Endpoint:</label>
                <select
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-mono"
                >
                  <option value="GET /api/requests">GET /api/requests (All Incidents)</option>
                  <option value="GET /api/volunteers">GET /api/volunteers (Volunteer Squads)</option>
                  <option value="GET /api/camps">GET /api/camps (Relief Camps Directory)</option>
                  <option value="GET /api/reports/summary">GET /api/reports/summary (Live Analytics)</option>
                  <option value="GET /api/alerts">GET /api/alerts (Active Advisories)</option>
                </select>
              </div>

              <button
                onClick={handleRunTest}
                disabled={testLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                {testLoading ? 'Executing Query...' : 'Send Request & Inspect Response'}
              </button>
            </div>

            <div className="md:col-span-7 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400 pb-2 border-b border-slate-800 text-[11px]">
                <span>Response Body (JSON)</span>
                {testResponse && (
                  <span className="text-emerald-400 font-bold">Status: {testResponse.status} OK</span>
                )}
              </div>
              <pre className="text-slate-200 max-h-96 overflow-y-auto text-[11px] leading-relaxed p-2">
                {testResponse
                  ? JSON.stringify(testResponse, null, 2)
                  : '// Select an endpoint and click "Send Request" to test live API execution.'}
              </pre>
            </div>
          </div>
        )}

        {/* SUBTAB 3: MONGOOSE SCHEMAS */}
        {activeSubTab === 'schemas' && (
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm text-white font-sans">
              Mongoose Database Schema Models (server/src/models)
            </h3>
            <div className="space-y-4 text-slate-300">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">
                  1. EmergencyRequest Schema (models/EmergencyRequest.ts):
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  requestId: String (unique index), citizenId: ObjectId ref User, emergencyType: Enum ['Rescue','Medical','Food','Water','Shelter'], priority: Enum ['CRITICAL','HIGH','MEDIUM','LOW'], status: Enum ['PENDING','VERIFIED','ASSIGNED','IN_PROGRESS','RESOLUTION_PENDING','CLOSED','REJECTED'], location: &#123; type: 'Point', coordinates: [lng, lat] &#125; (2dsphere index), isEscalated: Boolean, fieldNotes: [&#123; note, volunteerId, timestamp, isBlocker &#125;], completionReport: &#123; rescuedCount, casualties, summary, verifiedByGovernment &#125;
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-blue-400 font-bold block mb-1">
                  2. VolunteerProfile Schema (models/VolunteerProfile.ts):
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  userId: ObjectId ref User (unique), skills: [String], serviceArea: String, location: &#123; coordinates: [lng, lat] &#125; (2dsphere index), serviceRadiusKm: Number, availability: Enum ['AVAILABLE','BUSY','UNAVAILABLE'], activeOperationId: String, completedTasksCount: Number
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">
                  3. ReliefCamp Schema (models/ReliefCamp.ts):
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  name: String, totalCapacity: Number, currentOccupancy: Number, availableSpaces: Number (virtual / computed), bedAvailability: Number, foodAvailability: Boolean, waterAvailability: Boolean, medicalSupport: Boolean, operatingStatus: Enum ['OPERATIONAL','NEAR_CAPACITY','FULL','INACTIVE']
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-purple-400 font-bold block mb-1">
                  4. ManpowerRequest & ResourceRequest Schemas (models/ManpowerRequest.ts):
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  operationId: String, volunteerId: ObjectId ref VolunteerProfile, additionalVolunteersNeeded: Number, requiredSkills: [String], urgency: Enum ['CRITICAL','HIGH','MEDIUM'], status: Enum ['PENDING','UNDER_REVIEW','APPROVED','REJECTED','FULFILLED'], assignedVolunteerIds: [ObjectId]
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: STANDALONE SERVER SETUP INSTRUCTIONS */}
        {activeSubTab === 'setup' && (
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4 text-xs font-sans">
            <h3 className="font-bold text-base text-white">
              Standalone Deployment Instructions (/client and /server)
            </h3>
            <div className="space-y-3 text-slate-300">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="font-bold text-amber-400">1. Backend Setup (/server):</div>
                <pre className="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-emerald-400">
                  cd server{'\n'}
                  npm install{'\n'}
                  cp .env.example .env # Set MONGODB_URI=mongodb://localhost:27017/resqlink{'\n'}
                  npm run seed       # Seeds realistic cyclone scenario data{'\n'}
                  npm run dev        # Starts Express REST API on port 5000
                </pre>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="font-bold text-cyan-400">2. Frontend Setup (/client):</div>
                <pre className="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-emerald-400">
                  cd client{'\n'}
                  npm install{'\n'}
                  npm run dev        # Starts Vite React on port 3000
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

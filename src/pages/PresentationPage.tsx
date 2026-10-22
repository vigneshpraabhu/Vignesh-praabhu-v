import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Presentation,
  CheckCircle2,
  Database,
  Layers,
  Server,
  Code,
  ShieldAlert,
  Flame,
  Users,
  Compass,
  Box,
  Home,
  Clock,
  Terminal,
} from 'lucide-react';

interface SlideContent {
  id: number;
  title: string;
  category: string;
  content: React.ReactNode;
}

export const PresentationPage: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides: SlideContent[] = [
    {
      id: 1,
      category: 'Project Review 1 & 2',
      title: 'Slide 1: Title & Presentation Agenda',
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-blue-900/40 rounded-xl border border-blue-700/60">
            <h3 className="text-xl font-bold text-white">
              ResQLink — Emergency Response & Disaster Management Platform
            </h3>
            <p className="text-xs text-blue-200 mt-1">
              Third-Year Computer Science & Engineering Capstone Project
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-1">
              <span className="font-bold text-amber-400">Review 1 Topics (System Design):</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>Problem statement & current disaster bottlenecks</li>
                <li>Functional & non-functional requirements</li>
                <li>MERN stack architecture & flow</li>
                <li>MongoDB collections & schema design</li>
                <li>Role-based access control (RBAC)</li>
              </ul>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-1">
              <span className="font-bold text-emerald-400">Review 2 Topics (Implementation):</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>REST API controllers & middleware</li>
                <li>Citizen reporting & GIS Leaflet mapping</li>
                <li>Government triage & volunteer dispatch</li>
                <li>Reinforcement manpower & resource workflows</li>
                <li>Offline synchronization & SLA escalation</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      category: 'Requirements Specification',
      title: 'Slide 2: Functional & Non-Functional Requirements',
      content: (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-emerald-400">Functional Requirements (FR):</h4>
            <ul className="space-y-1.5 text-slate-300">
              <li>✅ <strong>FR1:</strong> Citizen emergency dispatch form with GPS pin dropper.</li>
              <li>✅ <strong>FR2:</strong> Government verification, triage priority assignment, & reject options.</li>
              <li>✅ <strong>FR3:</strong> Volunteer matching by skill, proximity, and availability state.</li>
              <li>✅ <strong>FR4:</strong> Volunteer-initiated additional manpower requests from field.</li>
              <li>✅ <strong>FR5:</strong> Volunteer-initiated resource mobilization requests (boats, kits).</li>
              <li>✅ <strong>FR6:</strong> Relief camps occupancy calculation (Capacity - Occupancy).</li>
              <li>✅ <strong>FR7:</strong> Critical emergency SLA escalation watcher.</li>
              <li>✅ <strong>FR8:</strong> Offline request queue with indexedDB/local caching & sync.</li>
            </ul>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-cyan-400">Non-Functional Requirements (NFR):</h4>
            <ul className="space-y-1.5 text-slate-300">
              <li>⚡ <strong>NFR1 Performance:</strong> Sub-second triage updates and low-latency API queries.</li>
              <li>🛡️ <strong>NFR2 Security:</strong> Role-based access control, bcrypt hashing, JWT tokens.</li>
              <li>📶 <strong>NFR3 Fault Tolerance:</strong> Offline resilient queue for spotty network environments.</li>
              <li>🗺️ <strong>NFR4 Usability:</strong> High-contrast disaster color hierarchy (Red, Orange, Yellow).</li>
              <li>📊 <strong>NFR5 Scalability:</strong> Geospatial 2dsphere indexing for multi-district scale.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      category: 'System Architecture',
      title: 'Slide 3: Detailed MERN Stack Architecture',
      content: (
        <div className="space-y-3 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-center space-y-2">
            <div className="text-amber-400 font-bold">[CLIENT TIER] React 19 + TypeScript + Tailwind CSS + Leaflet GIS</div>
            <div className="text-slate-500">↕ Axios REST Calls & JWT Bearer Auth / Offline Sync Service</div>
            <div className="text-blue-400 font-bold">[API GATEWAY TIER] Node.js 22 + Express 4.21 Controllers & RBAC Middleware</div>
            <div className="text-slate-500">↕ Mongoose 8.x ODM with Schema Validators & Transactions</div>
            <div className="text-emerald-400 font-bold">[DATABASE TIER] MongoDB 7.0 (Geospatial 2dsphere Indexing + Document Store)</div>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            Decoupled architecture where the React SPA runs independently and connects to modular Express REST API routes under <code>/api/*</code>. In offline situations, client-side queue buffers mutations with idempotency keys.
          </p>
        </div>
      ),
    },
    {
      id: 4,
      category: 'System Modeling',
      title: 'Slide 4: Use Case Diagram & Actor Responsibilities',
      content: (
        <div className="grid grid-cols-4 gap-2 text-[11px]">
          <div className="bg-red-950/50 p-3 rounded-xl border border-red-800 space-y-1.5">
            <strong className="text-red-400 block font-bold">1. CITIZEN</strong>
            <ul className="list-disc pl-3 space-y-1 text-slate-300">
              <li>Submit emergency call</li>
              <li>Pick GPS coordinates on map</li>
              <li>Track progress timeline</li>
              <li>Find nearby relief shelters</li>
              <li>Queue requests offline</li>
            </ul>
          </div>
          <div className="bg-blue-950/50 p-3 rounded-xl border border-blue-800 space-y-1.5">
            <strong className="text-blue-400 block font-bold">2. GOVERNMENT EOC</strong>
            <ul className="list-disc pl-3 space-y-1 text-slate-300">
              <li>Verify & triage incidents</li>
              <li>Override priority (CRITICAL)</li>
              <li>Assign volunteers & resources</li>
              <li>Review field manpower requests</li>
              <li>Audit completion & close ticket</li>
            </ul>
          </div>
          <div className="bg-emerald-950/50 p-3 rounded-xl border border-emerald-800 space-y-1.5">
            <strong className="text-emerald-400 block font-bold">3. VOLUNTEER</strong>
            <ul className="list-disc pl-3 space-y-1 text-slate-300">
              <li>Toggle availability readiness</li>
              <li>Accept assigned mission</li>
              <li>Submit arrival & field notes</li>
              <li>Request extra manpower</li>
              <li>Submit completion report</li>
            </ul>
          </div>
          <div className="bg-purple-950/50 p-3 rounded-xl border border-purple-800 space-y-1.5">
            <strong className="text-purple-400 block font-bold">4. RESOURCE PROVIDER</strong>
            <ul className="list-disc pl-3 space-y-1 text-slate-300">
              <li>Register boats & trucks</li>
              <li>Update inventory stock</li>
              <li>Receive mobilization orders</li>
              <li>Track staging deliveries</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      category: 'Database Engineering',
      title: 'Slide 5: MongoDB Schema Design & Relationships',
      content: (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
            <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <strong className="text-amber-400 block">EmergencyRequests</strong>
              <div>_id: ObjectId</div>
              <div>requestId: String (unique)</div>
              <div>priority: Enum (CRITICAL..)</div>
              <div>status: Enum (PENDING..)</div>
              <div>lat, lng: Number (2dsphere)</div>
              <div>assignedVolunteerId: Ref</div>
            </div>
            <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <strong className="text-blue-400 block">VolunteerProfiles</strong>
              <div>_id: ObjectId</div>
              <div>userId: Ref Users</div>
              <div>skills: [String]</div>
              <div>availability: Enum</div>
              <div>serviceRadiusKm: Number</div>
              <div>completedTasks: Number</div>
            </div>
            <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <strong className="text-emerald-400 block">ReliefCamps</strong>
              <div>_id: ObjectId</div>
              <div>name: String</div>
              <div>totalCapacity: Number</div>
              <div>currentOccupancy: Number</div>
              <div>bedAvailability: Number</div>
              <div>operatingStatus: Enum</div>
            </div>
          </div>
          <p className="text-slate-300 text-xs">
            Normalized relational references combined with embedded arrays for field audit notes (<code>fieldNotes[]</code>) and structured completion reports (<code>completionReport&#123;&#125;</code>).
          </p>
        </div>
      ),
    },
    {
      id: 6,
      category: 'Module Architecture',
      title: 'Slide 6: System Module Description',
      content: (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-1">
            <strong className="text-amber-400">1. Citizen Reporting Module:</strong>
            <p className="text-slate-300">Forms with client-side validation, GPS pin dropper, and live ticket tracking with status milestones.</p>
          </div>
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-1">
            <strong className="text-blue-400">2. EOC Control Room Module:</strong>
            <p className="text-slate-300">Centralized triage register, SLA escalation queue, manpower approval desk, and real database summary analytics.</p>
          </div>
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-1">
            <strong className="text-emerald-400">3. Volunteer Tactical Unit Module:</strong>
            <p className="text-slate-300">Field console with mission lifecycle, blocker reporting, reinforcement requests, and completion reports.</p>
          </div>
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-1">
            <strong className="text-purple-400">4. Logistics & Relief Module:</strong>
            <p className="text-slate-300">Resource inventory management and dynamic relief camp capacity tracking with contact officers.</p>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      category: 'Technology Evaluation',
      title: 'Slide 7: Technology Stack Justification',
      content: (
        <div className="space-y-3 text-xs">
          <table className="w-full text-left text-xs bg-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="p-2.5">Technology</th>
                <th className="p-2.5">Role</th>
                <th className="p-2.5">Why Selected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-slate-300">
              <tr>
                <td className="p-2.5 font-bold text-emerald-400">MongoDB + Mongoose</td>
                <td className="p-2.5">Primary NoSQL DB</td>
                <td className="p-2.5">Flexible schema for varied disaster payloads & native 2dsphere GIS queries</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-blue-400">Express.js & Node.js</td>
                <td className="p-2.5">Backend REST API</td>
                <td className="p-2.5">Event-driven, asynchronous I/O ideal for high concurrent disaster traffic</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-cyan-400">React.js 19 + TypeScript</td>
                <td className="p-2.5">Frontend Client SPA</td>
                <td className="p-2.5">Reactive component state, strict compile-time types, fast UI updates</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-amber-400">Leaflet & OpenStreetMap</td>
                <td className="p-2.5">GIS Spatial Engine</td>
                <td className="p-2.5">Zero API-key dependencies, offline tile fallback, customizable markers</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 8,
      category: 'UI/UX Design',
      title: 'Slide 8: UI Design System & Wireframes',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-white">Emergency Visual Hierarchy:</h4>
            <div className="flex gap-2 text-xs">
              <span className="bg-red-900 text-red-200 px-2 py-1 rounded font-bold">🔴 Red: Critical Trapped / Drowning</span>
              <span className="bg-orange-900 text-orange-200 px-2 py-1 rounded font-bold">🟠 Orange: Urgent Medical</span>
              <span className="bg-amber-900 text-amber-200 px-2 py-1 rounded font-bold">🟡 Yellow: Food & Water</span>
              <span className="bg-slate-700 text-slate-200 px-2 py-1 rounded">⚪ Gray: Non-Urgent</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dark navy tactical command room aesthetic prevents eye fatigue in emergency operation rooms while maintaining accessible contrast.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 9,
      category: 'Implementation Review',
      title: 'Slide 9: Frontend Development & State Management',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-emerald-400">Client-Side Architecture:</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Reactive Store (Observer Pattern):</strong> Global synchronized state between Citizen, Volunteer, and Government modules.</li>
              <li><strong>Local Storage Cache:</strong> Immediate session persistence for all emergency requests and rosters.</li>
              <li><strong>Interactive Leaflet Map:</strong> Custom marker clusters with dynamic SVG indicators for incidents, rescuers, and relief shelters.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 10,
      category: 'Implementation Review',
      title: 'Slide 10: Backend Development & Express Controllers',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-blue-400">Modular Controller Architecture:</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-900 p-2 rounded">authController.ts (JWT, bcrypt)</div>
              <div className="bg-slate-900 p-2 rounded">requestController.ts (CRUD, triage)</div>
              <div className="bg-slate-900 p-2 rounded">manpowerController.ts (Summon help)</div>
              <div className="bg-slate-900 p-2 rounded">resourceController.ts (Inventory)</div>
              <div className="bg-slate-900 p-2 rounded">campController.ts (Capacities)</div>
              <div className="bg-slate-900 p-2 rounded">syncController.ts (Offline flush)</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 11,
      category: 'Implementation Review',
      title: 'Slide 11: Database Integration & Query Optimization',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-emerald-400">Database Optimizations:</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>2dsphere Geospatial Index:</strong> Enables fast <code>$near</code> spatial queries for matching volunteers within a given radius.</li>
              <li><strong>Compound Indexes:</strong> <code>&#123; priority: 1, status: 1 &#125;</code> for instant SLA escalation filtering.</li>
              <li><strong>Idempotency Checks:</strong> Server-side protection against duplicate emergency submissions during reconnect.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 12,
      category: 'Implementation Review',
      title: 'Slide 12: REST API Development & Contract Verification',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-cyan-400">API Standard Compliance:</h4>
            <p>
              Over 20 fully structured REST endpoints following uniform resource naming conventions, explicit HTTP status codes (200, 201, 400, 401, 403, 404, 500), and structured error payloads.
            </p>
            <div className="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-emerald-400">
              Sample: PUT /api/requests/REQ-2026-1001/verify &#123; priority: 'CRITICAL', verifiedBy: 'SDMA' &#125; → 200 OK
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 13,
      category: 'Project Milestones',
      title: 'Slide 13: Actual Module-Wise Implementation Status',
      content: (
        <div className="space-y-2 text-xs">
          <table className="w-full text-left bg-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="p-2.5">Module</th>
                <th className="p-2.5">Features Implemented</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-slate-300 text-[11px]">
              <tr>
                <td className="p-2 font-bold">Citizen Portal</td>
                <td className="p-2">Emergency form, GPS detection, ticket tracker, camps lookup</td>
                <td className="p-2 text-emerald-400 font-bold">100% COMPLETE</td>
              </tr>
              <tr>
                <td className="p-2 font-bold">Government EOC</td>
                <td className="p-2">Triage, priority override, volunteer & resource assignment, SLA escalation</td>
                <td className="p-2 text-emerald-400 font-bold">100% COMPLETE</td>
              </tr>
              <tr>
                <td className="p-2 font-bold">Volunteer Unit</td>
                <td className="p-2">10-section sidebar, field console, manpower summons, completion reports</td>
                <td className="p-2 text-emerald-400 font-bold">100% COMPLETE</td>
              </tr>
              <tr>
                <td className="p-2 font-bold">Resource Logistics</td>
                <td className="p-2">Equipment inventory, order fulfillment, delivery statuses</td>
                <td className="p-2 text-emerald-400 font-bold">100% COMPLETE</td>
              </tr>
              <tr>
                <td className="p-2 font-bold">GIS Mapping & Offline</td>
                <td className="p-2">Leaflet layers, offline simulation, draft sync queue</td>
                <td className="p-2 text-emerald-400 font-bold">100% COMPLETE</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 14,
      category: 'Live Demonstration',
      title: 'Slide 14: Application Demonstration & Workflows',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-white">Integrated Demonstration Steps:</h4>
            <ol className="list-decimal pl-4 space-y-1">
              <li><strong>Step 1:</strong> Citizen reports flood emergency in Velachery with GPS pin.</li>
              <li><strong>Step 2:</strong> Government EOC receives alert, verifies report, flags as CRITICAL.</li>
              <li><strong>Step 3:</strong> Government assigns certified volunteer Kavitha (motorboat specialist).</li>
              <li><strong>Step 4:</strong> Kavitha marks "En Route", arrives, and uses "REQUEST ADDITIONAL MANPOWER".</li>
              <li><strong>Step 5:</strong> EOC reviews and mobilizes reinforcement swimmer Arun Kumar.</li>
              <li><strong>Step 6:</strong> Rescuer submits completion report; EOC officer audits and closes ticket.</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 15,
      category: 'Engineering Analysis',
      title: 'Slide 15: Development Challenges & Solutions',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="space-y-2">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span className="font-bold text-amber-400 block">Challenge 1: Duplicate submissions during network reconnects</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                <strong>Solution:</strong> Generated unique client-side UUID idempotency keys so re-transmitted requests are recognized as duplicates by the store and merged without duplication.
              </p>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span className="font-bold text-blue-400 block">Challenge 2: Critical requests remaining unassigned indefinitely</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                <strong>Solution:</strong> Engineered an automatic background escalation engine that monitors created timestamps against configurable SLA limits and auto-flags escalated tickets.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 16,
      category: 'Future Scope',
      title: 'Slide 16: Future Enhancements & Production Roadmap',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-cyan-400">Roadmap for Real-World Deployment:</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>SMS / USSD Gateway:</strong> Fallback channel for non-smartphone users in rural flood plains.</li>
              <li><strong>Satellite Imagery Overlay:</strong> Integration with Sentinel/ISRO SAR flood extent masks.</li>
              <li><strong>Drone Feed Ingestion:</strong> Live aerial video telemetry for reconnaissance of collapsed bridges.</li>
              <li><strong>Multi-Lingual Voice IVR:</strong> Automated speech recognition in regional languages.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 17,
      category: 'Academic Defense',
      title: 'Slide 17: References & Conclusion',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-emerald-400">Academic & Technical References:</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
              <li>NDMA (National Disaster Management Authority) Standard Operating Procedures for Flood Management.</li>
              <li>MongoDB Inc. <em>Geospatial Indexing & GeoJSON Specifications in MongoDB 7.0</em>.</li>
              <li>RFC 7519 — JSON Web Token (JWT) Architecture and Signature Verification.</li>
              <li>OpenStreetMap Foundation — Open GIS Tile Server Guidelines.</li>
            </ul>
          </div>
          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800 text-center text-emerald-300 font-bold">
            Thank you! Questions from the Evaluation Committee are welcome.
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Presentation Control Bar */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold">
              <Presentation className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                17-Slide College Defense Presentation
                <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded font-mono">
                  Slide {currentSlideIndex + 1} / 17
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Department of Computer Science & Engineering • Reviews 1 & 2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide View Canvas */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6 min-h-[460px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                {currentSlide.category}
              </span>
              <span className="text-xs font-mono text-slate-500">
                SLIDE #{currentSlide.id.toString().padStart(2, '0')}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white mb-6">
              {currentSlide.title}
            </h2>

            <div>{currentSlide.content}</div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Project: ResQLink (Emergency Response MERN Platform)</span>
            <span>Third-Year Capstone Project</span>
          </div>
        </div>

        {/* Quick Slide Grid Selector */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-2 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`w-8 h-8 rounded-lg font-bold text-xs transition ${
                currentSlideIndex === idx
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

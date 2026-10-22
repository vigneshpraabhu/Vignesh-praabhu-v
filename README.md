# ResQLink — Emergency Response & Disaster Management Platform

> **Third-Year Engineering Capstone Project (Reviews 1 & 2)**  
> **Domain:** Full-Stack MERN Engineering, GIS Disaster Triage, Incident Response & Logistics

---

## 1. Project Overview & Abstract

During severe floods, cyclones, and environmental disasters, emergency communication is often fragmented across unverified social media messages, overcrowded telephone dispatchers, and disconnected ground rescue teams. 

**ResQLink** is a centralized, role-based disaster management and emergency coordination web platform built on the **MERN stack (MongoDB, Express.js, React.js, Node.js)**. It interconnects four critical stakeholders in real time:
1. **Citizens:** Report life-threatening entrapments, food/water shortages, or medical emergencies with precise GPS coordinate pinning.
2. **Government Authorities (SDMA / EOC):** Central incident command control room to verify calls, override triage priorities, track live GIS spatial distributions, mobilize certified volunteers, approve reinforcement demands, and formally close completed operations.
3. **Rescue Volunteers:** Specialized field console with mission lifecycles, obstacle blocker reporting, and the standout **"REQUEST ADDITIONAL MANPOWER"** and **"REQUEST EMERGENCY RESOURCES"** summons mechanisms.
4. **Resource Providers & Relief Camps:** Logistics asset registry (motorized boats, 4x4 trucks, generators, ration crates) alongside real-time relief camp occupancy monitoring (`Available Spaces = Capacity - Occupancy`).

---

## 2. Technology Stack

* **Database:** MongoDB 7.0 (with Geospatial `2dsphere` indexing & compound priority indexes) via Mongoose 8.x ODM.
* **Backend:** Express.js 4.21 & Node.js 22 LTS, REST API design, modular controller-route architecture, JWT authentication, and bcrypt password hashing.
* **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide icons.
* **GIS Engine:** Leaflet & OpenStreetMap interactive spatial layers (custom markers for incidents, rescuer units, staging hubs, and relief shelters).
* **Reliability:** Client-side offline cache with idempotency keys & automatic reconnect synchronization.
* **Critical SLA Escalation:** Background watcher that automatically flags unassigned `CRITICAL` requests that exceed response time limits.

---

## 3. Architecture & Folder Structure

```
resqlink/
├── client/                     # Frontend SPA
│   ├── .env.example
│   └── src/
│       ├── components/         # Reusable UI & Map components
│       ├── pages/              # Role dashboards & presentation
│       ├── services/           # REST API client & reactive store
│       └── types/              # TypeScript domain types
├── server/                     # Standalone Express Backend
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/             # DB & JWT config
│       ├── controllers/        # REST route controllers
│       ├── models/             # Mongoose schemas (User, Request, Camp...)
│       ├── routes/             # Express API routers
│       └── server.ts           # Server entry point
├── src/                        # Live preview integrated full-stack source
└── README.md
```

---

## 4. Default Demo Accounts (Development Mode)

For grading and presentation purposes, the platform provides one-click instant role switching via the top navigation bar or direct credential sign-in:

| Role | Name | Email | Default Focus |
| :--- | :--- | :--- | :--- |
| **GOVERNMENT** | Dr. Rajesh Sundaram (IAS) | `admin@disaster.gov.in` | SDMA Incident Command Control Room |
| **VOLUNTEER** | Kavitha Ramachandran | `kavitha.rescuer@gmail.com` | Water Rescue Specialist (Motorboat Squad) |
| **CITIZEN** | Ramesh Balan | `ramesh.citizen@gmail.com` | Velachery Lowland Submerged Sector |
| **RESOURCE PROVIDER** | Marina Marine Logistics & NGO | `operations@marina-rescue.org` | Inflatable Boats & Trauma Packs Hub |

*All accounts can be tested without passwords in development mode using the top role switcher.*

---

## 5. REST API Specification

### Authentication & Profiles
* `POST /api/auth/register` — Register citizen, volunteer, or resource provider.
* `POST /api/auth/login` — Sign in with bcrypt validation and issue JWT Bearer token.
* `GET /api/auth/me` — Retrieve current user profile and role privileges.

### Emergency Incident Operations
* `POST /api/requests` — Citizen submits emergency request with GPS coordinates.
* `GET /api/requests` — Query incidents with priority, status, and sector filters.
* `GET /api/requests/:id` — Full case file with field notes timeline and reports.
* `PUT /api/requests/:id/verify` — Government officer verifies authenticity & assigns priority.
* `PUT /api/requests/:id/priority` — Override priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
* `PUT /api/requests/:id/assign` — Assign certified volunteer rescuer.
* `PUT /api/requests/:id/status` — Rescuer updates status (`EN_ROUTE`, `IN_PROGRESS`, etc.).
* `PUT /api/requests/:id/close` — Audit completion report and officially close case.

### Volunteer & Reinforcement Actions
* `GET /api/volunteers` — List volunteer roster, readiness, and skillsets.
* `PUT /api/volunteers/me/availability` — Toggle `AVAILABLE`, `BUSY`, `UNAVAILABLE`.
* `POST /api/manpower-requests` — Rescuer requests additional squad reinforcements from the field.
* `PUT /api/manpower-requests/:id/assign` — EOC mobilizes additional personnel.

### Logistics & Relief Camps
* `GET /api/resources` — List equipment inventory and available quantities.
* `POST /api/resource-requests` — Rescuer requests boats, trucks, or medical kits.
* `PUT /api/resource-requests/:id/assign` — Mobilize resources from provider depot.
* `GET /api/camps` — List relief camps with live available capacity.
* `PUT /api/camps/:id` — Update evacuee occupancy counts.

---

## 6. Standalone Execution Instructions

### Running the Backend:
```bash
cd server
npm install
cp .env.example .env
# Set MONGODB_URI=mongodb://localhost:27017/resqlink
npm run dev
# Express API runs on http://localhost:5000
```

### Running the Frontend:
```bash
cd client
npm install
npm run dev
# React Vite runs on http://localhost:3000
```

---

## 7. 17-Slide Presentation Deck

The application includes an integrated **17-Slide Presentation Viewer** accessible directly from the top navigation bar, prepared for Review 1 and Review 2 committees:
* Slide 1: Title & Presentation Agenda
* Slide 2: Functional & Non-Functional Requirements
* Slide 3: Detailed MERN Stack Architecture
* Slide 4: Use Case Diagram & Actor Flow
* Slide 5: MongoDB Schema Design & Relationships
* Slide 6: System Module Description
* Slide 7: Technology Stack Justification
* Slide 8: UI Design System & Wireframes
* Slide 9: Frontend Development & State Management
* Slide 10: Backend Development & Express Controllers
* Slide 11: Database Integration & Query Optimization
* Slide 12: REST API Development & Contract Verification
* Slide 13: Actual Module-Wise Implementation Status
* Slide 14: Application Demonstration & Workflows
* Slide 15: Development Challenges & Solutions
* Slide 16: Future Enhancements & Production Roadmap
* Slide 17: References & Conclusion

---

## 8. Disclaimer

*ResQLink is an academic engineering capstone project designed for demonstration and research purposes. In real emergencies, citizens must immediately contact national disaster hotlines (112 / 108 / 1070).*

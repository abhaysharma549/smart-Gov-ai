# SMARTGOV AI — AI-Powered Civic Grievance Redressal Portal

SmartGov AI is a modern civic-tech platform designed for municipal grievance redressal and campus residency management. It provides autonomous AI triage, department routing, statutory SLA tracking, role-based access control (RBAC), and interactive administrative dashboards.

---

## 👥 Project Team & Role Division (3 Members)

### 1. Abhay Sharma (`ADM-001`) — System Architect & Full-Stack Lead
- **Core Ownership:**
  - Overall system architecture, Next.js 16 App Router (Turbopack, TypeScript, React 19).
  - Administrative Control Panel (`src/app/page.tsx`) & 9 Core KPI metrics aggregation.
  - Multi-dashboard orchestration (Admin Console vs. Citizen Portal).
  - Master Grievances Registry, Three-Owner Activity Log, and System Audit Trail.
  - Modal workflows: Citizen Complaint Filing Modal & Officer Workbench Modal.
- **Viva / Defense Focus:** High-level system design, state management, KPI calculation logic, and dashboard orchestration.

---

### 2. Vatsal (`ADM-002`) — Backend, AI Triage & Database Specialist
- **Core Ownership:**
  - Database schema & entity modeling (`prisma/schema.prisma` and `src/lib/user-store.ts`).
  - Autonomous AI Triage & Department Routing Engine (`src/lib/ai-service.ts`, `src/lib/routing.ts`):
    - NLP issue classification into 6 statutory departments (PWD, Water, Electricity, Sanitation, Health, Parks).
    - AI duplicate grievance detection and automated merging.
    - Urgency sentiment detection and dynamic priority scoring (Low, Medium, High, Critical).
  - Statutory SLA calculation engine and automated deadline enforcement.
  - RESTful API endpoints (`/api/complaints`, `/api/complaints/[id]`, `/api/uploads`).
- **Viva / Defense Focus:** AI classification algorithms, duplicate detection logic, database relational modeling, and API performance.

---

### 3. Sehaj (`ADM-003`) — Security, Authentication & Citizen Experience Lead
- **Core Ownership:**
  - Secure Authentication Gateway (`/auth/login` and `/auth/register`) powered by NextAuth v5 & JWT session management.
  - Role-Based Access Control (RBAC) & Security:
    - Server-side enforcement of exactly 3 authorized Admin accounts (`ADM-001`, `ADM-002`, `ADM-003`).
    - Standard citizen signup with University Registration Numbers, duplicate email/regNo checking, and automatic `CITIZEN` role assignment.
    - 12-round bcrypt password hashing and prevention of plain-text storage.
  - Citizen Grievance Tracker (`src/components/ComplaintTracker.tsx`) with timeline visualizer.
  - Public Transparency & Analytics Charts (`src/components/AnalyticsSection.tsx`).
  - Statutory Department Directory & SLA Reference (`src/components/DepartmentsSection.tsx`).
- **Viva / Defense Focus:** Session security, bcrypt hashing, protection against privilege escalation, and citizen tracking UI/UX.

---

## 🔐 Pre-Configured Accounts (Ready for Evaluation)

| Role | Identifier / Reg No | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Admin 1** | `ADM-001` | `admin1@smartgov.gov.in` | `Admin@123` | Full Admin Console (9 KPIs, Registry, Audit Trail) |
| **Admin 2** | `ADM-002` | `admin2@smartgov.gov.in` | `Admin@123` | Full Admin Console (Operations & Triage) |
| **Admin 3** | `ADM-003` | `admin3@smartgov.gov.in` | `Admin@123` | Full Admin Console (Zonal Commissioner Desk) |
| **Student / Citizen** | `22BCS10045` | `student@university.edu` | `User@123` | Citizen Portal (Lodge, Track, View My Grievances) |

> New citizens can also register at `/auth/register` with their Full Name, University Reg No, Email, Mobile, and Password.

---

## 🏛️ Statutory Departments & SLA Framework

| Department | Category | SLA Resolution Time |
| :--- | :--- | :--- |
| **Public Works Department (PWD)** | Roads, Potholes & Infrastructure | **3 Days** (72 Hours) |
| **Water & Sanitation Board** | Supply, Leakage & Sewage Overflow | **2 Days** (48 Hours) |
| **Electricity Distribution Corp.** | Defective Streetlights & Power Failures | **1 Day** (24 Hours) |
| **City Sanitation Authority** | Garbage Disposal & Litter Dumps | **1 Day** (24 Hours) |
| **Health & Disaster Bureau** | Pest Breeding, Mosquito Pools & Hazard | **2 Days** (48 Hours) |
| **Horticulture & Urban Forestry**| Fallen Trees & Public Park Maintenance | **4 Days** (96 Hours) |

---

## 🚀 Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open in browser:
   - Login Gateway: [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
   - Citizen Registration: [http://localhost:3000/auth/register](http://localhost:3000/auth/register)
   - Main Dashboard: [http://localhost:3000](http://localhost:3000)

export interface StoredUser {
  id: string;
  name: string;
  registrationNumber: string;
  email: string;
  phone: string;
  hashedPassword?: string;
  role: "ADMIN" | "CITIZEN" | "OFFICER";
  designation?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthorizedAdmin {
  id: string;
  name: string;
  registrationNumber: string;
  email: string;
  phone: string;
  role: "ADMIN";
  designation: string;
  createdAt: string;
}

// Exactly 3 authorized Admin accounts (Pre-configured & Server-Enforced)
export const AUTHORIZED_ADMINS: ReadonlyArray<AuthorizedAdmin> = [
  {
    id: "ADM-001",
    name: "Abhay Sharma",
    registrationNumber: "ADM-001",
    email: "admin1@smartgov.gov.in",
    phone: "+91 98765 43210",
    role: "ADMIN",
    designation: "System Architect & Project Owner",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ADM-002",
    name: "Vatsal",
    registrationNumber: "ADM-002",
    email: "admin2@smartgov.gov.in",
    phone: "+91 98765 43211",
    role: "ADMIN",
    designation: "Municipal Operations Lead",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ADM-003",
    name: "Sehaj",
    registrationNumber: "ADM-003",
    email: "admin3@smartgov.gov.in",
    phone: "+91 98765 43212",
    role: "ADMIN",
    designation: "Zonal Grievance Commissioner",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];


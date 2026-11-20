import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { AUTHORIZED_ADMINS, StoredUser } from "@/lib/auth-constants";

export { AUTHORIZED_ADMINS };
export type { StoredUser };

// Hash for standard Admin password "Admin@123"
const ADMIN_HASH = "$2b$10$UtfxDlBoj.UByNO7pG.Doe9It8v15Zg2f84qB8FZL3.tn6JlimJAW";
// Hash for sample user password "User@123"
const USER_HASH = "$2b$10$b/y70F7sSstmeNcUkq6xuOOd5/Zm/ZmraZlMUd9lsOncW7R8iI6K.";

const INITIAL_USERS: StoredUser[] = [
  {
    ...AUTHORIZED_ADMINS[0],
    hashedPassword: ADMIN_HASH,
  },
  {
    ...AUTHORIZED_ADMINS[1],
    hashedPassword: ADMIN_HASH,
  },
  {
    ...AUTHORIZED_ADMINS[2],
    hashedPassword: ADMIN_HASH,
  },
  {
    id: "USR-001",
    name: "Aarav Mehta",
    registrationNumber: "22BCS10045",
    email: "student@university.edu",
    phone: "+91 98123 45678",
    role: "CITIZEN",
    designation: "Undergraduate Student",
    createdAt: "2026-02-15T10:30:00.000Z",
    hashedPassword: USER_HASH,
  },
];

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readUsersFromFile(): StoredUser[] {
  try {
    ensureDirectoryExists(USERS_FILE);
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(INITIAL_USERS, null, 2), "utf8");
      return INITIAL_USERS;
    }
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(INITIAL_USERS, null, 2), "utf8");
      return INITIAL_USERS;
    }
    return parsed;
  } catch (err) {
    console.error("Failed to read users file, using initial dataset:", err);
    return INITIAL_USERS;
  }
}

function writeUsersToFile(users: StoredUser[]): void {
  try {
    ensureDirectoryExists(USERS_FILE);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write users file:", err);
  }
}

class UserStore {
  private users: StoredUser[] = [];
  private initialized = false;

  private init() {
    if (!this.initialized) {
      this.users = readUsersFromFile();
      // Ensure the 3 Admin accounts always exist with authoritative data
      this.enforceAuthorizedAdmins();
      this.initialized = true;
    }
  }

  private enforceAuthorizedAdmins() {
    AUTHORIZED_ADMINS.forEach((adm) => {
      const idx = this.users.findIndex(
        (u) =>
          u.id === adm.id ||
          u.email.toLowerCase() === adm.email.toLowerCase() ||
          u.registrationNumber.toUpperCase() === adm.registrationNumber.toUpperCase()
      );
      if (idx === -1) {
        this.users.push({
          ...adm,
          hashedPassword: ADMIN_HASH,
        });
      } else {
        // Enforce role ADMIN strictly for these 3 accounts
        this.users[idx].role = "ADMIN";
        this.users[idx].name = adm.name;
        this.users[idx].registrationNumber = adm.registrationNumber;
        this.users[idx].designation = adm.designation;
      }
    });
  }

  public getAll(): StoredUser[] {
    this.init();
    return [...this.users];
  }

  public findByIdentifier(identifier: string): StoredUser | null {
    this.init();
    const clean = identifier.trim().toLowerCase();
    const user = this.users.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        u.registrationNumber.toLowerCase() === clean
    );
    return user ? { ...user } : null;
  }

  public findByEmail(email: string): StoredUser | null {
    this.init();
    const clean = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email.toLowerCase() === clean);
    return user ? { ...user } : null;
  }

  public findByRegistrationNumber(regNo: string): StoredUser | null {
    this.init();
    const clean = regNo.trim().toUpperCase();
    const user = this.users.find((u) => u.registrationNumber.toUpperCase() === clean);
    return user ? { ...user } : null;
  }

  public findById(id: string): StoredUser | null {
    this.init();
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  public async createUser(data: {
    name: string;
    registrationNumber: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<{ user: Omit<StoredUser, "hashedPassword">; error?: string }> {
    this.init();

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanRegNo = data.registrationNumber.trim().toUpperCase();

    // 1. Check duplicate email
    if (this.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { user: null as unknown as Omit<StoredUser, "hashedPassword">, error: "An account with this email address already exists" };
    }

    // 2. Check duplicate registration number
    if (this.users.some((u) => u.registrationNumber.toUpperCase() === cleanRegNo)) {
      return { user: null as unknown as Omit<StoredUser, "hashedPassword">, error: "This University Registration Number is already registered" };
    }

    // 3. Prohibit registration claiming Admin IDs or emails
    const isAdminReserved = AUTHORIZED_ADMINS.some(
      (adm) =>
        adm.email.toLowerCase() === cleanEmail ||
        adm.registrationNumber.toUpperCase() === cleanRegNo
    );
    if (isAdminReserved) {
      return { user: null as unknown as Omit<StoredUser, "hashedPassword">, error: "This identifier is reserved for authorized system administrators" };
    }

    // 4. Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // 5. Create new user with STRICT Citizen role (never admin)
    const newUser: StoredUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      registrationNumber: cleanRegNo,
      email: cleanEmail,
      phone: data.phone?.trim() || "",
      hashedPassword,
      role: "CITIZEN",
      designation: "Registered Citizen / Student",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    writeUsersToFile(this.users);

    const { hashedPassword: _, ...safeUser } = newUser;
    return { user: safeUser };
  }

  public isAuthorizedAdmin(identifier: string): boolean {
    const clean = identifier.trim().toLowerCase();
    return AUTHORIZED_ADMINS.some(
      (adm) =>
        adm.email.toLowerCase() === clean ||
        adm.registrationNumber.toLowerCase() === clean
    );
  }
}

export const userStore = new UserStore();

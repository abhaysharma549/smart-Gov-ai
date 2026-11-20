export interface CategoryItem {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  slaDays: number;
  departmentName: string;
}

export const MOCK_CATEGORIES: CategoryItem[] = [
  {
    id: "cat_roads",
    name: "Roads & Potholes",
    code: "ROADS_INFRA",
    description: "Damaged roads, open potholes, sidewalk hazards, and traffic signs",
    icon: "Truck",
    slaDays: 3,
    departmentName: "Public Works Department (PWD)",
  },
  {
    id: "cat_water",
    name: "Water Supply & Leakage",
    code: "WATER_SEWAGE",
    description: "Pipe bursts, contaminated supply, low pressure, and sewage overflow",
    icon: "Droplets",
    slaDays: 2,
    departmentName: "Municipal Water & Sanitation Board",
  },
  {
    id: "cat_power",
    name: "Street Lighting & Power",
    code: "ELECTRICITY_POWER",
    description: "Defective street lights, hanging live wires, transformer faults",
    icon: "Zap",
    slaDays: 1,
    departmentName: "Electricity Distribution Corporation",
  },
  {
    id: "cat_sanitation",
    name: "Waste & Garbage Disposal",
    code: "SANITATION_WASTE",
    description: "Unattended garbage dumps, blocked storm drains, public littering",
    icon: "Trash2",
    slaDays: 1,
    departmentName: "City Sanitation & Waste Authority",
  },
  {
    id: "cat_safety",
    name: "Public Health & Safety",
    code: "HEALTH_SAFETY",
    description: "Stray animal menace, pest breeding, building safety violations",
    icon: "ShieldAlert",
    slaDays: 2,
    departmentName: "Health & Disaster Management Bureau",
  },
  {
    id: "cat_parks",
    name: "Parks & Urban Greening",
    code: "PARKS_ENVIRONMENT",
    description: "Fallen trees, encroachment in public parks, illegal waste burning",
    icon: "Trees",
    slaDays: 4,
    departmentName: "Horticulture & Urban Forestry",
  },
];

export interface TrackedComplaint {
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  department: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  citizenName: string;
  location: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  targetResolutionDate: string;
  assignedOfficer?: {
    name: string;
    designation: string;
    badgeId: string;
    phone: string;
  };
  timeline: {
    status: string;
    title: string;
    description: string;
    timestamp: string;
    actor: string;
  }[];
  aiAudit: {
    predictedCategoryConfidence: number;
    duplicateRisk: "NONE" | "LOW" | "POTENTIAL_MATCH";
    sentimentUrgency: "NORMAL" | "HIGH" | "CRITICAL";
    imageIntegrityStatus: "VERIFIED" | "SUSPICIOUS" | "NOT_APPLICABLE";
    suggestedAction: string;
  };
  resolutionSummary?: string;
}

export const INITIAL_TRACKED_COMPLAINTS: TrackedComplaint[] = [
  {
    referenceNumber: "SG-20261031-WTR44",
    title: "Severe Main Water Pipe Rupture on 5th Avenue",
    description:
      "Water is gushing out from the underground main supply pipeline near City Park entrance, flooding half the road and cutting water supply to 120+ households.",
    category: "Water Supply & Leakage",
    department: "Municipal Water & Sanitation Board",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    citizenName: "Rohan V.",
    location: "5th Avenue, Opp. City Park Gate 2, Sector 14",
    latitude: 28.6139,
    longitude: 77.209,
    createdAt: "2026-10-31T08:15:00Z",
    targetResolutionDate: "2026-11-01T12:00:00Z",
    assignedOfficer: {
      name: "Engr. Rajesh Sharma",
      designation: "Executive Field Engineer (Water Division)",
      badgeId: "OFF-WTR-882",
      phone: "+91 98765 43210",
    },
    timeline: [
      {
        status: "SUBMITTED",
        title: "Complaint Lodged by Citizen",
        description: "Complaint submitted via SmartGov AI Citizen Web Portal with geocoded photos.",
        timestamp: "2026-10-31T08:15:00Z",
        actor: "Citizen (Rohan V.)",
      },
      {
        status: "UNDER_REVIEW",
        title: "SmartGov AI Pre-Screening & Routing",
        description:
          "AI detected high water volume disruption. Priority escalated to CRITICAL with 99.4% confidence routing to Municipal Water Board.",
        timestamp: "2026-10-31T08:15:08Z",
        actor: "SmartGov AI Engine",
      },
      {
        status: "ASSIGNED",
        title: "Dispatched to Rapid Response Team",
        description: "Assigned to Sector 14 Emergency Maintenance Squad under Engr. Rajesh Sharma.",
        timestamp: "2026-10-31T08:42:00Z",
        actor: "Central Dispatch Desk",
      },
      {
        status: "IN_PROGRESS",
        title: "Repair Team On-Site",
        description: "Excavation and valve shut-off in progress. Replacement pipeline section en-route.",
        timestamp: "2026-10-31T10:30:00Z",
        actor: "Engr. Rajesh Sharma",
      },
    ],
    aiAudit: {
      predictedCategoryConfidence: 0.994,
      duplicateRisk: "LOW",
      sentimentUrgency: "CRITICAL",
      imageIntegrityStatus: "VERIFIED",
      suggestedAction: "Immediate valve isolation required to prevent road collapse.",
    },
  },
  {
    referenceNumber: "SG-20261030-RDS12",
    title: "Deep Hazardous Pothole Near Metro Station Exit 3",
    description:
      "A 3-foot wide, 8-inch deep crater has formed in the middle lane causing dangerous skids for two-wheelers during peak evening hours.",
    category: "Roads & Potholes",
    department: "Public Works Department (PWD)",
    status: "RESOLVED",
    priority: "HIGH",
    citizenName: "Anita Sen",
    location: "Ring Road Metro Pillar 142, North Corridor",
    latitude: 28.5355,
    longitude: 77.391,
    createdAt: "2026-10-30T11:20:00Z",
    targetResolutionDate: "2026-11-02T18:00:00Z",
    assignedOfficer: {
      name: "S. K. Verma",
      designation: "Assistant Engineer (Civil Works)",
      badgeId: "OFF-PWD-312",
      phone: "+91 94123 77890",
    },
    timeline: [
      {
        status: "SUBMITTED",
        title: "Complaint Received",
        description: "Citizen reported road hazard with geotagged photo.",
        timestamp: "2026-10-30T11:20:00Z",
        actor: "Citizen (Anita Sen)",
      },
      {
        status: "UNDER_REVIEW",
        title: "AI Risk Assessment Completed",
        description: "Computer vision classified as severe pothole hazard near heavy transit hub.",
        timestamp: "2026-10-30T11:20:12Z",
        actor: "SmartGov AI Engine",
      },
      {
        status: "ASSIGNED",
        title: "Work Order Issued",
        description: "Assigned to PWD North Road Repair Depot.",
        timestamp: "2026-10-30T13:10:00Z",
        actor: "PWD Zone Controller",
      },
      {
        status: "IN_PROGRESS",
        title: "Bitumen Patching",
        description: "Cold-mix asphalt compaction and road leveling.",
        timestamp: "2026-10-31T06:00:00Z",
        actor: "PWD Maintenance Crew",
      },
      {
        status: "RESOLVED",
        title: "Pothole Repaired & Quality Verified",
        description: "Road surface restored and cured. Photo verification approved by supervising engineer.",
        timestamp: "2026-10-31T14:30:00Z",
        actor: "S. K. Verma",
      },
    ],
    aiAudit: {
      predictedCategoryConfidence: 0.987,
      duplicateRisk: "NONE",
      sentimentUrgency: "HIGH",
      imageIntegrityStatus: "VERIFIED",
      suggestedAction: "High collision risk during night hours. Expedite patching.",
    },
    resolutionSummary:
      "Asphalt filling completed with standard 80mm sub-base compaction. Surface leveled and opened for smooth vehicular transit.",
  },
  {
    referenceNumber: "SG-20261029-SNT99",
    title: "Overflowing Community Garbage Bin & Stray Cattle",
    description:
      "The secondary waste collection vat behind Block C Market has not been cleared for 4 days. Strong foul odor and stray animals obstructing traffic.",
    category: "Waste & Garbage Disposal",
    department: "City Sanitation & Waste Authority",
    status: "UNDER_REVIEW",
    priority: "MEDIUM",
    citizenName: "Mohammed Tariq",
    location: "Block C Market Backlane, Sector 9",
    latitude: 28.582,
    longitude: 77.321,
    createdAt: "2026-10-31T16:45:00Z",
    targetResolutionDate: "2026-11-01T20:00:00Z",
    timeline: [
      {
        status: "SUBMITTED",
        title: "Grievance Registered",
        description: "Citizen reported overflowing garbage dumpster.",
        timestamp: "2026-10-31T16:45:00Z",
        actor: "Citizen (Mohammed Tariq)",
      },
      {
        status: "UNDER_REVIEW",
        title: "Routing in Progress",
        description: "AI matched with Sanitation Zone 9. Checking compact vehicle route schedule.",
        timestamp: "2026-10-31T16:45:06Z",
        actor: "SmartGov AI Engine",
      },
    ],
    aiAudit: {
      predictedCategoryConfidence: 0.975,
      duplicateRisk: "POTENTIAL_MATCH",
      sentimentUrgency: "NORMAL",
      imageIntegrityStatus: "VERIFIED",
      suggestedAction: "Schedule hydraulic compactor truck on next morning route (07:00 AM).",
    },
  },
  {
    referenceNumber: "SG-20261028-PWR55",
    title: "Faulty High-Mast Street Lighting at Sector 11 Junction",
    description: "4 streetlamps on the crossroad are flickering and completely blacked out after 7 PM, creating safety hazards for pedestrians.",
    category: "Street Lighting & Power",
    department: "Electricity Distribution Corporation",
    status: "RESOLVED",
    priority: "HIGH",
    citizenName: "Vikram Malhotra",
    location: "Sector 11 Junction, Metro Flyover",
    latitude: 28.591,
    longitude: 77.31,
    createdAt: "2026-10-28T19:10:00Z",
    targetResolutionDate: "2026-10-29T19:00:00Z",
    timeline: [
      {
        status: "SUBMITTED",
        title: "Complaint Received",
        description: "Citizen reported lighting failure.",
        timestamp: "2026-10-28T19:10:00Z",
        actor: "Citizen (Vikram Malhotra)",
      },
      {
        status: "RESOLVED",
        title: "Capacitor & Bulbs Replaced",
        description: "Electrical crew replaced faulty 400W LED driver.",
        timestamp: "2026-10-29T11:45:00Z",
        actor: "Electricity Squad 4",
      },
    ],
    aiAudit: {
      predictedCategoryConfidence: 0.99,
      duplicateRisk: "NONE",
      sentimentUrgency: "HIGH",
      imageIntegrityStatus: "VERIFIED",
      suggestedAction: "Replace driver unit and test luminaire circuit.",
    },
    resolutionSummary: "Circuit ballast replaced, all 4 LED fixtures tested and fully operational.",
  },
  {
    referenceNumber: "SG-20261027-HLT18",
    title: "Stagnant Water Pooling Causing Mosquito Breeding Near School",
    description: "Post-rain water stagnation in vacant municipal plot adjacent to Model Public School. Heavy mosquito infestation reported by residents.",
    category: "Public Health & Safety",
    department: "Health & Disaster Management Bureau",
    status: "ASSIGNED",
    priority: "MEDIUM",
    citizenName: "Dr. Sunita Rao",
    location: "Plot 44, Behind Model School, Block D",
    latitude: 28.61,
    longitude: 77.24,
    createdAt: "2026-10-27T10:00:00Z",
    targetResolutionDate: "2026-10-29T18:00:00Z",
    timeline: [
      {
        status: "SUBMITTED",
        title: "Report Lodged",
        description: "Citizen highlighted public health risk.",
        timestamp: "2026-10-27T10:00:00Z",
        actor: "Citizen (Dr. Sunita Rao)",
      },
      {
        status: "ASSIGNED",
        title: "Health Inspector Assigned",
        description: "Dispatched larvicide and fogging unit.",
        timestamp: "2026-10-27T14:20:00Z",
        actor: "Health Bureau Dispatch",
      },
    ],
    aiAudit: {
      predictedCategoryConfidence: 0.982,
      duplicateRisk: "NONE",
      sentimentUrgency: "HIGH",
      imageIntegrityStatus: "VERIFIED",
      suggestedAction: "Apply anti-larval spray and level municipal terrain.",
    },
  },
];

export interface ActivityLogItem {
  id: string;
  action: string;
  details: string;
  actor: string;
  actorRole: string;
  referenceNumber?: string;
  timestamp: string;
}

export const MOCK_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: "act-1",
    action: "Assigned Emergency Crew to Sector 14",
    details: "Dispatched pipeline isolation crew under Engr. Rajesh Sharma.",
    actor: "Abhay Sharma (ADM-001)",
    actorRole: "System Architect & Admin",
    referenceNumber: "Ref: SG-20261031-WTR44",
    timestamp: "10:17 PM",
  },
  {
    id: "act-2",
    action: "Verified Pothole Patching Quality",
    details: "Approved cold-mix asphalt leveling at Ring Road Metro Pillar 142.",
    actor: "Abhay Sharma (ADM-001)",
    actorRole: "Project Owner",
    referenceNumber: "Ref: SG-20261030-RDS12",
    timestamp: "06:45 PM",
  },
  {
    id: "act-3",
    action: "Automated AI Duplicate Detection",
    details: "Merged 2 overlapping sanitation grievances at Sector 9 Backlane.",
    actor: "SmartGov AI Engine",
    actorRole: "Automated Triage",
    referenceNumber: "Ref: SG-20261029-SNT99",
    timestamp: "04:30 PM",
  },
  {
    id: "act-4",
    action: "SLA Policy Health Check Completed",
    details: "All 6 statutory municipal departments within permissible turnaround limits.",
    actor: "System Sentinel",
    actorRole: "Audit Monitor",
    timestamp: "02:15 PM",
  },
];

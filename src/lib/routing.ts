/**
 * Department Routing Engine — SmartGov AI
 *
 * Routes complaints to the appropriate department based on:
 * 1. Complaint category → routing rules
 * 2. Geographic jurisdiction
 * 3. Configured fallback department
 *
 * Records routing decisions for audit trail.
 */

import prisma from "@/lib/db";

export interface RoutingDecision {
  departmentId: string;
  departmentName: string;
  reason: string;
  method: "category_rule" | "jurisdiction" | "fallback" | "admin_review";
  confidence: "high" | "medium" | "low";
}

/**
 * Route a complaint to the appropriate department.
 */
export async function routeComplaint(params: {
  categoryId: string;
  latitude?: number | null;
  longitude?: number | null;
  priority?: string;
}): Promise<RoutingDecision | null> {
  const { categoryId, latitude, longitude } = params;

  // 1. Find routing rules for the category
  const routingRules = await prisma.routingRule.findMany({
    where: {
      categoryId,
      isActive: true,
    },
    include: {
      department: true,
      category: true,
    },
    orderBy: { priority: "desc" },
  });

  if (routingRules.length === 0) {
    // No routing rules configured — send to admin review
    return null;
  }

  // 2. If location provided, check jurisdiction
  if (latitude != null && longitude != null) {
    for (const rule of routingRules) {
      const jurisdictions = await prisma.departmentJurisdiction.findMany({
        where: {
          departmentId: rule.departmentId,
          isActive: true,
        },
      });

      for (const j of jurisdictions) {
        if (
          j.minLatitude != null &&
          j.maxLatitude != null &&
          j.minLongitude != null &&
          j.maxLongitude != null &&
          latitude >= j.minLatitude &&
          latitude <= j.maxLatitude &&
          longitude >= j.minLongitude &&
          longitude <= j.maxLongitude
        ) {
          return {
            departmentId: rule.department.id,
            departmentName: rule.department.name,
            reason: `Category "${rule.category.name}" matched to ${rule.department.name} within jurisdiction "${j.name}"`,
            method: "jurisdiction",
            confidence: "high",
          };
        }
      }
    }
  }

  // 3. Use highest-priority category rule
  const bestRule = routingRules[0];
  return {
    departmentId: bestRule.department.id,
    departmentName: bestRule.department.name,
    reason: `Category "${bestRule.category.name}" mapped to ${bestRule.department.name}`,
    method: "category_rule",
    confidence: latitude != null ? "medium" : "high",
  };
}

/**
 * Calculate the deadline for a complaint based on service level policies.
 */
export async function calculateDeadline(params: {
  departmentId: string;
  priority: string;
}): Promise<Date | null> {
  const policy = await prisma.serviceLevelPolicy.findFirst({
    where: {
      departmentId: params.departmentId,
      priority: params.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      isActive: true,
    },
  });

  // Fallback to global policy
  const effectivePolicy =
    policy ??
    (await prisma.serviceLevelPolicy.findFirst({
      where: {
        departmentId: null,
        priority: params.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        isActive: true,
      },
    }));

  if (!effectivePolicy) {
    // Default deadlines
    const defaultDays: Record<string, number> = {
      LOW: 30,
      MEDIUM: 14,
      HIGH: 7,
      CRITICAL: 3,
    };
    const days = defaultDays[params.priority] || 14;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    return deadline;
  }

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + effectivePolicy.resolutionDays);
  return deadline;
}

/**
 * Valid status transitions.
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["ASSIGNED", "REJECTED", "ESCALATED"],
  ASSIGNED: ["IN_PROGRESS", "UNDER_REVIEW", "ESCALATED"],
  IN_PROGRESS: ["RESOLVED", "AWAITING_INFO", "ESCALATED"],
  AWAITING_INFO: ["IN_PROGRESS", "RESOLVED", "ESCALATED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  ESCALATED: ["ASSIGNED", "IN_PROGRESS", "RESOLVED"],
  REJECTED: ["UNDER_REVIEW"],
  CLOSED: [],
};

/**
 * Validate a status transition.
 */
export function isValidTransition(
  fromStatus: string,
  toStatus: string
): boolean {
  const allowed = VALID_TRANSITIONS[fromStatus];
  if (!allowed) return false;
  return allowed.includes(toStatus);
}

/**
 * Get allowed next statuses for a given current status.
 */
export function getAllowedTransitions(currentStatus: string): string[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}

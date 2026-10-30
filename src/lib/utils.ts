import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique complaint reference number.
 * Format: SG-YYYYMMDD-XXXXX (e.g., SG-20261030-A3F7K)
 */
export function generateReferenceNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusable chars
  let random = "";
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SG-${dateStr}-${random}`;
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date with time.
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Get status color configuration.
 */
export function getStatusColor(status: string): {
  bg: string;
  text: string;
  dot: string;
} {
  const colors: Record<string, { bg: string; text: string; dot: string }> = {
    SUBMITTED: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      dot: "bg-blue-500",
    },
    UNDER_REVIEW: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      dot: "bg-yellow-500",
    },
    ASSIGNED: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      dot: "bg-indigo-500",
    },
    IN_PROGRESS: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      dot: "bg-purple-500",
    },
    AWAITING_INFO: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      dot: "bg-orange-500",
    },
    RESOLVED: {
      bg: "bg-green-50",
      text: "text-green-700",
      dot: "bg-green-500",
    },
    CLOSED: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      dot: "bg-gray-500",
    },
    REJECTED: {
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
    },
    ESCALATED: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      dot: "bg-rose-500",
    },
  };

  return (
    colors[status] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      dot: "bg-gray-500",
    }
  );
}

/**
 * Get priority color configuration.
 */
export function getPriorityColor(priority: string): {
  bg: string;
  text: string;
} {
  const colors: Record<string, { bg: string; text: string }> = {
    LOW: { bg: "bg-slate-100", text: "text-slate-600" },
    MEDIUM: { bg: "bg-blue-100", text: "text-blue-700" },
    HIGH: { bg: "bg-orange-100", text: "text-orange-700" },
    CRITICAL: { bg: "bg-red-100", text: "text-red-700" },
  };

  return colors[priority] || { bg: "bg-gray-100", text: "text-gray-600" };
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Calculate days remaining until deadline.
 */
export function getDaysRemaining(deadline: Date | string): {
  days: number;
  isOverdue: boolean;
  label: string;
} {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    days: Math.abs(days),
    isOverdue: days < 0,
    label: days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`,
  };
}

/**
 * Validate that a MIME type is an allowed image type.
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export function isValidImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType);
}

export function isValidImageSize(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= MAX_IMAGE_SIZE;
}

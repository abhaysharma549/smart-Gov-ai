import { z } from "zod";

// ============================================================
// Auth Schemas
// ============================================================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================================
// Complaint Schemas
// ============================================================

export const complaintSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be less than 5000 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  address: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationDescription: z.string().max(500).optional(),
  urgencyNote: z.string().max(1000).optional(),
  imageIds: z.array(z.string()).max(5, "Maximum 5 images allowed").optional(),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "You must consent to the privacy policy to submit a complaint",
    }),
  }),
});

export type ComplaintInput = z.infer<typeof complaintSchema>;

export const complaintUpdateSchema = z.object({
  status: z
    .enum([
      "SUBMITTED",
      "UNDER_REVIEW",
      "ASSIGNED",
      "IN_PROGRESS",
      "AWAITING_INFO",
      "RESOLVED",
      "CLOSED",
      "REJECTED",
      "ESCALATED",
    ])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  departmentId: z.string().optional(),
  resolutionSummary: z.string().max(5000).optional(),
  reason: z.string().max(1000).optional(),
});

export type ComplaintUpdateInput = z.infer<typeof complaintUpdateSchema>;

// ============================================================
// Investigation Note Schema
// ============================================================

export const noteSchema = z.object({
  content: z
    .string()
    .min(1, "Note cannot be empty")
    .max(5000, "Note is too long"),
  isInternal: z.boolean().default(true),
});

export type NoteInput = z.infer<typeof noteSchema>;

// ============================================================
// Feedback Schema
// ============================================================

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

// ============================================================
// Assignment Schema
// ============================================================

export const assignmentSchema = z.object({
  officerId: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  reason: z.string().max(500).optional(),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;

// ============================================================
// Pagination Schema
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  department: z.string().optional(),
  priority: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

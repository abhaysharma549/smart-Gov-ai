import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { complaintSchema, paginationSchema } from "@/lib/validations";
import { generateReferenceNumber } from "@/lib/utils";
import { routeComplaint, calculateDeadline } from "@/lib/routing";
import { analyzeComplaint } from "@/lib/ai-service";

/**
 * POST /api/complaints — Create a new complaint
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const result = complaintSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // Verify category exists
    const category = await prisma.complaintCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Generate unique reference number
    let referenceNumber: string;
    let attempts = 0;
    do {
      referenceNumber = generateReferenceNumber();
      const existing = await prisma.complaint.findUnique({
        where: { referenceNumber },
      });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json(
        { error: "Unable to generate unique reference number. Please try again." },
        { status: 500 }
      );
    }

    // Route to department
    const routingDecision = await routeComplaint({
      categoryId: data.categoryId,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    // Calculate deadline
    const deadline = routingDecision
      ? await calculateDeadline({
          departmentId: routingDecision.departmentId,
          priority: "MEDIUM",
        })
      : null;

    // Create complaint with transaction
    const complaint = await prisma.$transaction(async (tx) => {
      // Create complaint
      const newComplaint = await tx.complaint.create({
        data: {
          referenceNumber,
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          citizenId: session.user.id,
          departmentId: routingDecision?.departmentId || null,
          status: routingDecision ? "UNDER_REVIEW" : "SUBMITTED",
          priority: "MEDIUM",
          urgencyNote: data.urgencyNote || null,
          address: data.address || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          locationDescription: data.locationDescription || null,
          routingReason: routingDecision?.reason || "No routing rule found — pending admin review",
          routedAt: routingDecision ? new Date() : null,
          deadline,
        },
      });

      // Link images if provided
      if (data.imageIds && data.imageIds.length > 0) {
        await tx.complaintImage.updateMany({
          where: {
            id: { in: data.imageIds },
          },
          data: {
            complaintId: newComplaint.id,
          },
        });
      }

      // Create initial status history
      await tx.complaintStatusHistory.create({
        data: {
          complaintId: newComplaint.id,
          toStatus: routingDecision ? "UNDER_REVIEW" : "SUBMITTED",
          reason: "Complaint submitted by citizen",
        },
      });

      // Create assignment if routed
      if (routingDecision) {
        await tx.complaintAssignment.create({
          data: {
            complaintId: newComplaint.id,
            departmentId: routingDecision.departmentId,
            reason: routingDecision.reason,
          },
        });
      }

      // Create notification for citizen
      await tx.notification.create({
        data: {
          userId: session.user.id,
          complaintId: newComplaint.id,
          type: "STATUS_UPDATE",
          title: "Complaint Submitted",
          message: `Your complaint "${data.title}" has been submitted with reference number ${referenceNumber}.${routingDecision ? ` It has been assigned to ${routingDecision.departmentName}.` : " It is awaiting routing."}`,
          actionUrl: `/complaints/${newComplaint.id}`,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "COMPLAINT_CREATED",
          entity: "Complaint",
          entityId: newComplaint.id,
          details: JSON.stringify({
            referenceNumber,
            categoryId: data.categoryId,
            departmentId: routingDecision?.departmentId,
            routingMethod: routingDecision?.method,
          }),
        },
      });

      return newComplaint;
    });

    // Run AI analysis asynchronously (don't block response)
    // In production, this should be a background job
    analyzeComplaint({
      complaintId: complaint.id,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      imageKeys: data.imageIds,
      latitude: data.latitude,
      longitude: data.longitude,
    })
      .then(async (analysis) => {
        // Save analysis results
        await prisma.aIAnalysis.create({
          data: {
            complaintId: complaint.id,
            type: "FULL",
            provider: "local",
            modelVersion: "1.0.0",
            results: JSON.stringify(analysis),
            confidence: analysis.classification?.confidence ?? null,
          },
        });

        // Update complaint with AI results
        await prisma.complaint.update({
          where: { id: complaint.id },
          data: {
            suggestedCategory: analysis.classification?.suggestedCategory,
            categoryConfidence: analysis.classification?.confidence,
            riskScore: analysis.risk.score,
            aiAnalyzedAt: new Date(),
          },
        });

        // Create duplicate relationships
        if (analysis.duplicates?.candidates) {
          for (const dup of analysis.duplicates.candidates) {
            await prisma.complaintRelationship.create({
              data: {
                parentId: dup.complaintId,
                childId: complaint.id,
                similarityScore: dup.overallSimilarity,
                textSimilarity: dup.textSimilarity,
                geoDistance: dup.geoDistance,
                imageSimilarity: dup.imageSimilarity,
                matchExplanation: dup.explanation,
              },
            }).catch(() => {
              // Ignore duplicate relationship errors
            });
          }
        }
      })
      .catch((error) => {
        console.error("AI analysis failed (complaint preserved):", error);
      });

    return NextResponse.json(
      {
        data: {
          id: complaint.id,
          referenceNumber: complaint.referenceNumber,
          status: complaint.status,
          department: routingDecision?.departmentName || null,
          routingReason: complaint.routingReason,
        },
        message: "Complaint submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Complaint creation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/complaints — List complaints with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = paginationSchema.parse(Object.fromEntries(searchParams));

    const { page, limit, search, status, category, department, priority, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    // Build where clause based on role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isDeleted: false };

    if (session.user.role === "CITIZEN") {
      where.citizenId = session.user.id;
    } else if (session.user.role === "OFFICER") {
      where.departmentId = session.user.departmentId;
    }
    // ADMIN sees all

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { referenceNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (category) where.categoryId = category;
    if (department) where.departmentId = department;
    if (priority) where.priority = priority;

    // Date filters
    if (params.dateFrom) {
      where.createdAt = { ...where.createdAt, gte: new Date(params.dateFrom) };
    }
    if (params.dateTo) {
      where.createdAt = { ...where.createdAt, lte: new Date(params.dateTo) };
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, code: true } },
          department: { select: { id: true, name: true } },
          images: { select: { id: true, storageKey: true, originalName: true } },
          _count: {
            select: { statusHistory: true, notes: true },
          },
        },
        orderBy: {
          [sortBy || "createdAt"]: sortOrder || "desc",
        },
        skip,
        take: limit,
      }),
      prisma.complaint.count({ where }),
    ]);

    return NextResponse.json({
      data: complaints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List complaints error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

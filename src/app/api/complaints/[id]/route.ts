import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { complaintUpdateSchema } from "@/lib/validations";
import { isValidTransition } from "@/lib/routing";

/**
 * GET /api/complaints/[id] — Get complaint details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
      where: { id, isDeleted: false },
      include: {
        category: true,
        department: true,
        citizen: {
          select: { id: true, name: true, email: true },
        },
        images: {
          select: {
            id: true,
            storageKey: true,
            originalName: true,
            mimeType: true,
            sizeBytes: true,
            isRelevant: true,
            relevanceNote: true,
            createdAt: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        assignments: {
          where: { isActive: true },
          include: {
            department: { select: { id: true, name: true } },
            officer: { select: { id: true, name: true, email: true } },
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { id: true, name: true, role: true } },
          },
        },
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        feedbacks: true,
        escalations: {
          orderBy: { createdAt: "desc" },
        },
        resolutionEvidence: true,
        duplicateOf: {
          include: {
            parent: {
              select: { id: true, referenceNumber: true, title: true, status: true },
            },
          },
        },
        duplicates: {
          include: {
            child: {
              select: { id: true, referenceNumber: true, title: true, status: true },
            },
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    // Authorization check
    if (session.user.role === "CITIZEN" && complaint.citizenId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      session.user.role === "OFFICER" &&
      complaint.departmentId !== session.user.departmentId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Filter internal notes for citizens
    if (session.user.role === "CITIZEN") {
      complaint.notes = complaint.notes.filter((n) => !n.isInternal);
    }

    return NextResponse.json({ data: complaint });
  } catch (error) {
    console.error("Get complaint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/complaints/[id] — Update complaint status/details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const result = complaintUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id, isDeleted: false },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    // Authorization: citizens can only add info, officers/admin can update status
    if (session.user.role === "CITIZEN") {
      if (complaint.citizenId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Citizens cannot change status directly
      if (result.data.status) {
        return NextResponse.json(
          { error: "Citizens cannot change complaint status" },
          { status: 403 }
        );
      }
    }

    if (
      session.user.role === "OFFICER" &&
      complaint.departmentId !== session.user.departmentId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData = result.data;

    // Validate status transition
    if (updateData.status && updateData.status !== complaint.status) {
      if (!isValidTransition(complaint.status, updateData.status)) {
        return NextResponse.json(
          {
            error: `Invalid status transition from ${complaint.status} to ${updateData.status}`,
          },
          { status: 400 }
        );
      }
    }

    // Transaction for status update
    const updated = await prisma.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = {};

      if (updateData.status) {
        data.status = updateData.status;
        if (updateData.status === "RESOLVED") {
          data.resolvedAt = new Date();
          data.resolutionSummary = updateData.resolutionSummary || null;
        }
        if (updateData.status === "CLOSED") {
          data.closedAt = new Date();
        }

        // Create status history
        await tx.complaintStatusHistory.create({
          data: {
            complaintId: id,
            fromStatus: complaint.status,
            toStatus: updateData.status,
            changedBy: session.user.id,
            reason: updateData.reason || null,
          },
        });

        // Notify citizen
        await tx.notification.create({
          data: {
            userId: complaint.citizenId,
            complaintId: id,
            type: "STATUS_UPDATE",
            title: "Complaint Status Updated",
            message: `Your complaint ${complaint.referenceNumber} status has changed to ${updateData.status.replace("_", " ")}.${updateData.reason ? ` Reason: ${updateData.reason}` : ""}`,
            actionUrl: `/complaints/${id}`,
          },
        });
      }

      if (updateData.priority) {
        data.priority = updateData.priority;
      }

      if (updateData.resolutionSummary) {
        data.resolutionSummary = updateData.resolutionSummary;
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "COMPLAINT_UPDATED",
          entity: "Complaint",
          entityId: id,
          details: JSON.stringify(updateData),
        },
      });

      return tx.complaint.update({
        where: { id },
        data,
        include: {
          category: true,
          department: true,
        },
      });
    });

    return NextResponse.json({
      data: updated,
      message: "Complaint updated successfully",
    });
  } catch (error) {
    console.error("Update complaint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

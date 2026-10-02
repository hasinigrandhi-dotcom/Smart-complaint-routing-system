import prisma from '../lib/prisma';
import { getComplaintPriorityLevel } from './complaintPriority';
import { sortComplaints, type ComplaintSortKey, type SortDirection } from './complaintAlgorithmService';

export type AdminComplaintFilters = {
  status?: string;
  category?: string;
  priority?: string;
  department?: string;
  search?: string;
  sortKey?: ComplaintSortKey;
  direction?: SortDirection;
};

export async function listDepartmentsForAdmin() {
  return prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });
}

export async function listComplaintsForAdmin(filters: AdminComplaintFilters = {}) {
  const where: any = {};

  if (filters.status) {
    where.status = filters.status as any;
  }

  if (filters.category) {
    where.category = filters.category as any;
  }

  if (filters.department) {
    where.assignedDepartmentId = filters.department;
  }

  if (filters.search?.trim()) {
    const search = filters.search.trim();
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { assignedDepartment: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const complaints = await prisma.complaint.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      assignedDepartment: {
        select: { id: true, name: true, code: true }
      }
    }
  });

  const priorityFilter = filters.priority?.trim().toUpperCase();
  const filteredComplaints = priorityFilter
    ? complaints.filter((complaint) => getComplaintPriorityLevel(complaint.priorityScore).toUpperCase() === priorityFilter)
    : complaints;

  const mappedComplaints = filteredComplaints.map((complaint) => ({
    ...complaint,
    priorityLevel: getComplaintPriorityLevel(complaint.priorityScore)
  }));

  const sortKey = filters.sortKey ?? 'priority';
  const direction = filters.direction ?? 'desc';

  return sortComplaints(mappedComplaints, sortKey, direction);
}

export async function getComplaintForAdmin(complaintId: string) {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      assignedDepartment: {
        select: { id: true, name: true, code: true }
      },
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        include: {
          changedBy: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  });

  if (!complaint) {
    throw Object.assign(new Error('Complaint not found'), { status: 404 });
  }

  return {
    ...complaint,
    priorityLevel: getComplaintPriorityLevel(complaint.priorityScore)
  };
}

export async function updateComplaintStatusForAdmin(
  complaintId: string,
  nextStatus: string,
  actorId: string,
  note?: string
) {
  const status = nextStatus?.trim().toUpperCase();
  const allowedStatuses = [
    'SUBMITTED',
    'REVIEWING',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'REJECTED',
    'ESCALATED'
  ];

  if (!status || !allowedStatuses.includes(status)) {
    throw Object.assign(new Error('Invalid complaint status'), { status: 400 });
  }

  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) {
    throw Object.assign(new Error('Complaint not found'), { status: 404 });
  }

  const shouldCreateHistory = complaint.status !== status;
  const updatedComplaint = await prisma.$transaction(async (tx) => {
    const resolvedAt = status === 'RESOLVED' ? complaint.resolvedAt ?? new Date() : null;

    const updated = await tx.complaint.update({
      where: { id: complaintId },
      data: {
        status: status as any,
        resolvedAt,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        assignedDepartment: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    if (shouldCreateHistory) {
      await tx.complaintStatusHistory.create({
        data: {
          complaintId,
          fromStatus: complaint.status,
          toStatus: status as any,
          changedById: actorId,
          note: note?.trim() || 'Status updated by administrator'
        }
      });
    }

    return updated;
  });

  return {
    ...updatedComplaint,
    priorityLevel: getComplaintPriorityLevel(updatedComplaint.priorityScore)
  };
}

export async function assignComplaintDepartmentForAdmin(
  complaintId: string,
  departmentId: string,
  actorId: string,
  reason?: string
) {
  if (!departmentId) {
    throw Object.assign(new Error('Department ID is required'), { status: 400 });
  }

  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) {
    throw Object.assign(new Error('Complaint not found'), { status: 404 });
  }

  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) {
    throw Object.assign(new Error('Department not found'), { status: 404 });
  }

  const existingAssignment = await prisma.complaintAssignment.findFirst({
    where: {
      complaintId,
      isActive: true
    },
    orderBy: {
      assignedAt: 'desc'
    }
  });

  const nextStatus = complaint.status === 'RESOLVED' || complaint.status === 'REJECTED' ? complaint.status : 'ASSIGNED';

  const result = await prisma.$transaction(async (tx) => {
    if (existingAssignment) {
      await tx.complaintAssignment.update({
        where: { id: existingAssignment.id },
        data: { isActive: false }
      });
    }

    const assignment = await tx.complaintAssignment.create({
      data: {
        complaintId,
        departmentId,
        assignedById: actorId,
        reason: existingAssignment ? 'REASSIGNED' : 'MANUAL_ASSIGNMENT',
        isActive: true
      }
    });

    const updatedComplaint = await tx.complaint.update({
      where: { id: complaintId },
      data: {
        assignedDepartmentId: departmentId,
        status: nextStatus as any,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        assignedDepartment: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    if (updatedComplaint.status !== complaint.status) {
      await tx.complaintStatusHistory.create({
        data: {
          complaintId,
          fromStatus: complaint.status,
          toStatus: nextStatus as any,
          changedById: actorId,
          note: reason?.trim() || `Assigned to ${department.name} by administrator`
        }
      });
    }

    return { assignment, complaint: updatedComplaint };
  });

  return {
    ...result.complaint,
    priorityLevel: getComplaintPriorityLevel(result.complaint.priorityScore)
  };
}

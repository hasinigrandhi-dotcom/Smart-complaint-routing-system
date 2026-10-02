import prisma from '../lib/prisma';
import { calculateComplaintPriority, getComplaintPriorityLevel } from './complaintPriority';
import type { ComplaintCategory } from './complaintPriority';
import { sortComplaints, type ComplaintSortKey, type SortDirection } from './complaintAlgorithmService';
import { loadDepartmentGraphFromDatabase } from './departmentGraphService';
import {
  ComplaintRoutingService,
  buildCategoryToDepartmentMap
} from '../dsa/complaintRouting';

export type ComplaintInput = {
  title: string;
  description: string;
  category?: ComplaintCategory;
  severity: number;
  urgency: number;
  location?: string;
  area?: string;
};
  function detectComplaintCategory(title: string, description: string): ComplaintCategory {
  const text = `${title} ${description}`.toLowerCase();

  if (
    text.includes('street light') ||
    text.includes('streetlight') ||
    text.includes('street lighting') ||
    text.includes('lamp post') ||
    text.includes('light pole')
  ) {
    return 'STREET_LIGHTS';
  }

  if (
    text.includes('water leak') ||
    text.includes('water leakage') ||
    text.includes('no water') ||
    text.includes('water supply') ||
    text.includes('drinking water') ||
    text.includes('pipe burst') ||
    text.includes('water pipe')
  ) {
    return 'WATER_SUPPLY';
  }

  if (
    text.includes('road') ||
    text.includes('pothole') ||
    text.includes('potholes') ||
    text.includes('street damage') ||
    text.includes('road damage')
  ) {
    return 'ROADS';
  }

  if (
    text.includes('electricity') ||
    text.includes('power cut') ||
    text.includes('power outage') ||
    text.includes('electric') ||
    text.includes('transformer')
  ) {
    return 'ELECTRICITY';
  }

  if (
    text.includes('garbage') ||
    text.includes('trash') ||
    text.includes('waste') ||
    text.includes('dustbin') ||
    text.includes('rubbish')
  ) {
    return 'GARBAGE';
  }

  if (
    text.includes('sewage') ||
    text.includes('sewer') ||
    text.includes('drainage') ||
    text.includes('drain') ||
    text.includes('sanitation')
  ) {
    return 'SANITATION';
  }

  if (
    text.includes('crime') ||
    text.includes('unsafe') ||
    text.includes('security') ||
    text.includes('public safety') ||
    text.includes('police')
  ) {
    return 'PUBLIC_SAFETY';
  }

  return 'OTHER';
}


export async function createComplaintForUser(userId: string, input: ComplaintInput) {
  /**
   * Creates a complaint record for a user and computes an internal
   * `priorityScore` used by the ADSA priority flows. The service validates
   * inputs, computes the score, and persists the complaint in Prisma.
   */
 const title = (input.title || '').trim();
const description = (input.description || '').trim();
const category = detectComplaintCategory(title, description);
const severity = Number(input.severity);
const urgency = Number(input.urgency);
const location = (input.location || '').trim();
const area = (input.area || '').trim();
  if (!title || !description) {
    throw Object.assign(new Error('Title and description are required'), { status: 400 });
  }
  if (!location) {
  throw Object.assign(new Error('Location is required'), { status: 400 });
}

if (!area) {
  throw Object.assign(new Error('Area / Ward is required'), { status: 400 });
}


  if (Number.isNaN(severity) || severity < 1 || severity > 5) {
    throw Object.assign(new Error('Severity must be a number between 1 and 5'), { status: 400 });
  }

  if (Number.isNaN(urgency) || urgency < 1 || urgency > 5) {
    throw Object.assign(new Error('Urgency must be a number between 1 and 5'), { status: 400 });
  }

  const createdAt = new Date();
  const priorityScore = calculateComplaintPriority(severity, urgency, category, createdAt);
  const departmentGraph = await loadDepartmentGraphFromDatabase();
const routingService = new ComplaintRoutingService(
  buildCategoryToDepartmentMap(),
  departmentGraph
);

const assignedDepartmentId = routingService.getDepartmentForCategory(category);

if (!assignedDepartmentId) {
  throw Object.assign(
    new Error(`No department found for complaint category ${category}`),
    { status: 500 }
  );
}

  const complaint = await prisma.complaint.create({
    data: {
      title,
      description,
      category,
      severity,
      urgency,
      location,
      area,
      
      priorityScore,
      userId,
      status: 'SUBMITTED'
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return {
    ...complaint,
    priorityLevel: getComplaintPriorityLevel(complaint.priorityScore)
  };
}

export async function listComplaintsForUser(
  userId: string,
  filters?: {
    status?: string;
    search?: string;
    sortKey?: ComplaintSortKey;
    direction?: SortDirection;
  }
) {
  const status = filters?.status;
  const search = filters?.search?.trim();
  const sortKey = filters?.sortKey ?? 'date';
  const direction = filters?.direction ?? 'desc';

  const complaints = await prisma.complaint.findMany({
    where: {
      userId,
      ...(status ? { status: status as any } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { category: { equals: search.toUpperCase() as any } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: 'desc' },
    include: {
      assignedDepartment: {
        select: { id: true, name: true, code: true }
      }
    }
  });

  const mappedComplaints = complaints.map((complaint) => ({
    ...complaint,
    priorityLevel: getComplaintPriorityLevel(complaint.priorityScore)
  }));

  return sortComplaints(mappedComplaints, sortKey, direction);
}

export async function getComplaintForUser(userId: string, complaintId: string) {
  const complaint = await prisma.complaint.findFirst({
    where: {
      id: complaintId,
      userId
    },
    include: {
      assignedDepartment: {
        select: { id: true, name: true, code: true }
      }
    }
  });

  if (!complaint) {
    throw Object.assign(new Error('Complaint not found for this user'), { status: 404 });
  }

  return {
    ...complaint,
    priorityLevel: getComplaintPriorityLevel(complaint.priorityScore)
  };
}

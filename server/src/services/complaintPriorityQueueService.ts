import prisma from '../lib/prisma';
import { ComplaintQueueItem, MaxComplaintPriorityQueue } from '../dsa/complaintPriorityQueue';

export async function loadPriorityQueueFromDatabase(limit = 50) {
  const complaints = await prisma.complaint.findMany({
    where: {
      status: {
        notIn: ['RESOLVED', 'REJECTED']
      }
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      category: true,
      severity: true,
      urgency: true,
      priorityScore: true,
      createdAt: true
    }
  });

  return new MaxComplaintPriorityQueue(complaints.map((complaint) => ({
    id: complaint.id,
    title: complaint.title,
    description: complaint.description,
    status: complaint.status,
    category: complaint.category,
    severity: complaint.severity,
    urgency: complaint.urgency,
    priorityScore: complaint.priorityScore,
    createdAt: complaint.createdAt
  })));
}

export function processNextComplaint(queue: MaxComplaintPriorityQueue): ComplaintQueueItem | null {
  return queue.extract();
}

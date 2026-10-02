import prisma from '../lib/prisma';
import { ComplaintProcessingQueue } from '../dsa/complaintProcessingQueue';

export async function loadComplaintsIntoProcessingQueue(limit = 25) {
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

  const queue = new ComplaintProcessingQueue();
  complaints.forEach((complaint) => {
    queue.enqueue({
      id: complaint.id,
      title: complaint.title,
      description: complaint.description,
      status: complaint.status,
      category: complaint.category,
      severity: complaint.severity,
      urgency: complaint.urgency,
      priorityScore: complaint.priorityScore,
      createdAt: complaint.createdAt
    });
  });

  return queue;
}

export function processQueueNext(queue: ComplaintProcessingQueue) {
  return queue.dequeue();
}

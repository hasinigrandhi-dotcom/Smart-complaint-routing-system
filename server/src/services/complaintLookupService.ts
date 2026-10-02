import prisma from '../lib/prisma';
import { ComplaintHashMap } from '../dsa/complaintHashMap';

export type ComplaintLookupRecord = {
  id: string;
  title: string;
  category: string;
  status: string;
  priorityScore: number;
};

export async function loadComplaintHashMapFromDatabase() {
  const complaints = await prisma.complaint.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      priorityScore: true
    }
  });

  const map = new ComplaintHashMap<ComplaintLookupRecord>();
  complaints.forEach((complaint) => {
    map.set(complaint.id, {
      id: complaint.id,
      title: complaint.title,
      category: complaint.category,
      status: complaint.status,
      priorityScore: complaint.priorityScore
    });
  });

  return map;
}

export function findComplaintByIdFast(map: ComplaintHashMap<ComplaintLookupRecord>, complaintId: string) {
  return map.get(complaintId);
}

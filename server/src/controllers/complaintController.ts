import { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createComplaintForUser, getComplaintForUser, listComplaintsForUser } from '../services/complaintService';
import type { ComplaintSortKey, SortDirection } from '../services/complaintAlgorithmService';

export const createComplaint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const complaint = await createComplaintForUser(req.user.userId, req.body || {});
    return res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || 'Complaint creation failed' });
  }
};

export const getMyComplaints = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { status, search, sortKey, direction } = req.query || {};
    const complaints = await listComplaintsForUser(req.user.userId, {
      status: typeof status === 'string' ? status : undefined,
      search: typeof search === 'string' ? search : undefined,
      sortKey: typeof sortKey === 'string' ? (sortKey as ComplaintSortKey) : undefined,
      direction: typeof direction === 'string' ? (direction as SortDirection) : undefined
    });

    return res.status(200).json({ complaints });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unable to load complaints' });
  }
};

export const getComplaintDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const complaintId = req.params.id;
    const complaint = await getComplaintForUser(req.user.userId, complaintId);
    return res.status(200).json({ complaint });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || 'Unable to load complaint detail' });
  }
};

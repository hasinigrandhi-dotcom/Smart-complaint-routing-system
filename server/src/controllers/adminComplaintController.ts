import { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  assignComplaintDepartmentForAdmin,
  getComplaintForAdmin,
  listComplaintsForAdmin,
  listDepartmentsForAdmin,
  updateComplaintStatusForAdmin
} from '../services/adminComplaintService';
import type { ComplaintSortKey, SortDirection } from '../services/complaintAlgorithmService';

export const getAdminDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const sortKey = typeof req.query.sortKey === 'string' ? (req.query.sortKey as ComplaintSortKey) : undefined;
    const direction = typeof req.query.direction === 'string' ? (req.query.direction as SortDirection) : undefined;

    const complaints = await listComplaintsForAdmin({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      priority: typeof req.query.priority === 'string' ? req.query.priority : undefined,
      department: typeof req.query.department === 'string' ? req.query.department : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortKey,
      direction
    });

    const departments = await listDepartmentsForAdmin();

    return res.status(200).json({
      complaints,
      departments,
      summary: {
        total: complaints.length,
        submitted: complaints.filter((item) => item.status === 'SUBMITTED').length,
        inProgress: complaints.filter((item) => ['ASSIGNED', 'IN_PROGRESS', 'REVIEWING'].includes(String(item.status))).length,
        resolved: complaints.filter((item) => item.status === 'RESOLVED').length,
        escalated: complaints.filter((item) => item.status === 'ESCALATED').length
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unable to load admin dashboard' });
  }
};

export const getAdminComplaintDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const complaint = await getComplaintForAdmin(req.params.id);
    return res.status(200).json({ complaint });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || 'Unable to load complaint detail' });
  }
};

export const updateAdminComplaintStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const complaint = await updateComplaintStatusForAdmin(
      req.params.id,
      String(req.body?.status || ''),
      req.user.userId,
      typeof req.body?.note === 'string' ? req.body.note : undefined
    );

    return res.status(200).json({ message: 'Complaint status updated', complaint });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || 'Unable to update complaint status' });
  }
};

export const assignAdminComplaintDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const complaint = await assignComplaintDepartmentForAdmin(
      req.params.id,
      String(req.body?.departmentId || ''),
      req.user.userId,
      typeof req.body?.note === 'string' ? req.body.note : undefined
    );

    return res.status(200).json({ message: 'Complaint department updated', complaint });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || 'Unable to assign department' });
  }
};

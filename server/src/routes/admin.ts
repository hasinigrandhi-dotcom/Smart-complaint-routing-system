import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import {
  assignAdminComplaintDepartment,
  getAdminComplaintDetail,
  getAdminDashboard,
  updateAdminComplaintStatus
} from '../controllers/adminComplaintController';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/dashboard', getAdminDashboard);
router.get('/complaints/:id', getAdminComplaintDetail);
router.patch('/complaints/:id/status', updateAdminComplaintStatus);
router.patch('/complaints/:id/assign-department', assignAdminComplaintDepartment);

export default router;

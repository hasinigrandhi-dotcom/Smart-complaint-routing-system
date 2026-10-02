import { Router } from 'express';
import { createComplaint, getComplaintDetail, getMyComplaints } from '../controllers/complaintController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.post('/', createComplaint);
router.get('/my', getMyComplaints);
router.get('/:id', getComplaintDetail);

export default router;

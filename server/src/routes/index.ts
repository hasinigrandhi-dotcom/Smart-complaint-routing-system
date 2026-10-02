import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import complaintRouter from './complaint';
import adminRouter from './admin';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/complaints', complaintRouter);
router.use('/admin', adminRouter);

router.get('/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({
    user: req.user
  });
});

export default router;

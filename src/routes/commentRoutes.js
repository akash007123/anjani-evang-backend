import { Router } from 'express';
import {
  getAllComments,
  getCommentById,
  approveComment,
  rejectComment,
  deleteComment
} from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', protect, authorize('Super Admin', 'Admin'), getAllComments);
router.get('/:id', protect, authorize('Super Admin', 'Admin'), getCommentById);
router.patch('/:id/approve', protect, authorize('Super Admin', 'Admin'), approveComment);
router.patch('/:id/reject', protect, authorize('Super Admin', 'Admin'), rejectComment);
router.delete('/:id', protect, authorize('Super Admin', 'Admin'), deleteComment);

export default router;

import { Router } from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  resetUserPassword, 
  toggleUserStatus 
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', protect, authorize('Super Admin'), getUsers);
router.get('/:id', protect, authorize('Super Admin'), getUserById);
router.post('/', protect, authorize('Super Admin'), createUser);
router.put('/:id', protect, authorize('Super Admin'), updateUser);
router.delete('/:id', protect, authorize('Super Admin'), deleteUser);
router.post('/:id/reset-password', protect, authorize('Super Admin'), resetUserPassword);
router.patch('/:id/status', protect, authorize('Super Admin'), toggleUserStatus);

export default router;

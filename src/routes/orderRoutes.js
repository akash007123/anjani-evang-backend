import { Router } from 'express';
import { createOrder, getAllOrders, updateOrderStatus, deleteOrder } from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', createOrder);
router.get('/', protect, getAllOrders);
router.patch('/:id/status', protect, updateOrderStatus);
router.delete('/:id', protect, deleteOrder);

export default router;

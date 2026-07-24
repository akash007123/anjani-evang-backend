import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '../controllers/faqController.js';

const router = Router();

router.get('/', getFAQs);
router.post('/', protect, authorize('admin'), createFAQ);
router.put('/:id', protect, authorize('admin'), updateFAQ);
router.delete('/:id', protect, authorize('admin'), deleteFAQ);

export default router;

import { Router } from 'express';
import { submitContactInquiry, submitCalendarBooking, submitCateringOrder, subscribeNewsletter } from '../controllers/utilityController.js';

const router = Router();

router.post('/contact', submitContactInquiry);
router.post('/booking', submitCalendarBooking);
router.post('/order', submitCateringOrder);
router.post('/newsletter/subscribe', subscribeNewsletter);

export default router;

import { Router } from 'express';
import { 
  getSubscribers, 
  subscribeNewsletter, 
  updateSubscriberStatus, 
  deleteSubscriber, 
  bulkDeleteSubscribers, 
  exportSubscribersCSV 
} from '../controllers/newsletterController.js';

const router = Router();

router.get('/', getSubscribers);
router.post('/subscribe', subscribeNewsletter);
router.get('/export', exportSubscribersCSV);
router.patch('/:id/status', updateSubscriberStatus);
router.delete('/:id', deleteSubscriber);
router.post('/bulk-delete', bulkDeleteSubscribers);

export default router;

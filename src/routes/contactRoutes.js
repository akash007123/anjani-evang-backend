import { Router } from 'express';
import { submitContact, getAllContacts, getContactById, updateContactStatus, deleteContact } from '../controllers/contactController.js';
import { contactValidation } from '../validators/contactValidator.js';
import { validateRequest } from '../middlewares/validatorMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', contactValidation, validateRequest, submitContact);
router.get('/', protect, getAllContacts);
router.get('/:id', protect, getContactById);
router.patch('/:id/status', protect, updateContactStatus);
router.delete('/:id', protect, deleteContact);

export default router;

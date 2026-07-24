import { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadMedia } from '../controllers/uploadController.js';

const router = Router();

router.post('/', protect, upload.single('file'), uploadMedia);

export default router;

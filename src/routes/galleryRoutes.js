import { Router } from 'express';
import { 
  getGalleryItems, 
  createGalleryItem, 
  updateGalleryItem, 
  deleteGalleryItem 
} from '../controllers/galleryController.js';

const router = Router();

router.get('/', getGalleryItems);
router.post('/', createGalleryItem);
router.put('/:id', updateGalleryItem);
router.delete('/:id', deleteGalleryItem);

export default router;

import { Router } from 'express';
import { 
  getBlogs, 
  getBlogBySlug, 
  createBlog, 
  updateBlog, 
  deleteBlog 
} from '../controllers/blogController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/', protect, authorize('Super Admin', 'Admin'), createBlog);
router.put('/:id', protect, authorize('Super Admin', 'Admin'), updateBlog);
router.delete('/:id', protect, authorize('Super Admin', 'Admin'), deleteBlog);

export default router;

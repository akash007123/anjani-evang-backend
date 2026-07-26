import { Router } from 'express';
import { 
  getBlogs, 
  getBlogById,
  getBlogBySlug, 
  createBlog, 
  updateBlog, 
  deleteBlog 
} from '../controllers/blogController.js';
import {
  getBlogComments,
  createComment
} from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', getBlogs);
router.get('/id/:id', getBlogById);
router.get('/:slug', getBlogBySlug);
router.post('/', protect, authorize('Super Admin', 'Admin'), createBlog);
router.put('/:id', protect, authorize('Super Admin', 'Admin'), updateBlog);
router.delete('/:id', protect, authorize('Super Admin', 'Admin'), deleteBlog);

router.get('/:blogId/comments', getBlogComments);
router.post('/:blogId/comments', createComment);

export default router;

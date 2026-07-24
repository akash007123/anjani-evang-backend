import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { getProjects, getProjectBySlug, createProject, updateProject, deleteProject } from '../controllers/projectController.js';

const router = Router();

router.get('/', getProjects);
router.get('/slug/:slug', getProjectBySlug);
router.post('/', protect, authorize('admin'), createProject);
router.put('/:id', protect, authorize('admin'), updateProject);
router.delete('/:id', protect, authorize('admin'), deleteProject);

export default router;

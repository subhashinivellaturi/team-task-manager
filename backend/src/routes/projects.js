import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} from '../controllers/projectsController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectAdmin } from '../middleware/requireProjectAdmin.js';

const router = Router();

router.get('/', requireAuth, getProjects);
router.post('/', requireAuth, createProject);
router.get('/:id', requireAuth, getProjectById);
router.put('/:id', requireAuth, requireProjectAdmin, updateProject);
router.delete('/:id', requireAuth, requireProjectAdmin, deleteProject);
router.post('/:id/members', requireAuth, requireProjectAdmin, addMember);
router.delete('/:id/members/:userId', requireAuth, requireProjectAdmin, removeMember);

export default router;
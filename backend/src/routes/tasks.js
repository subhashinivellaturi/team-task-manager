import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/tasksController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectAdmin } from '../middleware/requireProjectAdmin.js';

const router = Router();

router.get('/', requireAuth, getTasks);
router.post('/', requireAuth, requireProjectAdmin, createTask);
router.put('/:id', requireAuth, updateTask);
router.delete('/:id', requireAuth, requireProjectAdmin, deleteTask);

export default router;
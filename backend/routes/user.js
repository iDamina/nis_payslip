// routes/user.js
import express from 'express';
import protect from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js'; // we’ll create this
import {
  getUsers,
  createUser,
  updateUserPassword,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.use(protect); // All routes require auth
router.use(adminOnly); // All routes require admin role

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id/password', updateUserPassword);
router.delete('/:id', deleteUser);

export default router;
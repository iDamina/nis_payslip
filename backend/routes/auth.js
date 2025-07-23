// routes/auth.js
import express from 'express';
import {
  loginUser,
  createUser,
  updatePassword,
  getAllUsers,
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

// Public
router.post('/login', loginUser);

// Admin-only
router.post('/users', protect, adminOnly, createUser);
router.put('/users/:id/password', protect, adminOnly, updatePassword);
router.get('/users', protect, adminOnly, getAllUsers);

export default router;
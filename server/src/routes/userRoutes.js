const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Perfil del usuario autenticado
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

// ─── Admin ─────────────────────────────────────

// Ver todos los usuarios: admin y superadmin
router.get('/all', authenticate, authorize('admin', 'superadmin'), userController.getAllUsers);

// Crear usuario: solo superadmin
router.post('/', authenticate, authorize('superadmin'), userController.createUser);

// Editar usuario: solo superadmin
router.put('/:id', authenticate, authorize('superadmin'), userController.updateUser);

// Cambiar rol: solo superadmin
router.patch('/:userId/role', authenticate, authorize('superadmin'), userController.updateUserRole);

// Activar/desactivar usuario: admin y superadmin
router.patch('/:userId/active', authenticate, authorize('admin', 'superadmin'), userController.toggleUserActive);

module.exports = router;
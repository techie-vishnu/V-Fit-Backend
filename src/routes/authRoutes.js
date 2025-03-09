const express = require('express');
const router = express.Router();
const { registerUser, login, logout, userProfile, getAllUsers, assignUserRole } = require('../controllers/authController');
const { authUser } = require('../middlewares/authUser');
const { adminUser } = require('../middlewares/adminUser');

// Public Routes
router.post('/auth/login', login);
router.get('/auth/logout', logout);

// Login Routes
router.get('/user/profile', authUser, userProfile);

// Protected Routes (Admin Only CRUD Operations)
router.post('/auth/register', adminUser, registerUser);
router.get('/auth/users', adminUser, getAllUsers);
router.patch('/auth/users/assignrole', adminUser, assignUserRole);



module.exports = router;
const express = require('express');
const router = express.Router();
const {
    registerUser,
    login,
    logout,
    userProfile,
    getUserById,
    getAllUsers,
    updateUser,
    updateMyProfile,
    assignUserRole,
    getClients,
    getAllClients
} = require('../controllers/authController');
const { authUser } = require('../middlewares/authUser');
const { adminUser } = require('../middlewares/adminUser');

// Public Routes
router.post('/auth/login', login);
router.get('/auth/logout', logout);

// Login Routes
router.get('/user/profile', authUser, userProfile);
router.get('/user/:id', authUser, getUserById);
router.patch('/user/updateProfile', authUser, updateMyProfile);

// Protected Routes (Admin Only CRUD Operations)
router.post('/auth/register', adminUser, registerUser);
router.get('/auth/users', adminUser, getAllUsers);
router.patch('/auth/user/:id', authUser, updateUser);
router.patch('/auth/users/assignrole', adminUser, assignUserRole);

router.get('/clients', authUser, getClients);
router.get('/users/clients', authUser, getAllClients);


module.exports = router;
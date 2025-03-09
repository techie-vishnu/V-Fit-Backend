const express = require('express');
const router = express.Router();
const utils = require('../utils');
const { adminUser } = require('../middlewares/adminUser');
const { authUser } = require('../middlewares/authUser');
const { getMyMemberships, addMembership, updateMembership, deleteMembership, getMembershipById, getAllMemberships, addMembershipPlan, updateMembershipPlan, deleteMembershipPlan, getMembershipPlans } = require('../controllers/membershipController');

// User Routes
router.get('/my-memberships', authUser, getMyMemberships);
router.get('/memberships/:id', authUser, utils.validateId, getMembershipById);

router.get('/membership-plans', authUser, getMembershipPlans);
router.get('/membership-plans/:id', authUser, utils.validateId, getMembershipPlanById);


// Protected Routes (Admin Only CRUD Operations)
router.get('/memberships', adminUser, getAllMemberships);
router.put('/memberships', adminUser, addMembership);
router.patch('/memberships/:id', adminUser, utils.validateId, updateMembership);
router.delete('/memberships/:id', adminUser, utils.validateId, deleteMembership);

router.put('/membership-plans', adminUser, addMembershipPlan);
router.patch('/membership-plans/:id', adminUser, utils.validateId, updateMembershipPlan);
router.delete('/membership-plans/:id', adminUser, utils.validateId, deleteMembershipPlan);


module.exports = router;
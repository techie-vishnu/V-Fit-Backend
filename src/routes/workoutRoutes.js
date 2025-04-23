const express = require('express');
const router = express.Router();
const utils = require('../utils');
const { authUser } = require('../middlewares/authUser');
const { getWorkouts, getWorkoutsByCategory, getWorkoutsById, addWorkout, updateWorkout, deleteWorkout, assignWorkouts, getAssignedWorkouts, getMyAssignedWorkouts } = require('../controllers/workoutController');
const { adminUser } = require('../middlewares/adminUser');


router.get('/workouts', getWorkouts);
// router.get('/workouts/:category', getWorkoutsByCategory);
router.get('/workouts/:id', utils.validateId, getWorkoutsById);


// Protected Routes (Admin Only CRUD Operations)
router.put('/workouts', adminUser, addWorkout);
router.patch('/workouts/:id', adminUser, utils.validateId, updateWorkout);
router.delete('/workouts/:id', adminUser, utils.validateId, deleteWorkout);

// Assign Workout Routes
router.get('/getAssignedWorkouts', authUser, getAssignedWorkouts);
router.get('/getMyAssignedWorkouts', authUser, getMyAssignedWorkouts);

router.patch('/assignWorkouts', authUser, assignWorkouts);



module.exports = router;
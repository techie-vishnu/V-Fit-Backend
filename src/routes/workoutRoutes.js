const express = require('express');
const router = express.Router();
const { authUser } = require('../middlewares/authUser');
const { getWorkouts, getWorkoutsByCategory, getWorkoutsById, addWorkout, updateWorkout, deleteWorkout } = require('../controllers/workoutController');
const { adminUser } = require('../middlewares/adminUser');


router.get('/workouts', getWorkouts);
router.get('/workouts/:category', getWorkoutsByCategory);
router.get('/workouts/:id', getWorkoutsById);


// Protected Routes (Admin Only CRUD Operations)
router.put('/workouts', adminUser, addWorkout);
router.patch('/workouts/:id', adminUser, updateWorkout);
router.delete('/workouts/:id', adminUser, deleteWorkout);


module.exports = router;
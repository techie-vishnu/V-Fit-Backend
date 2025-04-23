const assignedWorkouts = require("../models/assignedWorkoutsModel");
const Exercise = require("../models/exersiceModel");
const User = require("../models/userModel");

exports.getWorkouts = async (req, res) => {
    try {

        // Pagination
        let { limit, page, q, sortBy, sortDir } = req.query;
        limit = parseInt(limit ?? 50);
        page = parseInt(page ?? 1);
        const offset = (page - 1) * limit;

        // User Search Query
        let query = {};
        if (q && q !== '') {
            query = {
                $or: [
                    { name: { $regex: q, $options: "i" } }
                ]
            }
        }

        // Column Sorting
        let sort = { updatedAt: -1 };
        if (sortBy && sortDir) {
            const dir = sortDir === 'desc' ? -1 : 1;
            switch (sortBy) {
                case '_id':
                    sort = { _id: dir }
                    break;
                case 'name':
                    sort = { name: dir }
                    break;
                case 'type':
                    sort = { type: dir }
                    break;
                case 'muscle':
                    sort = { muscle: dir }
                    break;
                case 'equipment':
                    sort = { equipment: dir }
                    break;
                case 'difficulty':
                    sort = { difficulty: dir }
                    break;
                case 'instructions':
                    sort = { instructions: dir }
                    break;
                default:
                    break;
            }
        }

        // Total Records for Pagination
        const total = await Exercise.countDocuments(query);

        const workouts = await Exercise.find(query)
            .sort(sort)
            .skip(offset)
            .limit(limit);

        return res.status(200).json({
            success: true,
            workouts,
            total
        });
    } catch (error) {
        next(error)
    }
}


exports.getWorkoutsByCategory = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            products: []
        });
    } catch (error) {
        next(error)
    }
}

exports.getWorkoutsById = async (req, res) => {
    try {
        const { id } = req.params;

        const workout = await Exercise.findById(id);
        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Workout not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: workout
        });
    } catch (error) {
        next(error)
    }
}

exports.addWorkout = async (req, res) => {
    try {
        const { name, type, muscle, equipment, difficulty, instructions } = req.body;

        if (!name || !type || !muscle || !difficulty) {
            return res.status(500).json({
                success: false,
                error: "Name, Type, Muscle Group & Difficulty is Required"
            });
        }

        const exersiceExists = await Exercise.findOne({ name, type, muscle, equipment, difficulty });
        if (exersiceExists) {
            return res.status(500).json({
                success: false,
                error: "Exercise already exists."
            });
        }

        const newExercise = new Exercise({ name, type, muscle, equipment, difficulty, instructions, createdBy: req.user._id, updatedBy: req.user._id });
        await newExercise.save();

        return res.status(201).json({
            success: true,
            message: "Workout added successfully."
        })
    } catch (error) {
        next(error)
    }
}


exports.updateWorkout = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, muscle, equipment, difficulty, instructions } = req.body;

        const workout = await Exercise.findById(id);
        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Workout not found.'
            });
        }

        if (name) {
            workout.name = name;
        }
        if (type) {
            workout.type = type;
        }
        if (muscle) {
            workout.muscle = muscle;
        }
        if (equipment) {
            workout.equipment = equipment;
        }
        if (difficulty) {
            workout.difficulty = difficulty;
        }
        if (instructions) {
            workout.instructions = instructions;
        }

        workout.updatedBy = req.user._id;
        await workout.save();

        res.status(200).json({
            success: true,
            message: "Workout updated"
        })
    } catch (error) {
        next(error)
    }
}

exports.deleteWorkout = (req, res, next) => {
    const { id } = req.params;

    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        data: []
    })
}

exports.getCategories = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: []
        });
    } catch (error) {
        next(error)
    }

}

exports.assignWorkouts = async (req, res, next) => {
    try {
        let { userId, date, activities, notes } = req.body;

        if (!userId) {
            userId = req.user._id;
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'userId is not valid.'
            });
        }

        if (!date) {
            date = new Date().toISOString().split('T')[0];
        } else {
            date = new Date(date).toISOString().split('T')[0];
        }

        if (!activities) {
            return res.status(404).json({
                success: false,
                error: 'Activities is required.'
            });
        }

        let assignWorkout = await assignedWorkouts.findOne({ user: userId, date: date });

        if (assignWorkout) {
            assignWorkout.activities = activities;
            assignWorkout.notes = notes;
            assignWorkout.updatedBy = req.user._id;
        } else {
            assignWorkout = new assignedWorkouts({ user: userId, date, activities, createdBy: req.user._id, updatedBy: req.user._id, notes })
        }

        await assignWorkout.save();

        res.status(200).json({
            success: true,
            message: 'Assigned workout saved'
        });
    } catch (error) {
        next(error)
    }

}

exports.getAssignedWorkouts = async (req, res, next) => {
    try {
        let { userId, date } = req.query;

        if (!userId) {
            userId = req.user._id;
        }
        if (!date) {
            date = new Date().toISOString().split('T')[0];
        } else {
            date = new Date(date).toISOString().split('T')[0];
        }
        const aWorkouts = await assignedWorkouts.findOne({ user: userId, date }).select(['-_id', '-activities._id']);
        if (!aWorkouts) {
            return res.status(200).json({
                success: false,
                error: 'Workouts not Assigned.'
            });
        }

        res.status(200).json({
            success: true,
            data: aWorkouts
        });
    } catch (error) {
        next(error)
    }
}

exports.getMyAssignedWorkouts = async (req, res, next) => {
    try {
        let { date } = req.query;

        if (!date) {
            date = new Date().toISOString().split('T')[0];
        } else {
            date = new Date(date).toISOString().split('T')[0];
        }
        const aWorkouts = await assignedWorkouts.findOne({ user: req.user._id, date })
            .populate({ path: 'activities.workout', model: 'Exercise', select: '-createdBy -updatedBy' })
            .select(['-_id', '-activities._id']);
        if (!aWorkouts) {
            return res.status(404).json({
                success: false,
                error: 'Workouts not Assigned.'
            });
        }

        res.status(200).json({
            success: true,
            data: aWorkouts
        });
    } catch (error) {
        next(error)
    }
}
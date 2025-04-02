const Exercise = require("../models/exersiceModel");

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

exports.deleteWorkout = (req, res) => {
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
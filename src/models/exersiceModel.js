const { default: mongoose, Schema } = require("mongoose");

const types = ['cardio', 'olympic_weightlifting', 'plyometrics', 'powerlifting', 'strength', 'stretching', 'strongman'];
const muscles = ['full_body', 'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest', 'forearms', 'glutes', 'hamstrings', 'lats', 'lower_back', 'middle_back', 'neck', 'quadriceps', 'traps', 'triceps'];
const difficulty = ['beginner', 'intermediate', 'expert'];

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: types,
        required: true
    },
    muscle: {
        type: String,
        enum: muscles,
        required: true
    },
    equipment: {
        type: String
    },
    difficulty: {
        type: String,
        enum: difficulty
    },
    instructions: {
        type: String
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
module.exports = Exercise;


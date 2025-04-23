const { default: mongoose, Schema } = require("mongoose");

const assignedWorkoutsSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date
    },
    activities: {
        type: [{ workout: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true }, set: { type: Number }, rep: { type: Number }, kg: { type: Number } }],
        required: true
    },
    notes: {
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

assignedWorkoutsSchema.index({ user: -1, date: -1 }, { unique: true });

const assignedWorkouts = mongoose.model('assignedWorkouts', assignedWorkoutsSchema);
module.exports = assignedWorkouts;


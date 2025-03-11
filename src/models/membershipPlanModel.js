const { default: mongoose, Schema } = require("mongoose");

const membershipPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    personalTraining: {
        type: Boolean,
        default: false
    },
    duration: {
        type: Number,
        required: true
    },
    durationUnit: {
        type: String,
        required: true,
        enum: ['Day', 'Days', 'Month', 'Months', 'Year'],
        default: 'Months'
    },
    status: {
        type: Boolean,
        default: true
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

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
module.exports = MembershipPlan;


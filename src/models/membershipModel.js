const { default: mongoose, Schema } = require("mongoose");

const membershipSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planId: {
        type: Schema.Types.ObjectId,
        ref: 'MembershipPlan',
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
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    paymentStatus: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["Pending", "Active", "Expired", "Canceled"],
        default: 'Pending'
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

const Membership = mongoose.model('Membership', membershipSchema);
module.exports = Membership;


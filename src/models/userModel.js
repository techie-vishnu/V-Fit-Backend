const { default: mongoose, Schema } = require("mongoose");
const validRoles = ['Admin', 'Client', 'Trainer', 'Receptionist'];


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true,
        RegExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    mobile: {
        type: Number,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    password: {
        type: String,
        required: true,
        min: 8
    },
    roles: {
        type: [String],
        default: ['Client'],
        enum: validRoles,
        validate: {
            validator: function (arr) {
                return arr.every(role => validRoles.includes(role));
            },
            message: props => `${props.value} contains invalid role`
        }
    },
    enabled: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    trainerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    }
}, {
    timestamps: true
});


const User = mongoose.model('User', userSchema);
module.exports = User;
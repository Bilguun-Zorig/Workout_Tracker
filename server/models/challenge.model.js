const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },

    type: {type: String, enum: ['run', 'steps', 'swim', 'cycle'], required: true},
    period: {type: String, enum: ['weekly', 'monthly'], required: true},

    target: {type: Number, required: true, min: 1},
    unit: {type: String, enum: ['miles', 'km', 'steps'], required: true},

    startDate: {type: Date, required: true, index: true},
    endDate: {type: Date, required: true, index: true},

    current: {type: Number, default: 0, min: 0},

    isCompleted: {type: Boolean, default: false},
    completedAt: {type: Date, default: null},

    celebrationShownAt: {type: Date, default: null},

    title: {type: String, default: ''}

}, {timestamps: true})

//Prevent duplicated 
ChallengeSchema.index({user: 1, type: 1, period: 1, startDate: 1}, {unique: true})

module.exports = mongoose.model('Challenge', ChallengeSchema)
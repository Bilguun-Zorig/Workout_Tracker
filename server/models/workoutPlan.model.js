const mongoose = require('mongoose');

const WorkoutPlanSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true},
    title: {type: String, required: true},
    instruction: {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},

    durationWeeks: Number,
    deloadWeeks: [Number], // deload week always the last week of workout plan eg if duration week is 4, deload week is the 4th week
    notes: String
}, {timestamps: true})


module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema)
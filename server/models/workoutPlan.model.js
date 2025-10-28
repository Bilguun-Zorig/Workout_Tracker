const mongoose = require('mongoose');

const WorkoutPlanSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true},
    title: {type: String, required: [true, 'Title is required']},
    instruction: {type: String, required: [true, 'Instruction is required']},
    startDate: {type: Date, required: [true, 'Start week is required']},
    endDate: {type: Date, required: true},

    durationWeeks: Number,
    deloadWeeks: [Number], // deload week always the last week of workout plan eg if duration week is 4, deload week is the 4th week
    notes: String,

    weeklyTemplates: [{
        weekday: {type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], required: true},
        exercises: [{
            label: {type: String, required: true},
            name: {type: String, required: true}
        }]
    }]
}, {timestamps: true})


module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema)
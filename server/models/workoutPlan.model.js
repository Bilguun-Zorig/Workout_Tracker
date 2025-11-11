const mongoose = require('mongoose');


const ExerciseSchema = new mongoose.Schema({
  label: { type: String, required: true },     // 'A', 'B', 'C', ...
  name:  { type: String, required: true },     // 'Front Squat'
  result: { type: String, default: '' },        // '3x5 @ 185', notes, etc.
  comment: {type: String, default: ''}        // 225 lbs new PR etc
}, { _id: false });

const WorkoutSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  date: { type: Date, required: true }, // stored as UTC midnight
  exercises: { type: [ExerciseSchema], default: [] },

}, { timestamps: true });

// One session per user per date
WorkoutSessionSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WorkoutSession', WorkoutSessionSchema);

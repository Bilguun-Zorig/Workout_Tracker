// const workoutPlan = require('../models/workoutPlan.model')
const dayjs = require('dayjs');
const WorkoutSession = require('../models/workoutPlan.model');

module.exports = {
  // Create or replace a session for a date
  create: async (req, res) => {
    try {
      const { date, exercises } = req.body;
      if (!date) return res.status(400).json({ message: 'date is required' });

      // Normalize to start-of-day UTC to avoid TZ duplicates
      const d = dayjs(date).startOf('day').toDate();

      const normalized = (exercises || []).map((x, i) => ({
        label: x.label || String.fromCharCode(65 + i),
        name: (x.name || '').trim(),
        result: (x.result || '').trim(),
      })).filter(x => x.name);

      const session = await WorkoutSession.findOneAndUpdate(
        { user: req.user._id, date: d },
        { $set: { exercises: normalized } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      res.status(201).json({ session });
    } catch (err) {
      console.error('Session upsert error:', err);
      res.status(400).json({ message: 'Validation failed', errors: err.errors || err });
    }
  },

  // Get session by date (optional helper)
  getByDate: async (req, res) => {
    try {
      const d = dayjs(req.query.date).startOf('day').toDate();
      const session = await WorkoutSession.findOne({ user: req.user._id, date: d });
      res.json({ session });
    } catch (err) {
      res.status(400).json({ message: 'Bad request', errors: err.errors || err });
    }
  }
};

const dayjs = require('../config/dayjsConfig')
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
        comment: (x.comment || '').trim(),
        videoUrl: (x.videoUrl || '').trim()
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
      return res.json({ session });
    } catch (err) {
      res.status(400).json({ message: 'Bad request', errors: err.errors || err });
    }
  },

  // Get all session 
  getAllSession: async (req, res) => {
    
    try{
      const allSessions = await WorkoutSession.find({user: req.user._id}).sort({date: 1}).lean(); //return plain objects
      console.log('ALL SESSION: ', allSessions)
      return res.json({allSessions})
    } catch (err) {
      res.status(400).json({ message: 'Bad request', errors: err.errors || err });
    }
  },
  
  //Get all sessions by weekly
  getSessionsByWeekly: async (req, res) => {
    try {
      const from = req.query.from ? dayjs(req.query.from) : dayjs().startOf('week');
      const to = req.query.to ? dayjs(req.query.to) : dayjs().endOf('week');

      if (!from?.isValid() || !to?.isValid()) {
        return res.status(400).json({message: 'Invalid from/to'});
      }

      const start = from.startOf('day').toDate();
      const end = to.startOf('day').toDate();

      const allSessions = await WorkoutSession.find({user: req.user._id, date: {$gte: start, $lt: end}}).sort({date: 1}).lean();

      return res.json({allSessions})

    } catch(err) {
      return res.status(400).json({message: 'Bad Request', errors: err.errors || err});
    }
  },

  addComment: async (req, res) => {
    try {
      const { date, label, comment } = req.body;
      if (!date || !label) return res.status(400).json({ message: 'Date and label is required'});

      const d = dayjs(date).startOf('day').toDate();

      const session = await WorkoutSession.findOneAndUpdate(
        {user: req.user._id, date: d, 'exercises.label': label},
        {$set: {'exercises.$.comment': (comment || '').trim()} },
        {new: true}
      )

      if (!session) return res.status(400).json({ message: 'Session not found'});

      return res.json({ session })
    } catch (err) {
      return res.status(400).json({message: 'Bad Request', errors: err.errors || err});
    } 
  },

  // Returns past session on the same weekday before "date"
  // If label is provided, returns only that exercise from each session
  getExerciseHistoryByWeekDay: async (req, res) => {
    try {
      const {date, label, limit} = req.query;
      if(!date) return res.status(400).json({ message: "date is required" });

      const target = dayjs(date);
      if(!target.isValid()) return res.status(400).json({ message: "Invalid date" }); 

      const targetIsoDow = target.isoWeekday(); // 1=Mon ... 7=Sun
      const beforeDate = target.startOf('day').toDate();
      const lim = Math.max(1, Math.min(parseInt(limit || '10', 10), 50));
      
      const pipeline = [
        {$match: {user: req.user._id, date: {$lt: beforeDate} }},
        {$addFields: { _isoDow: { $isoDayOfWeek: '$date' } } },
        {$match: { _isoDow: targetIsoDow } },
        {$sort: { date: -1 }},
        {$limit: lim}
      ];

      // if a label is provided, filter exercises down to just that one
      if(label) {
        pipeline.push(
          {
            $project: {date: 1, exercises: {$filter: {input: '$exercises', as: 'ex', cond: {$eq: ['$$ex.label', label]}}}}
          },
          {$match: {'exercises.0': {$exists: true}}}
        );
      } else {
        pipeline.push({ $project: {date: 1, exercises: 1 } });
      }

      const items = await WorkoutSession.aggregate(pipeline);
      return res.json({items})

    } catch (err) {
      return res.status(400).json({message: 'Bad Request', errors: err.errors || err});
    } 
  }


};

const dayjs = require('../config/dayjsConfig')
const WorkoutSession = require('../models/workoutPlan.model');

const User = require('../models/user.model')

module.exports = {
  // Create or replace a session for a date
  create: async (req, res) => {
    try {
      const { date, exercises } = req.body;
      if (!date) return res.status(400).json({ message: 'date is required' });

      // Normalize to start-of-day UTC to avoid TZ duplicates
      const d = dayjs(date).startOf('day').toDate();

      const existing = await WorkoutSession.findOne({user: req.user._id, date: d}).lean()

      const oldByLabel = new Map()
      if(existing && Array.isArray(existing.exercises)) {
        for (const ex of existing.exercises) {
          if(ex.label) {
            oldByLabel.set(ex.label, ex)
          }
        }
      }


      
      const normalized = (exercises || []).map((x, i) => {
        const label = x.label || String.fromCharCode(65 + i)
        const prev = oldByLabel.get(label) || {}

        //merge RPE (prefer new if provided, else keep old)
        const rawRpe = x.rpe !== undefined && x.rpe !== null && x.rpe !== '' ? x.rpe : prev.rpe

        let rpeVal = null
        if(rawRpe !== undefined && rawRpe !== null && rawRpe !== ''){
          const n = Number(rawRpe)
          rpeVal = Number.isNaN(n) ? null : n
        }

        return {
          label,
          name: (x.name || '').trim(),
          result: (x.result || '').trim(),
          comment: prev.comment ?? (x.comment || '').trim(),
          videoUrl: (x.videoUrl || '').trim(),
          rpe: rpeVal
        }

      }).filter(x => x.name)

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
      const { date, label, comment, rpe} = req.body;

      console.log('NANI!!! What IS WROOONG', req.body)

      if (!date || !label) return res.status(400).json({ message: 'Date and label is required'});

      const d = dayjs(date).startOf('day').toDate();

      const update = {}

      if (comment !== undefined) {
        update['exercises.$.comment'] = (comment || '').trim()
      }

      if (rpe !== undefined) {
        // clear RPE if empty
        const parsed = rpe === '' || rpe == null ? null : Number(rpe)

        if (parsed !== null && (isNaN(parsed) || parsed < 1 || parsed > 10)){
          return res.status(400).json({ message: 'RPE must be between 1 and 10'})
        }

        update['exercises.$.rpe'] = parsed
      }

      const session = await WorkoutSession.findOneAndUpdate(
        {user: req.user._id, date: d, 'exercises.label': label},
        {$set: update },
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
  },

  checkDeload: async (req, res) => {
    try {

      //! Test - overwrite today
      // const raw = req.query.testDate;
      // const today = raw ? dayjs(raw) : dayjs();

      const today = dayjs()
      const weekStart = today.startOf('week') //Monday
      // //? Load the user to read/update lastDeloadShownAt
      const user = await User.findById(req.user._id).select('lastDeloadShownAt');

      // if(!today.isValid()) {
      //   return res.status(400).json({message: 'Invalid testDate'})
      // }

      if(!user) {
        return res.status(404).json({message: 'User not found'})
      }
      //? Count how many previous weeks have at least one session
      let streakWeeks = 0

      for (let i = 1; i <= 3; i++) {
        const from = weekStart.subtract(i, 'week').startOf('week').toDate()
        const to = weekStart.subtract(i-1, 'week').startOf('week').toDate()

        const count = await WorkoutSession.countDocuments({
          user: req.user._id,
          date: { $gte: from, $lt: to}
        })

        if (count > 0) {
          streakWeeks += 1
        } else {
          break;
        }
      }

      const weekNumber = streakWeeks + 1;
      const coreShouldDeload = (streakWeeks === 3)

      if(!coreShouldDeload) {
        // not 4th week yet - no reminder
        return res.json({
          shouldDeload : false,
          weekNumber,
          reason: 'Less than 4-week streak'
        })
      }
      //? Prevent repeated reminders in the same week
      if(user.lastDeloadShownAt && dayjs(user.lastDeloadShownAt).isSame(today, 'week')) {
        return res.json({
          shouldDeload: false,
          weekNumber,
          reason: 'Deload reminder already shown this week'
        })
      }

      //? This is the first time this week to show reminder and remember it
      user.lastDeloadShownAt = today.toDate()
      await user.save()

      return res.json({
        shouldDeload: true,
        weekNumber,
        reason: '4-week streak and not yet shown for this week'
      })

    } catch (err) {
      console.log('checkDeload error', err)
      return res.status(400).json({message: 'Bad Request', errors: err.errors || err});
    }
  }


};

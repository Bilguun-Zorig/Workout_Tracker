const dayjs = require("../config/dayjsConfig");
const Challenge = require("../models/challenge.model");

const toNumOrNull = (v) => {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

function getWindow(period, date = dayjs()) {
    if(period === 'weekly'){
        const start = date.startOf('week')
        const end = start.add(1, 'week')

        return {startDate: start.startOf('day').toDate(), endDate: end.startOf('day').toDate()}
    }

        if(period === 'monthly'){
        const start = date.startOf('month')
        const end = start.add(1, 'month')

        return {startDate: start.startOf('day').toDate(), endDate: end.startOf('day').toDate()}
    }

    throw new Error('Invalid period')
}

module.exports = {
  //? Create challenges
  create: async (req, res) => {
    try {
        const {type, period, target, unit, title, start} = req.body;

        if(!type || !period || target== null || !unit) {
            return res.status(400).json({message: 'type, period, target, unit are required'})
        }

        const t = toNumOrNull(target)

        if(t == null || t <= 0) return res.status(400).json({message: 'target must be a positive number'})
        
        //Allow to create specific week/month by providing start date
        const baseDate = start ? dayjs(start) : dayjs()
        if(!baseDate.isValid()) return res.status(400).json({message: 'Invalid start date'})
        
        const {startDate, endDate} = getWindow(period, baseDate)

        const doc = await Challenge.create({
            user: req.user._id,
            type,
            period,
            target: t,
            unit,
            title: (title || '').trim(),
            startDate,
            endDate
        })

        return res.status(201).json({challenge: doc})
 
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(400).json({ message: 'A challenge of this type already exists for this period' });
      }
      return res.status(400).json({ message: 'Bad request', errors: err.errors || err });
    }
  },

  //? Get all challenges
  getChallenge: async (req, res) => {
    try{
        const now = new Date()
        const challenges = await Challenge.find({
            user: req.user._id,
            startDate: {$lte: now},
            endDate: {$gt: now},
        }).sort({createdAt: -1}).lean()

        return res.json({challenges})

    } catch (err) {
      return res.status(400).json({ message: 'Bad request', errors: err.errors || err });
    }
  },

  //? Track challenge progress
  logProgress: async (req, res) => {
    try {
        const {amount} = req.body
        const add = toNumOrNull(amount)

        if(add == null) return res.status(400).json({message: 'amount is required'})
        if(add <= 0) return res.status(400).json({message: 'amount must be > 0'})

        const c = await Challenge.findOne({_id: req.params.id, user: req.user._id})
        if(!c) return res.status(400).json({message: 'Challenge not found'})

        c.current = (c.current || 0) + add

        if(!c.isCompleted && c.current >= c.target) {
            c.isCompleted = true;
            c.completedAt = new Date()
        }

        await c.save()
        return res.json({challenge: c})

    } catch (err) {
      return res.status(400).json({ message: 'Bad request', errors: err.errors || err });
    }
  },

  // Complete the challenge
  markComplete: async (req, res) => {
    try {
        const c = await Challenge.findOne({_id: req.params.id, user: req.user._id})
        if(!c) return res.status(400).json({message: 'Challenge not found'})

        // By default: only allow complete the challenge if it met the target
        if(c.current < c.target) return res.status(400).json({message: 'Target not reached yet.'})

        if(!c.isCompleted){
            c.isCompleted = true
            c.completedAt = new Date()
            await c.save()
        }

        return res.json({challenge: c})

    } catch (err) {
      return res.status(400).json({ message: 'Bad request', errors: err.errors || err });
    }
  },

  //Celebration shown
  markCelebrationShown: async(req, res) => {
    try {
        const c = await Challenge.findOneAndUpdate(
            {_id: req.params.id, user: req.user._id},
            {$set: {celebrationShownAt: new Date()}},
            {new: target}
        )
        if(!c) return res.status(400).json({message: 'Challenge not found'})
        
        return res.json({challenge: c})
        
    } catch (err) {
      return res.status(400).json({ message: 'Bad request', errors: err.errors || err });
    }
  }

};

const workoutPlan = require('../models/workoutPlan.model')
const dayjs = require('dayjs')
const isoWeek = require('dayjs/plugin/isoWeek');        // ISO week numbering
const updateLocale = require('dayjs/plugin/updateLocale'); // to set weekStart
const utc = require('dayjs/plugin/utc');                // optional but handy

dayjs.extend(isoWeek)
dayjs.extend(updateLocale)
dayjs.extend(utc)

dayjs.updateLocale('en', {weekStart: 1}); // 1==monday

// module.exports = {
//     //? Create
//     create: async (req, res) => {
//         try {

//             //Take user from token only
//             const payload = {
//                 ...req.body,
//                 user: req.user._id
//             };
//             //Normalize deloadWeeks
//             if(typeof payload.deloadWeeks === 'number'){
//                 payload.deloadWeeks = [payload.deloadWeeks];
//             }

//             const plan = await workoutPlan.create(payload)
//             res.status(201).json({plan})
//         } catch (err) {
//             console.log('CREATE WORKOUT PLAN ERROR <>', err)
//             res.status(400).json({
//                 message: 'Validation failed', 
//                 errors: err.errors || err});
//         }
//     }


// }


module.exports = {
  create: async (req, res) => {
    try {
      const {
        title,
        instruction,
        startDate,        // ISO string or date-like
        durationWeeks,    // number (e.g., 4, 8)
        deloadWeeks,      // optional: number or [numbers]
        notes
      } = req.body;

      if (!title || !instruction) {
        return res.status(400).json({ message: 'title and instruction are required' });
      }
      if (!startDate || !durationWeeks) {
        return res.status(400).json({ message: 'startDate and durationWeeks are required' });
      }

      const start = dayjs(startDate);
      if (!start.isValid()) {
        return res.status(400).json({ message: 'Invalid startDate' });
      }

      const weeks = Number(durationWeeks);
      if (!Number.isInteger(weeks) || weeks <= 0) {
        return res.status(400).json({ message: 'durationWeeks must be a positive integer' });
      }

      // Snap to week boundaries (Monday -> Sunday)
      const startOfPlan = start.startOf('week');                 // Monday 00:00:00.000
      const endOfPlan   = startOfPlan.add(weeks, 'week').endOf('week'); // Sunday 23:59:59.999 of final week

      // Normalize deloadWeeks:
      let deload = deloadWeeks;
      if (typeof deload === 'number') deload = [deload];
      if (!Array.isArray(deload) || deload.length === 0) {
        deload = [weeks]; // default: last week is deload
      }
      // keep only valid week indices (1..weeks)
      deload = deload
        .map(Number)
        .filter((w) => Number.isInteger(w) && w >= 1 && w <= weeks);

      const plan = await workoutPlan.create({
        user: req.user._id,            // make sure this route is behind your verifyJWT
        title,
        instruction,
        startDate: startOfPlan.toDate(),
        endDate: endOfPlan.toDate(),
        durationWeeks: weeks,
        deloadWeeks: deload,
        notes
      });

      return res.status(201).json({ plan });
    } catch (err) {
      console.error('Create plan error:', err);
      return res.status(400).json({
        message: 'Validation failed',
        errors: err.errors || err
      });
    }
  },
};
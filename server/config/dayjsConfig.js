const dayjs = require('dayjs')
const updateLocale = require('dayjs/plugin/updateLocale')
const isoWeek = require('dayjs/plugin/isoWeek')

dayjs.extend(updateLocale)
dayjs.extend(isoWeek)

dayjs.updateLocale('en', {weekStart: 1}) // Monday as first day of week

module.exports = dayjs;
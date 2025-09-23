const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/workoutt_db', {
    // useNewUrlParser: true,
    // useUnifiedTopology: true 
    /*
    Starting with the MongoDB Node.js Driver v4.0+ (and therefore Mongoose 6+), the options useNewUrlParser and useUnifiedTopology are no longer needed — they’re on by default.
     */
})
.then(()=> console.log("Established a connection to the database"))
.catch(err => console.log("Something went wrong when connecting to the database", err))
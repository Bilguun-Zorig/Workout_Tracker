const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const port = 8000;

require('dotenv').config();
require('./config/mongoose.config');

app.use(cookieParser());
//CORS controls "who can talk to API"
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));



app.use(express.json(), express.urlencoded({ extended: true }));

//? new style - router-based mounting
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/workout-plan', require('./routes/workoutPlan.routes'));


// require('./routes/user.routes')(app);

app.listen(port, () => console.log(`Listening on port: ${port}`));
const express = require('express');
const cors = require('cors')
const app = express();
const port = 8000;

app.use(cors())
require('./routes/user.routes')(app);

app.listen(port, () => console.log(`Listening on port: ${port}`));
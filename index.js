let app = require('./app.js');

let cors = require('cors');
let express = require('express');

let server = express();

let port = process.env.PORT || 3000;


server.use(cors());

server.use('/', app)

server.listen(port, (error) => {
  if (!error) {
    console.log(`App listening on port ${port}`);
    console.log(`Go to url: http://127.0.0.1:${port}\n`);
  } else {
    console.log(`Server can't start.\n${error}`);
  }
});

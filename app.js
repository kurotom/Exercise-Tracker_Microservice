let express = require("express");
let app = express();

let bodyParser = require("body-parser");
let mongoose = require('mongoose');

require('dotenv').config();

const dns = require('dns');

// Import Model
let urlModel = require('./db_Model/url_model.js');


// MongoDB

const settingsConnection = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.DBNAME
}

mongoose.connect(
    process.env.URI_MONGO,
    settingsConnection
  )
  .then((response) => {
    // console.log(response.connections[0].name)
    console.log("Connected!");
  })
  .catch((error) => {
    console.log(error);
  });
//


app.use(bodyParser.urlencoded({extended: false}));


app.get('/', (req, res) => {
  let absPath = __dirname + '/views/index.html';
  res.sendFile(absPath);
});





app.use('/assets', express.static(__dirname + '/public'));

module.exports = app;

let express = require("express");
let app = express();

let bodyParser = require("body-parser");
let mongoose = require('mongoose');

require('dotenv').config();

// const dns = require('dns');

// Import Model
const { UserModel, ExersiceModel } = require('./db_Model/project_models.js');


////////////////////////////////////////////
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
////////////////////////////////////////////



app.get('/', (req, res) => {
  let absPath = __dirname + '/views/index.html';
  res.sendFile(absPath);
});


// let id = new mongoose.Types.ObjectId()
// console.log(id.toString())
app.use(bodyParser.urlencoded({extended: false}));
//

//
//
// API USERS
app.get('/api/users', (req, res) => {
  UserModel.find()
    .then((response) => {
      let arrayUsers = response.map(item => {
        return {
          _id: item._id.toString(),
          username: item.name
        }
      })
      res.json(arrayUsers);
    })
    .catch((error) => {
      console.log(error);
      res.json({error: 'Server Internal Error - user'})
    })
})

app.post('/api/users', (req, res) => {
  const nameUser = req.body.username;
  if (nameUser === '') {
    res.json({error: 'need username'})
  } else {
    UserModel.find({name: nameUser})
      .then((response) => {

        if (response.length > 0) {
          res.json({
            username: response[0].name,
            _id: response[0]._id.toString(),
          });

        } else if (response.length === 0) {
          const userCreate = new UserModel({name: nameUser});
          userCreate.save()
            .then((result) => {
              res.json({
                username: result.name,
                _id: result._id.toString(),
              });
            })
            .catch((error) => {
              // console.log('Error Server -->', error);
              res.json({error: 'Server Error'});
            });
        };
      })
      .catch((error) => {
        // console.log(error);
        res.json({error: 'Server Error'});
      });
  }
});

//
//
// API EXERSICES
app.post('/api/users/:_id/exercises', async (req, res) => {
  console.log('api excersices', req.params)

  if (
    req.body.description === '' || req.body.duration === ''
  ) {
    res.json({error: 'description and duration are required!'})
  } else {
    try {
      const userId = req.params._id;
      const description = req.body.description;
      const duration = req.body.duration;
      let fecha;
      if (req.body.date !== undefined && req.body.date !== '') {
        fecha = new Date(req.body.date).toDateString();
      } else {
        fecha = new Date().toDateString();
      }

      const user = await UserModel.findById(userId);

      const excersice = new ExersiceModel({
        username: user.name,
        userid: user._id,
        description: description,
        duration: Number(duration),
        date: fecha
      })
      await excersice.save()

      res.json({
        username: excersice.username,
        description: excersice.description,
        duration: excersice.duration,
        date: fecha,
        _id: userId
      })
    } catch (error) {
      res.json({error: error.message});
    }
  };
});


app.get('/api/users/:_id/logs', async (req, res) => {
  console.log('qurey LOGS aprams', req.params, req.query);
  const id = req.params._id;

  const limitResult = Number(req.query.limit) || 0;
  const from = req.query.from || new Date(0);
  const to = req.query.to || new Date(Date.now());

  console.log(from, to, limitResult)


  const exercise = await ExersiceModel.find({userid: id})
    .find({date: {$gte: from, $lte: to}})
    .limit(limitResult)

  UserModel.findById({_id: id})
    .then((user) => {
      let logData = [];
      logData = exercise.map(item => {
        return {
          description: item.description,
          duration: item.duration,
          date: item.date.toDateString()
        }
      });

      res.json({
          username: user.name,
          count: logData.length,
          _id: user._id,
          log: logData
        })
      })
      .catch((error) => {
        console.log(`${user.name, user._id.toString()}---`, error)
      });
});


app.use('/assets', express.static(__dirname + '/public'));

module.exports = app;

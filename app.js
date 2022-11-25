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
});

//
//
// API EXERSICES
app.post('/api/users/:_id/exercises', (req, res) => {
  // let id = new mongoose.Types.ObjectId()
  // console.log(id.toString())
  const userId = req.body.userID;
  const description = req.body.description;
  const duration = req.body.duration;
  let date = '';
  if (req.body.date === '' || req.body.date === '') {
    let fecha = new Date();
    date = `${fecha.getFullYear()}-${fecha.getMonth() < 10? '0' + fecha.getMonth() + 1: fecha.getMonth()}-${fecha.getDate() < 10? '0' + fecha.getDate() + 1: fecha.getDate()}`
  } else {
    date = req.body.date;
  }

  UserModel.find({_id: userId})
    .then((userMatch) => {
      const excerUser = new ExersiceModel({
        username: userMatch[0].name,
        userid: userId,
        description: description,
        duration: parseInt(duration),
        date: date
      })
      excerUser.save()
        .then((responseSave) => {
          console.log('save');
          let dateEx = responseSave.date.toUTCString().split(' ');
          res.json({
            username: responseSave.username,
            description: responseSave.description,
            duration: responseSave.duration,
            date: `${dateEx[0].split(",")[0]} ${dateEx[2]} ${dateEx[1]} ${dateEx[3]}`,
            _id: responseSave._id.toString(),
          });
        })
        .catch((error) => {
          // console.log(error);
          res.json({error: 'Save Error'});
        });
    })
    .catch((error) => {
      // console.log(error);
      res.json({error: 'Save Error - Query'});
    });
});


app.get('/api/users/:_id/logs', (req, res) => {
  console.log(req.params, req.query);
  const id = req.params._id;

  if (Object.keys(req.query).length > 0) {

    const from = req.query.from;
    const to = req.query.to;

    let limitResult;
    if (req.query.limit !== undefined && req.query.limit !== '') {
      limitResult = parseInt(req.query.limit);
    } else {
      limitResult = 0
    };
    console.log(from, to, limitResult);

    UserModel.find({_id: id})
      .then((userMatch) => {
        if (
          from !== undefined &&
          from !== '' &&
          to === undefined ||
          to === ''
        ) {
          console.log('---_>   ACA')
          const fromTime = new Date(from);
          ExersiceModel.find({userid: id})
            .find({date: {$gte: fromTime}})
            .limit(limitResult)
            .exec()
            .then((exersiceUser) => {
              console.log(exersiceUser)
              let fromFormat = fromTime.toUTCString().split(' ');
              let resExercise = exersiceUser.map(item => {
                let dateEx = item.date.toUTCString().split(' ');
                let result = {
                  description: item.description,
                  duration: item.duration,
                  date: `${dateEx[0].split(",")[0]} ${dateEx[2]} ${dateEx[1]} ${dateEx[3]}`
                }
                return result;
              });
              console.log(resExercise)
              res.json({
                username: userMatch[0].name,
                count: resExercise.length,
                _id: id,
                from: `${fromFormat[0].split(",")[0]} ${fromFormat[2]} ${fromFormat[1]} ${fromFormat[3]}`,
                log: resExercise
              })
            })
            .catch((err) => {
              console.log(err);
              res.json({error: 'From time data'})
            })
        };
        if (
          from !== undefined &&
          from !== '' &&
          to !== undefined &&
          to !== ''
        ) {
          console.log('---_>   OTOR')
          const fromTime = new Date(from);
          const toTime = new Date(to);
          ExersiceModel.find({userid: id})
            .find({date: {$gte: fromTime, $lte: toTime}})
            .limit(limitResult)
            .exec()
              .then((exersiceUser) => {
                console.log(exersiceUser)

                let fromFormat = fromTime.toUTCString().split(' ');
                let toFormat = toTime.toUTCString().split(' ');

                let resExercise = exersiceUser.map(item => {
                  let dateEx = item.date.toUTCString().split(' ');
                  let result = {
                    description: item.description,
                    duration: item.duration,
                    date: `${dateEx[0].split(",")[0]} ${dateEx[2]} ${dateEx[1]} ${dateEx[3]}`
                  }
                  return result;
                })
                res.json({
                  _id: id,
                  username: userMatch[0].name,
                  from: `${fromFormat[0].split(",")[0]} ${fromFormat[2]} ${fromFormat[1]} ${fromFormat[3]}`,
                  to: `${toFormat[0].split(",")[0]} ${toFormat[2]} ${toFormat[1]} ${toFormat[3]}`,
                  count: resExercise.length,
                  log: resExercise
                })

              })
              .catch((err) => {
                console.log(err);
                res.json({error: 'From To error data'})
              })
        };

      })
      .catch((error) => {
        res.json({error: 'Save Error - Query'});
      });

  } else {
    console.log('---> SIN parametros')
    UserModel.find({_id: id})
      .then((userMatch) => {
        ExersiceModel.find({userid: id})
          .then((exersiceUser) => {

            let resExercise = exersiceUser.map(item => {
              let dateEx = item.date.toUTCString().split(' ');
              let result = {
                description: item.description,
                duration: item.duration,
                date: `${dateEx[0].split(",")[0]} ${dateEx[2]} ${dateEx[1]} ${dateEx[3]}`
              }
              return result;
            })
            res.json({
              username: userMatch[0].name,
              count: resExercise.length,
              _id: id,
              log: resExercise
            })
          })
          .catch((error) => {
            res.json({error: 'Save Error - Query'});
          })
      })
      .catch((error) => {
        res.json({error: 'Query Error - no parameters'});
      });
  }
});


app.use('/assets', express.static(__dirname + '/public'));

module.exports = app;

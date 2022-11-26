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

          res.json({
            username: responseSave.username,
            description: responseSave.description,
            duration: responseSave.duration,
            date: responseSave.date.toDateString(),
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
  console.log('qurey LOGS aprams', req.params, req.query);
  const id = req.params._id;

  let limitResult;
  if (req.query.limit !== undefined && req.query.limit !== '') {
    limitResult = parseInt(req.query.limit);
  } else {
    limitResult = 0
  };

  if (req.query.from !== undefined && req.query.from !== '') {
    if (req.query.to !== undefined && req.query.to !== '') {
      console.log("----P   FROM TO")
      const from = new Date(req.query.from);
      const to = new Date(req.query.to);
      UserModel.findById(id)
        .exec()
        .then((dataUSer) => {
          ExersiceModel.find({userid: dataUSer._id})
            .find({date: {$gte: from, $lte: to}})
            .limit(limitResult)
            .exec()
            .then((exersiceUser) => {
              console.log("----", exersiceUser)
              let logData = [];
              if (exersiceUser.length > 0) {
                logData = exersiceUser.map(item => {
                  let result = {
                    description: item.description,
                    duration: item.duration,
                    date: item.date.toDateString()
                  }
                  return result;
                });
              };

              res.json({
                username: dataUSer.name,
                count: exersiceUser.length,
                _id: dataUSer._id.toString(),
                log: logData
              })

            })
            .catch((error) => {
              console.log(error)
            })

        })
        .catch((error) => {
          console.log(error)
        })
    } else {
      console.log("----P   FROM ")
      const from = new Date(req.query.from);
      UserModel.findById(id)
        .limit(limitResult)
        .exec()
        .then((dataUSer) => {
          console.log(dataUSer)
          ExersiceModel.find({userid: dataUSer._id.toString()})
            .find({date: {$gte: from}})
            .exec()
            .then((exersiceUser) => {
              console.log("----", exersiceUser)
              let logData = [];
              if (exersiceUser.length > 0) {
                logData = exersiceUser.map(item => {
                  let result = {
                    description: item.description,
                    duration: item.duration,
                    date: item.date.toDateString()
                  }
                  return result;
                });
              };
              res.json({
                username: dataUSer.name,
                count: exersiceUser.length,
                _id: dataUSer._id.toString(),
                log: logData
              })

            })
            .catch((error) => {
              console.log(error)
            })

        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
  else {
    console.log('--- >   sin parametros')
    UserModel.findById(id)
      .limit(limitResult)
      .exec()
      .then((dataUSer) => {
        console.log(dataUSer)
        ExersiceModel.find({userid: dataUSer._id.toString()})
          .exec()
          .then((exersiceUser) => {
            console.log("----", exersiceUser)
            let logData = [];
            if (exersiceUser.length > 0) {
              logData = exersiceUser.map(item => {
                let result = {
                  description: item.description,
                  duration: item.duration,
                  date: item.date.toDateString()
                }
                return result;
              });
            };
            res.json({
              username: dataUSer.name,
              count: exersiceUser.length,
              _id: dataUSer._id.toString(),
              log: logData
            })

          })
          .catch((error) => {
            console.log(error)
          })

      })
      .catch((error) => {
        console.log(error)
      })
  }



  // if (Object.keys(req.query).length > 0) {
  //
  //   const from = req.query.from;
  //   const to = req.query.to;
  //
  //   console.log(from, to, limitResult, mongoose.Types.ObjectId(id));
  //
  //   UserModel.find({_id: id})
  //     .then((userMatch) => {
  //       console.log(userMatch)
  //       console.log('log - parameters ---> ', userMatch)
  //
  //       if (
  //         from !== undefined &&
  //         from !== '' &&
  //         to === undefined ||
  //         to === ''
  //       ) {
  //         console.log('---_>   ACA')
  //         const fromTime = new Date(from);
  //         ExersiceModel.find({userid: mongoose.Types.ObjectId(id)})
  //           .find({date: {$gte: fromTime}})
  //           .limit(limitResult)
  //           .exec()
  //           .then((exersiceUser) => {
  //             // console.log(exersiceUser)
  //
  //             if (exersiceUser.length > 0) {
  //               let fromFormat = fromTime.toUTCString().split(' ');
  //               let resExercise = exersiceUser.map(item => {
  //                 let dateEx = item.date.toUTCString().split(' ');
  //                 let result = {
  //                   description: item.description,
  //                   duration: item.duration,
  //                   date: item.date.toDateString()
  //                 }
  //                 return result;
  //               });
  //               console.log(resExercise)
  //               res.json({
  //                 username: exersiceUser[0].username,
  //                 count: resExercise.length,
  //                 _id: exersiceUser[0].userid.toString(),
  //                 from: fromTime.toDateString(),
  //                 log: resExercise
  //               })
  //             }
  //
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             res.json({error: 'From time data'})
  //           })
  //       };
  //       if (
  //         from !== undefined &&
  //         from !== '' &&
  //         to !== undefined &&
  //         to !== ''
  //       ) {
  //         console.log('---_>   OTOR', userMatch)
  //         const fromTime = new Date(from);
  //         const toTime = new Date(to);
  //         ExersiceModel.find({userid: mongoose.Types.ObjectId(id)})
  //           .find({date: {$gte: fromTime, $lte: toTime}})
  //           .limit(limitResult)
  //           .exec()
  //           .then((exersiceUser) => {
  //             console.log('-X', userMatch)
  //
  //             if (exersiceUser.length > 0) {
  //               let resExercise = exersiceUser.map(item => {
  //                 let dateEx = item.date.toUTCString().split(' ');
  //                 let result = {
  //                   description: item.description,
  //                   duration: item.duration,
  //                   date: item.date.toDateString()
  //                 }
  //                 return result;
  //               })
  //               res.json({
  //                 _id: exersiceUser[0].userid.toString(),
  //                 username: exersiceUser[0].username,
  //                 from: fromTime.toDateString(),
  //                 to: toTime.toDateString(),
  //                 count: resExercise.length,
  //                 log: resExercise
  //               })
  //             }
  //             // else {
  //             //   console.log('ñ', userMatch)
  //             //   res.json({
  //             //     // _id: userMatch[0]._id.toString(),
  //             //     // username: userMatch[0].username,
  //             //     from: fromTime.toDateString(),
  //             //     to: toTime.toDateString(),
  //             //     count: 0,
  //             //     log: []
  //             //   })
  //             // }
  //
  //
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             res.json({error: 'From To error data'})
  //           })
  //       };
  //
  //     })
  //     .catch((error) => {
  //       res.json({error: 'Save Error - Query'});
  //     });
  //
  // } else {
  //   console.log('---> SIN parametros')
  //   UserModel.find({_id: id})
  //     .then((userMatch) => {
  //       ExersiceModel.find({userid: id})
  //         .then((exersiceUser) => {
  //
  //           let resExercise = exersiceUser.map(item => {
  //             let dateEx = item.date.toUTCString().split(' ');
  //             let result = {
  //               description: item.description,
  //               duration: item.duration,
  //               date: item.date.toDateString()
  //             }
  //             return result;
  //           })
  //           res.json({
  //             username: exersiceUser[0].username,
  //             count: resExercise.length,
  //             _id: exersiceUser[0].userid.toString(),
  //             log: resExercise
  //           })
  //         })
  //         .catch((error) => {
  //           res.json({error: 'Save Error - Query'});
  //         })
  //     })
  //     .catch((error) => {
  //       res.json({error: 'Query Error - no parameters'});
  //     });
  // }

});


app.use('/assets', express.static(__dirname + '/public'));

module.exports = app;
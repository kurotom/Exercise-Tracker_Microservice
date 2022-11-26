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
        })
        .catch((error) => {
          // console.log(error);
          res.json({error: 'Save Error'});
        });

      res.json({
        username: userMatch[0].name,
        _id: userId,
        description: description,
        duration: parseInt(duration),
        date: new Date(date).toDateString()
      })
    })
    .catch((error) => {
      // console.log(error);
      res.json({error: 'Save Error - Query'});
    });
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






  // if (req.query.from !== undefined && req.query.from !== '') {
  //   if (req.query.to !== undefined && req.query.to !== '') {
  //     console.log("----P   FROM TO")
  //     const from = new Date(req.query.from);
  //     const to = new Date(req.query.to);
  //     ExersiceModel.find({userid: id})
  //       .find({date: {$gte: from, $lte: to}})
  //       .limit(limitResult)
  //       .exec()
  //       .then((exersiceResponse) => {
  //         // console.log("----", exersiceUser)
  //         UserModel.findById(id)
  //           .exec()
  //           .then((dataUSer) => {
  //             let logData = [];
  //             if (exersiceResponse.length > 0) {
  //               logData = exersiceResponse.map(item => {
  //                 let result = {
  //                   description: item.description,
  //                   duration: item.duration,
  //                   date: item.date.toDateString()
  //                 }
  //                 return result;
  //               });
  //             };
  //             try {
  //               res.json({
  //                 username: exersiceResponse[0].username,
  //                 count: exersiceResponse.length,
  //                 _id: exersiceResponse[0].userid.toString(),
  //                 log: logData
  //               })
  //             } catch (error) {
  //               res.json({
  //                 username: dataUSer.name,
  //                 count: exersiceResponse.length,
  //                 _id: dataUSer._id.toString(),
  //                 log: logData
  //               })
  //             }
  //           })
  //           .catch((error) => {
  //             console.log('--- EXERSICE - USER TO', error)
  //           });
  //       })
  //       .catch((error) => {
  //         console.log('--- EXERSICE TO', error)
  //       });
  //
  //   } else {
  //     console.log("----P   FROM ")
  //     const from = new Date(req.query.from);
  //     ExersiceModel.find({userid: id})
  //       .find({date: {$gte: from}})
  //       .limit(limitResult)
  //       .exec()
  //       .then((exersiceResponse) => {
  //         UserModel.findById(id)
  //           .exec()
  //           .then((dataUSer) => {
  //             console.log(dataUSer)
  //             let logData = [];
  //             if (exersiceResponse.length > 0) {
  //               logData = exersiceResponse.map(item => {
  //                 let result = {
  //                   description: item.description,
  //                   duration: item.duration,
  //                   date: item.date.toDateString()
  //                 }
  //                 return result;
  //               });
  //             };
  //             try {
  //               res.json({
  //                 username: dataUSer.name,
  //                 count: logData.length,
  //                 _id: dataUSer._id.toString(),
  //                 log: logData
  //               })
  //             } catch (error) {
  //               res.json({
  //                 username: dataUSer.name,
  //                 count: exersiceResponse.length,
  //                 _id: dataUSer._id.toString(),
  //                 log: logData
  //               })
  //             }
  //
  //           })
  //           .catch((error) => {
  //             console.log('--- EXERSICE - USER FROM TO', error)
  //           })
  //       })
  //       .catch((error) => {
  //         console.log('--- EXERSICE FROM TO', error)
  //       })
  //   }
  // }
  // else {
  //   console.log('--- >   sin parametros')
  //   ExersiceModel.find({userid: id})
  //     .limit(limitResult)
  //     .exec()
  //     .then((exersiceResponse) => {
  //       let logData = [];
  //       if (exersiceResponse.length > 0) {
  //         logData = exersiceResponse.map(item => {
  //           let result = {
  //             description: item.description,
  //             duration: item.duration,
  //             date: item.date.toDateString()
  //           }
  //           return result;
  //         });
  //       };
  //
  //       UserModel.findById(id)
  //         .exec()
  //         .then((dataUSer) => {
  //           console.log(exersiceResponse[0])
  //           try {
  //             res.json({
  //               username: exersiceResponse[0].username,
  //               count: exersiceResponse.length,
  //               _id: exersiceResponse[0].userid.toString(),
  //               log: logData
  //             })
  //           } catch (error) {
  //             res.json({
  //               username: dataUSer.name,
  //               count: exersiceResponse.length,
  //               _id: dataUSer._id.toString(),
  //               log: logData
  //             })
  //           }
  //
  //
  //         })
  //
  //     })
  //     .catch((error) => {
  //       res.json({error: 'Server Error - (query no parameters)'})
  //     })
  //
  // }



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

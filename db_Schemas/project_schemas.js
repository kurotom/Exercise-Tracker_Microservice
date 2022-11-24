// Create and Export Schema
let mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  name: String,
},
{
  collection: process.env.USERSCHEMA
}
);

const ExerciseSchema = mongoose.Schema({
  username: String,
  userid: mongoose.ObjectId,
  description: String,
  duration: Number,
  date: Date
},
{
  collection: process.env.EXERCISESCHEMA
}
);

module.exports = { UserSchema, ExerciseSchema };

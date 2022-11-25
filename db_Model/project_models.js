// Create and Export Model from Schema

let { UserSchema, ExerciseSchema } = require('../db_Schemas/project_schemas.js');

let mongoose = require('mongoose');


const UserModel = mongoose.model('User', UserSchema)
const ExersiceModel = mongoose.model('Exersice', ExerciseSchema);

module.exports = { UserModel, ExersiceModel };

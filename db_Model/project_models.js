// Create and Export Model from Schema

let { UserSchema, ExerciseSchema } = require('../db_Schemas/project_schemas.js');

let mongoose = require('mongoose');


const UserModel = mongoose.model('Users', UserSchema)
const ExersiceModel = mongoose.model('Exersices', ExerciseSchema);

module.exports = { UserModel, ExersiceModel };

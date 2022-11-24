// Create and Export Model from Schema

let schemaURL = require('../db_Schema/url_schema.js');

let mongoose = require('mongoose');

const urlModel = mongoose.model('Url', schemaURL);

module.exports = urlModel;

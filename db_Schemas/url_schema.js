// Create and Export Schema
let mongoose = require('mongoose');

const schemaURL = mongoose.Schema({
  original_url: String,
  short_url: Number
},
{
  collection: process.env.COLLECTION
}
);

module.exports = schemaURL;

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const prodSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  article: {
    type: String,
    required: true,
    unique: true
  },
  desc: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imgName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
})

module.exports = mongoose.model('products', prodSchema)
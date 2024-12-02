const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const biasSchema = new Schema({
  headline: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  label: {
    type: String,
    required: true
  },
  relatedCountries: {
    type: [String],
    required: true
  },
  biases: {
    type: [{
      left: {
        type: Number,
        required: true
      },
      neutral: {
        type: Number,
        required: true
      },
      right: {
        type: Number,
        required: true
      }
    }],
    required: true
  }
});

const Bias = mongoose.model('Bias', biasSchema);

module.exports = Bias;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TrendSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  trends: {
    type: [{
      rank: {
        type: Number,
        required: true,
      },
      trendName: {
        type: String,
        required: true,
        trim: true, 
      },
    }],
    required: true,
  },
});

const TwitterTrends = mongoose.model('TwitterTrends', TrendSchema);

module.exports = TwitterTrends;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TopicSchema = new Schema({
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

const Topic = mongoose.model('Topic', TopicSchema);

module.exports = Topic;

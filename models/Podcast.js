const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PodcastSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  pubDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  enclosureUrl: {
    type: String,
    required: true
  }
});

const Podcast = mongoose.model('Podcast', PodcastSchema);

module.exports = Podcast;

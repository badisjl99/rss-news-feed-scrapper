const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  articleImage: {
    type: String,

  },
  headline: {
    type: String,

  },
  description: {
    type: String,

  },
  date: {
    type: Date,

  },
  category: {
    type: String,

  },
  articleUrl: {
    type: String,

  },
  source: {
    type: String,

  },
  keywords: {
    type: String,

  },
  label: {
    type: String,

  },
  bias: {
    type: String,

  },
  relatedCountry: {
    type: String,

  }
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;

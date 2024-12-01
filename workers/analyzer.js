const vader = require('vader-sentiment');
const nlp = require('compromise');

const rssUrls = [
  "https://feeds.bbci.co.uk/news/world/africa/rss.xml",
  "http://feeds.bbci.co.uk/news/world/asia/rss.xml",
  "http://feeds.bbci.co.uk/news/world/europe/rss.xml",
  "http://feeds.bbci.co.uk/news/world/latin_america/rss.xml",
  "http://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
  "http://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
  "https://feeds.bbci.co.uk/news/business/rss.xml",
  "https://feeds.bbci.co.uk/news/politics/rss.xml",
  "https://feeds.bbci.co.uk/news/health/rss.xml",
  "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  "https://feeds.bbci.co.uk/news/education/rss.xml",
  "https://feeds.bbci.co.uk/news/technology/rss.xml",
  "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml"
];

function getCategoryFromUrl(url) {
  if (url.includes("africa")) return "Africa";
  if (url.includes("asia")) return "Asia";
  if (url.includes("europe")) return "Europe";
  if (url.includes("latin_america")) return "Latin America";
  if (url.includes("middle_east")) return "Middle East";
  if (url.includes("us_and_canada")) return "US & Canada";
  if (url.includes("business")) return "Business";
  if (url.includes("politics")) return "Politics";
  if (url.includes("health")) return "Health";
  if (url.includes("science_and_environment")) return "Science & Environment";
  if (url.includes("education")) return "Education";
  if (url.includes("technology")) return "Technology";
  if (url.includes("entertainment_and_arts")) return "Entertainment & Arts";
  return "Unknown"; 
}
function analyzeSentiment(text) {
  const sentimentResult = vader.SentimentIntensityAnalyzer.polarity_scores(text);
  const compound = sentimentResult.compound;



  return compound;
}
function extractKeywords(headline) {
  if (!headline || typeof headline !== 'string') {
      throw new Error('Invalid input. Please provide a valid string.');
  }

  // Parse the text using compromise
  const doc = nlp(headline);

  // Extract meaningful words (nouns, proper nouns)
  const keywords = doc.nouns().out('array');

  // Return unique and cleaned keywords
  return [...new Set(keywords.map(word => word.trim()))];
}
function dateToTimestamp(date) {
  if (!date || typeof date !== 'string') {
      throw new Error('Invalid input. Please provide a valid date string.');
  }

  const timestamp = new Date(date).getTime();

  if (isNaN(timestamp)) {
      throw new Error('Invalid date format. Ensure the date is valid.');
  }

  return timestamp;
}

module.exports = { analyzeSentiment, getCategoryFromUrl, extractKeywords, rssUrls,dateToTimestamp };

const vader = require('vader-sentiment');
const nlp = require('compromise');

// RSS feed URLs
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

// Get category from URL
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

  let label;
  if (compound >= 0.6) {
    label = 'very positive';
  } else if (compound >= 0.3) {
    label = 'positive';
  } else if (compound > 0.05) {
    label = 'slightly positive';
  } else if (compound > -0.05) {
    label = 'neutral';
  } else if (compound > -0.3) {
    label = 'slightly negative';
  } else if (compound > -0.6) {
    label = 'negative';
  } else {
    label = 'very negative';
  }

  return `${label}|${compound}`;
}

function extractKeywords(text) {
  const doc = nlp(text);

  // Extract distinct types of entities
  const events = doc.topics().out('array'); // Extract topics or events
  const people = doc.people().out('array'); // Extract names of people
  const nouns = doc.nouns().out('array');  // Extract general nouns

  // Merge and deduplicate results
  const keywordsSet = new Set([...events, ...people, ...nouns]);

  // Ensure no phrases or sentences are included, only tokens
  const filteredKeywords = Array.from(keywordsSet).filter(
    (keyword) => keyword.trim().split(/\s+/).length === 1 // Keep single tokens only
  );

  return filteredKeywords.join(' - '); // Join keywords with separator
}



module.exports = { analyzeSentiment, getCategoryFromUrl, extractKeywords, rssUrls };

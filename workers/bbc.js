const axios = require('axios');
const xml2js = require('xml2js');
const { analyzeSentiment, extractKeywords ,dateToTimestamp} = require("./analyzer");

const rssUrls = [
  "https://feeds.bbci.co.uk/news/world/africa/rss.xml",
  "http://feeds.bbci.co.uk/news/world/asia/rss.xml",
  "https://feeds.bbci.co.uk/news/world/europe/rss.xml",
  "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml",
  "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
  "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
  "https://feeds.bbci.co.uk/news/business/rss.xml",
  "https://feeds.bbci.co.uk/news/politics/rss.xml",
  "https://feeds.bbci.co.uk/news/health/rss.xml",
  "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

async function fetchRssFeed(url) {
  try {
    const response = await axios.get(url);
    const rssData = response.data;

    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true
    });

    return new Promise((resolve, reject) => {
      parser.parseString(rssData, (err, result) => {
        if (err) {
          console.error("Error parsing XML:", err);
          return reject(err);
        }

        const channel = result.rss.channel;
        const items = Array.isArray(channel.item) ? channel.item : [channel.item];
        const category = getCategoryFromUrl(url);
        
        const formattedItems = items.map(item => {
          const description = item.description;
          const keywords = extractKeywords(item.title); 
          const label = analyzeSentiment(description);

          return {
            headline: item.title,
            articleUrl: item.link,
            description: description,
            date: formatDate(item.pubDate),
            articleImage: item['media:thumbnail'] ? item['media:thumbnail'].url : null,
            label: label,
            source: "BBC",
            keywords: keywords,
            relatedCountry: "United Kingdom",
            bias: "left-center",
            category: category
          };
        });

        resolve(formattedItems); 
      });
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return [];
  }
}

async function getBbc() {
  try {
    const fetchPromises = rssUrls.map(url => fetchRssFeed(url));
    const results = await Promise.all(fetchPromises);
    const allArticles = results.flat(); // Flatten the array of arrays

    return allArticles; // Return the articles as JSON
  } catch (error) {
    console.error("Error in getBbc:", error);
    return [];
  }
}

module.exports = { getBbc };
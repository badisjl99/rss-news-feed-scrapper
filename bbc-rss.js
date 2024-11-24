const axios = require('axios');
const xml2js = require('xml2js');
const { analyzeSentiment,extractKeywords } = require("./analyzer");
const fs = require('fs');

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

// Helper function to determine the category based on the URL
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

// Helper function to format the publication date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Function to fetch and process each RSS feed
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
        const keywords = extractKeywords(item.title);
        const formattedItems = items.map(item => {
          const description = item.description;
          const label = analyzeSentiment(description);

          return {
            headline: item.title,
            articleUrl: item.link,
            description: description,
            date: formatDate(item.pubDate),
            articleImage: item['media:thumbnail'] ? item['media:thumbnail'].url : null,
            label: label,
            source: "BBC",
            keywords : keywords,
            relatedCountry: "United Kingdom",
            bias: "left",
            category: category
          };
        });

        resolve(formattedItems); // Return the formatted items for this feed
      });
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return [];
  }
}

// Main function to process all feeds and save to a single JSON file
async function processAllFeeds() {
  const allArticles = [];

  for (const url of rssUrls) {
    const articles = await fetchRssFeed(url);
    allArticles.push(...articles); // Combine all articles into one array
  }

  fs.writeFileSync('bbc-rss.json', JSON.stringify(allArticles, null, 2), 'utf-8');
  console.log("All articles saved to all_rss_data.json");
}

processAllFeeds();

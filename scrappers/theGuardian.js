const axios = require('axios');
const xml2js = require('xml2js');
const { analyzeSentiment, extractKeywords } = require("./analyzer");
const fs = require('fs');
const cheerio = require('cheerio'); 

const rssUrls = [

  "https://www.theguardian.com/world/morocco/rss",
  "https://www.theguardian.com/world/tunisia/rss",
  "https://www.theguardian.com/world/egypt/rss",
  "https://www.theguardian.com/world/qatar/rss",
  "https://www.theguardian.com/world/syria/rss",
  "https://www.theguardian.com/world/lebanon/rss",
  "https://www.theguardian.com/world/russia/rss",
  "https://www.theguardian.com/world/china/rss",
  "https://www.theguardian.com/world/india/rss",
  "https://www.theguardian.com/world/germany/rss",
  "https://www.theguardian.com/world/france/rss",
  "https://www.theguardian.com/world/italy/rss",
  "https://www.theguardian.com/world/spain/rss",
  "https://www.theguardian.com/world/africa/rss",
  "https://www.theguardian.com/world/brazil/rss",
  "https://www.theguardian.com/world/argentina/rss",
  "https://www.theguardian.com/world/belarus/rss",
  "https://www.theguardian.com/football/rss",
  "https://www.theguardian.com/science/rss",
  "https://www.theguardian.com/world/middleeast/rss"
  ];

function getCategoryFromUrl(url) {
  const categories = {
    "algeria": "Algeria",
    "morocco": "Morocco",
    "tunisia": "Tunisia",
    "egypt": "Egypt",
    "qatar": "Qatar",
    "syria": "Syria",
    "lebanon": "Lebanon",
    "russia": "Russia",
    "china": "China",
    "india": "India",
    "germany": "Germany",
    "france": "France",
    "italy": "Italy",
    "spain": "Spain",
    "africa": "Africa",
    "brazil": "Brazil",
    "argentina": "Argentina",
    "belarus": "Belarus",
    "football": "Football",
    "science": "Science",
    "middleeast": "Middle East"
  };

  for (const key in categories) {
    if (url.includes(key)) return categories[key];
  }
  return "Unknown";
}

function formatDate(dateString) {
  return new Date(dateString).toISOString().split('T')[0];
}

async function fetchRssFeed(url) {
  try {
    const response = await axios.get(url);
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    const result = await parser.parseStringPromise(response.data);
    const channel = result.rss.channel;
    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    const category = getCategoryFromUrl(url);

    return items.map(item => {
      const $ = cheerio.load(item.description || '');
      const cleanDescription = $.text().trim();
      return {
        headline: item.title,
        articleUrl: item.link,
        description: cleanDescription,
        date: formatDate(item.pubDate),
        articleImage: item['media:content']?.[0]?.url || null,
        label: analyzeSentiment(cleanDescription),
        source: "The Guardian",
        keywords: extractKeywords(item.title),
        relatedCountry: "United Kingdom",
        bias: "left-center",
        category: category,
      };
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return [];
  }
}

async function getTheGuardian() {
  const allArticles = [];
  for (const url of rssUrls) {
    const articles = await fetchRssFeed(url);
    allArticles.push(...articles);
  }
  fs.writeFileSync('data/theguardian-rss.json', JSON.stringify(allArticles, null, 2), 'utf-8');
  console.log("All articles saved to theguardian-rss.json");
}

module.exports = { getTheGuardian };
const axios = require('axios');
const xml2js = require('xml2js');
const { analyzeSentiment, extractKeywords } = require("./analyzer");

const rssUrls = [
  "https://feeds.thelocal.com/rss/es"
];

function getCategoryFromUrl(url) {
  return "World";
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

    const result = await parser.parseStringPromise(rssData);
    const channel = result.rss.channel;
    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    const category = getCategoryFromUrl(url);

    return items.map(item => {
      const description = item.description?.trim();
      const keywords = extractKeywords(item.title?.trim());
      const label = analyzeSentiment(description);

      // Extract image URL from the 'enclosure' tag
      const articleImage = item.enclosure?.url?.trim() || null;

      return {
        headline: item.title?.trim(),
        articleUrl: item.link?.trim(),
        description,
        date: formatDate(item.pubDate),
        articleImage,
        label,
        source: "The Local",
        relatedCountry: "Spain",
        keywords,
        bias: "left-center",
        category
      };
    });
    
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return [];
  }
}

async function getTheLocal() {
  try {
    const allArticles = await Promise.all(rssUrls.map(url => fetchRssFeed(url)));
    return allArticles.flat(); // Flatten the array of arrays
  } catch (error) {
    console.error("Error in getTheLocal:", error);
    return [];
  }
}

module.exports = { getTheLocal };
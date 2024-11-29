const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
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

    const result = await new Promise((resolve, reject) => {
      parser.parseString(rssData, (err, result) => {
        if (err) {
          return reject("Error parsing XML: " + err);
        }
        resolve(result);
      });
    });

    const channel = result.rss.channel;
    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    const category = getCategoryFromUrl(url);

    const formattedItems = items.map(item => {
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

    // Save to JSON file
    const outputFileName = 'data/thelocal.json';
    fs.writeFileSync(outputFileName, JSON.stringify(formattedItems, null, 2), 'utf-8');
    console.log(`RSS data saved to ${outputFileName}`);
    
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
  }
}

async function getTheLocal() {
  try {
    await Promise.all(rssUrls.map(url => fetchRssFeed(url)));
  } catch (error) {
    console.error("Error in getTheLocal:", error);
  }
}

module.exports = { getTheLocal };
const axios = require('axios');
const xml2js = require('xml2js');
const { analyzeSentiment, extractKeywords } = require("./analyzer");

const rssUrls = [
  "https://www.indiatoday.in/rss/1206578"
];

function getCategoryFromUrl(url) {
  return "India";
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

function stripHtml(html) {
  return html.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
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
    const channelImage = channel.image ? channel.image.url : null;

    const formattedItems = items.map(item => {
      const description = stripHtml(item.description);
      const label = analyzeSentiment(description);
      const keywords = extractKeywords(description);

      let articleImage = item['media:content']?.url || channelImage;

      return {
        headline: item.title,
        articleUrl: item.link.trim(),
        description: description.trim(),
        date: formatDate(item.pubDate),
        articleImage: articleImage,
        label: label,
        keywords: keywords,
        source: "India Today",
        relatedCountry: "India",
        bias: "center",
        category: category,
      };
    });

    return formattedItems; // Return the formatted items as JSON
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return []; // Return an empty array on error
  }
}

async function getIndiaToday() {
  try {
    const results = await Promise.all(rssUrls.map(url => fetchRssFeed(url)));
    return results.flat(); // Flatten the results array
  } catch (error) {
    console.error("Error in getIndiaToday:", error);
    return []; // Return an empty array on error
  }
}

module.exports = { getIndiaToday };
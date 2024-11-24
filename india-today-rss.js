const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs'); // Import file system module
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

    parser.parseString(rssData, (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return;
      }

      const channel = result.rss.channel;
      const items = Array.isArray(channel.item) ? channel.item : [channel.item];
      const category = getCategoryFromUrl(url);

      const channelImage = channel.image ? channel.image.url : null;

      const formattedItems = items.map(item => {
        let description = stripHtml(item.description);
        const label = analyzeSentiment(description);
        const keywords = extractKeywords(description); // Extract keywords from description

        let articleImage = null;
        if (item['media:content'] && item['media:content'].url) {
          articleImage = item['media:content'].url;
        } else if (channelImage) {
          articleImage = channelImage;
        }

        return {
          headline: item.title,
          articleUrl: item.link.trim(),
          description: description.trim(), // Ensure no extra spaces
          date: formatDate(item.pubDate),
          articleImage: articleImage,
          label: label,
          keywords: keywords, // Add the extracted keywords
          source: "India Today",
          relatedCountry: "India",
          bias: "center",
          category: category,
        };
      });

      // Save to a JSON file
      fs.writeFileSync('india-today.json', JSON.stringify(formattedItems, null, 2), 'utf-8');
      console.log('RSS feed saved as rss_feed.json');
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
  }
}

rssUrls.forEach(url => {
  fetchRssFeed(url);
});

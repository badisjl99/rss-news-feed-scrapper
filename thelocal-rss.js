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

    parser.parseString(rssData, (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return;
      }

      const channel = result.rss.channel;
      const items = Array.isArray(channel.item) ? channel.item : [channel.item];
      const category = getCategoryFromUrl(url);

      const formattedItems = items.map(item => {
        const description = item.description?.trim();  // Remove extra whitespace
        const keywords = extractKeywords(item.title?.trim());
        const label = analyzeSentiment(description);

        // Extract image URL from the 'enclosure' tag
        let articleImage = null;
        if (item.enclosure && item.enclosure.url) {
          articleImage = item.enclosure.url.trim();
        }

        return {
          headline: item.title?.trim(),  // Clean headline
          articleUrl: item.link?.trim(),  // Clean article URL
          description: description,
          date: formatDate(item.pubDate),
          articleImage: articleImage,  // Use the extracted image URL
          label: label,
          source: "The Local",
          relatedCountry: "Spain",
          keywords: keywords,
          bias: "center",
          category: category
        };
      });

      // Save to JSON file
      const outputFileName = 'thelocal-rss.json';
      fs.writeFile(outputFileName, JSON.stringify(formattedItems, null, 2), (err) => {
        if (err) {
          console.error("Error saving JSON file:", err);
        } else {
          console.log(`RSS data saved to ${outputFileName}`);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
  }
}


rssUrls.forEach(url => {
  fetchRssFeed(url);
});

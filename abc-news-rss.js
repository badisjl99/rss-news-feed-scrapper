const axios = require('axios');
const xml2js = require('xml2js');
const { analyzeSentiment , extractKeywords} = require("./analyzer");
const fs = require('fs');

const rssUrl = "https://abcnews.go.com/abcnews/internationalheadlines";

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

      const formattedItems = items.map(item => {
        const description = item.description;
        const label = analyzeSentiment(description);
        const keywords = extractKeywords(description);
        // Select the largest available thumbnail
        const thumbnails = Array.isArray(item['media:thumbnail']) ? item['media:thumbnail'] : [item['media:thumbnail']];
        const largestThumbnail = thumbnails.reduce((largest, current) => {
          return parseInt(current.width) > parseInt(largest.width) ? current : largest;
        }, thumbnails[0]);

        return {
          headline: item.title,
          articleUrl: item.link,
          description: description,
          date: formatDate(item.pubDate),
          articleImage: largestThumbnail ? largestThumbnail.url : null,
          label: label,
          source: "ABC News",
          relatedCountry: "United States",
          bias: "center",
          keywords:keywords,
          category: item.category || "International"
        };
      });

      fs.writeFile('abc-news.json', JSON.stringify(formattedItems, null, 2), (err) => {
        if (err) {
          console.error("Error writing JSON to file:", err);
        } else {
          console.log("RSS feed data saved to rssFeedData.json");
        }
      });
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
  }
}

fetchRssFeed(rssUrl);

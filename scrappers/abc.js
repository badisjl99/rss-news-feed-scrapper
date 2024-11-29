const axios = require('axios');
const cheerio = require('cheerio'); 
const xml2js = require('xml2js');
const { analyzeSentiment , extractKeywords ,getCategoryFromUrl} = require("./analyzer");
const fs = require('fs');


function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

async function getAbc() {
  try {
    const url = 'https://abcnews.go.com/abcnews/internationalheadlines'
    const response = await axios.get(url);
    const rssData = response.data;

    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
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

        const formattedItems = items.map((item) => {
          // Clean HTML tags from description
          const rawDescription = item.description || '';
          const $ = cheerio.load(rawDescription);
          const cleanDescription = $.text().trim(); // Extract plain text and trim whitespace

          const label = analyzeSentiment(cleanDescription);
          const keywords = extractKeywords(item.title);

          // Handle media content for images
          let imageUrl = null;
          if (item['media:content'] && item['media:content'].url) {
            imageUrl = item['media:content'].url;
          } else if (item['media:thumbnail'] && item['media:thumbnail'].url) {
            imageUrl = item['media:thumbnail'].url;
          }

          return {
            headline: item.title,
            articleUrl: item.link,
            description: cleanDescription, // Use cleaned description here
            date: formatDate(item.pubDate),
            articleImage: imageUrl,
            label: label,
            source: "The Guardian",
            keywords: keywords,
            relatedCountry: "United Kingdom",
            bias: "left",
            category: category,
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

module .exports={getAbc};


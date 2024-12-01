const axios = require('axios');
const xml2js = require('xml2js');
const { extractKeywords, analyzeSentiment, dateToTimestamp } = require('./analyzer');
const he = require('he'); // Import the 'he' library to decode HTML entities

async function fetchTelegraphNewsFeed(url) {
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

    // Determine category based on the URL
    const category = url.includes('sport') ? 'Sports' : url.includes('politics') ? 'Politics' : 'World & UK';

    const articles = await Promise.all(items.map(async (item) => {
      const description = item.description?.trim();
      const headline = item.title?.trim();
      const articleUrl = item.link?.trim();
      const pubDate = item.pubDate;
      const formattedDate = pubDate ? new Date(pubDate).toISOString().split('T')[0] : null;

      // Clean up description: Remove HTML tags and decode HTML entities
      let cleanDescription = description ? description.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1') : ''; // Remove CDATA wrapper
      cleanDescription = cleanDescription ? he.decode(cleanDescription.replace(/<[^>]*>/g, '')) : ''; // Remove HTML tags and decode HTML entities

      // Extracting the largest thumbnail (based on dimensions, if available)
      const articleImage = item.enclosure?.url;

      // Use async extractKeywords and analyzeSentiment
      const keywords = await extractKeywords(headline || "");
      const sentimentLabel = await analyzeSentiment(cleanDescription || "");

      return {
        headline,
        articleUrl,
        description: cleanDescription,
        date: dateToTimestamp(pubDate),
        articleImage,
        label: sentimentLabel,
        source: "Daily Telegraph",
        relatedCountry: "United Kingdom",
        keywords,
        bias: "right",  // Modify as needed based on your sentiment analysis
        category,  // Assign category based on the URL
      };
    }));

    return articles;
  } catch (error) {
    console.error("Error fetching Telegraph News RSS feed:", error);
    return [];
  }
}

async function getTelegraphNews() {
  const rssUrls = [
    "https://www.telegraph.co.uk/sport/rss.xml",
    "https://www.telegraph.co.uk/politics/rss.xml",
    "https://www.telegraph.co.uk/rss.xml"
  ];

  try {
    const articles = await Promise.all(rssUrls.map(url => fetchTelegraphNewsFeed(url)));
    return articles.flat();  // Flatten the array of arrays into a single array of articles
  } catch (error) {
    console.error("Error in getTelegraphNews:", error);
    return [];
  }
}

module.exports = { getTelegraphNews };

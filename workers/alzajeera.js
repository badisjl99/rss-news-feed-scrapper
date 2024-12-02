const axios = require('axios');
const xml2js = require('xml2js');
const { extractKeywords, analyzeSentiment } = require('./analyzer');

async function fetchAlJazeeraNewsFeed(url) {
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

    const articles = await Promise.all(items.map(async (item) => {
      const description = item.description?.trim();
      const headline = item.title?.trim();
      const articleUrl = item.link?.trim();
      const pubDate = item.pubDate;
      const formattedDate = pubDate ? new Date(pubDate).toISOString().split('T')[0] : null;

      const articleImage = channel.image?.url;

      const keywords = await extractKeywords(headline || "");
      const sentimentLabel = await analyzeSentiment(description || "");
      var category = item.category?.trim() || "World" ;
      if (category === "Show Types") {
        category = "World";
      }
      
      return {
        headline,
        articleUrl,
        description,
        date: formattedDate,
        articleImage,
        label: sentimentLabel,
        source: "Al Jazeera",
        relatedCountry: "Qatar", 
        keywords,
        bias: "left-center", 
        category: category,
      };
    }));

    return articles;
  } catch (error) {
    console.error("Error fetching Al Jazeera RSS feed:", error);
    return [];
  }
}

async function getAlJazeera() {
  const rssUrl = "https://www.aljazeera.com/xml/rss/all.xml";
  try {
    const articles = await fetchAlJazeeraNewsFeed(rssUrl);
    return articles;
  } catch (error) {
    console.error("Error in getAlJazeera:", error);
    return [];
  }
}



module.exports = { getAlJazeera };

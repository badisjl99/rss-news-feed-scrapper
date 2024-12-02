const axios = require('axios');
const xml2js = require('xml2js');
const { extractKeywords, analyzeSentiment } = require('./analyzer');

async function fetchFrance24Feed(url) {
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

      const thumbnails = item['media:thumbnail'];
      const articleImage = Array.isArray(thumbnails)
        ? thumbnails.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0]?.url
        : thumbnails?.url;

      const keywords = await extractKeywords(headline || "");
      const sentimentLabel = await analyzeSentiment(description || "");

      return {
        headline,
        articleUrl,
        description,
        date: formattedDate,
        articleImage,
        label: sentimentLabel,
        source: "France 24",
        relatedCountry: "France",
        keywords,
        bias: "center",
        category: item.category?.trim() || "World"
      };
    }));

    return articles;
  } catch (error) {
    console.error("Error fetching France 24 RSS feed:", error);
    return [];
  }
}

async function getFrance24() {
  const rssUrl = "https://www.france24.com/en/rss";
  try {
    const articles = await fetchFrance24Feed(rssUrl);
    console.log(articles) ;
    return articles;
  } catch (error) {
    console.error("Error in getFrance24:", error);
    return [];
  }
}
module.exports = { getFrance24 };

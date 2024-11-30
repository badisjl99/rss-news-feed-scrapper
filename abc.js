const axios = require('axios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');

async function getAbc() {
  try {
    const url = 'https://abcnews.go.com/abcnews/internationalheadlines';
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
          const cleanDescription = $.text().trim();

          const label = analyzeSentiment(cleanDescription);
          const keywords = extractKeywords(item.title);

          // Handle media content for images
          let imageUrl = null;
          if (Array.isArray(item['media:thumbnail'])) {
            // Choose the best thumbnail based on resolution or other criteria
            const sortedThumbnails = item['media:thumbnail'].sort(
              (a, b) => parseInt(b.width, 10) - parseInt(a.width, 10)
            );
            imageUrl = sortedThumbnails[0]?.url || null; // Pick the largest image
          } else if (item['media:thumbnail'] && item['media:thumbnail'].url) {
            imageUrl = item['media:thumbnail'].url;
          }

          return {
            headline: item.title,
            articleUrl: item.link,
            description: cleanDescription,
            date: formatDate(item.pubDate),
            articleImage: imageUrl,
            label: label,
            source: "ABC News",
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

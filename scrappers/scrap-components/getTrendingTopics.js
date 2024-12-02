const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeTrendingItems() {
  try {
    const { data } = await axios.get('https://ground.news/');
    
    if (!data) {
      throw new Error('No data received from the URL');
    }

    const $ = cheerio.load(data);
    
    let trendingItems = [];

    $('a[id^="header-trending-"]').each((index, element) => {
      const title = $(element).text().trim();
      if (title) {
        const trendingItem = {
          rank: index + 1,
          trendName: title 
        };
        trendingItems.push(trendingItem);
      }
    });

    if (trendingItems.length === 0) {
      throw new Error('No trending items found');
    }

    const topicData = {
      date: new Date(),
      trends: trendingItems
    };

    return topicData;

  } catch (error) {
    console.error('Error scraping the trending items:', error.message);
    return null;
  }
}

module.exports = scrapeTrendingItems;

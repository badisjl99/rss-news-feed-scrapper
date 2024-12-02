const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function getTwitterTrends() {
  try {
    const { data } = await axios.get('https://trends24.in/');
    const $ = cheerio.load(data);

    const trends = [];
    $('.list-container .trend-card__list li').each((index, element) => {
      if (index < 15) { 
        const rank = index + 1;
        const trendName = $(element).find('.trend-name a').text().trim();
        trends.push({ rank, trendName });
      }
    });
    
    const trendsData = {
      date: new Date().toISOString(), 
      trends
    };


    return trendsData;

  } catch (error) {
    console.error('Error fetching trends:', error);
  }
}

module.exports = getTwitterTrends;

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://feed.podbean.com/simply-politics/feed.xml';

async function getRSSAudio() {
  try {
    const { data } = await axios.get(url);

    const $ = cheerio.load(data, { xmlMode: true });

    const items = [];

    $('item').each((index, element) => {
      const item = {
        title: $(element).find('title').text(),
        pubDate: $(element).find('pubDate').text(),
        description: $(element).find('description').text(),
        enclosureUrl: $(element).find('enclosure').attr('url')
      };

      items.push(item);
    });

   return items ;

  } catch (error) {
    console.error('Error fetching the RSS feed:', error);
  }
}



module.exports = getRSSAudio ;
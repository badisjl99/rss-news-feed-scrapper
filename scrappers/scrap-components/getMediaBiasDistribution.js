const axios = require('axios');
const cheerio = require('cheerio');
const analyzeHeadline = require('../ai-analyzer/sentimentAnalyzer');

const getMediaBiasDistribution = async () => {
  const url = 'https://ground.news/';
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const articles = [];

    const getCurrentDate = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const elements = $('.group').toArray();

    for (const element of elements) {
      const title = $(element).find('h4').text().trim();
      const biasElements = $(element).find('.h-full.text-12.flex.text-center.whitespace-nowrap.overflow-hidden > div');
      const biases = [];

      biasElements.each((i, biasElement) => {
        const widthStyle = $(biasElement).attr('style');
        const widthPercentage = parseFloat(widthStyle.match(/width:(\d+)%/)[1]);
        biases.push(widthPercentage);
      });

      const relatedCountriesArray = $(element).find('span.text-12 > span').map((i, countryElement) => {
        let countryText = $(countryElement).text().trim();
        if (countryText.startsWith('· ')) {
          countryText = countryText.substring(2);
        }
        return countryText;
      }).get();
      const relatedCountries = relatedCountriesArray.join(', ');

      if (biases.length === 3 && relatedCountriesArray.length > 0) {
        const label = await analyzeHeadline(title);

        articles.push({
            headline:title,
            date: getCurrentDate(),
            biases: {
              left: biases[0] / 100,
              neutral: biases[1] / 100,
              right: biases[2] / 100
            },
            relatedCountries,
            label
          });
          
      }
    }

    return articles;
  } catch (error) {
    console.error(`Error fetching the page: ${error.message}`);
    return [];
  }
};



module.exports = getMediaBiasDistribution ;
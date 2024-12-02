const axios = require('axios');
const translate = require('google-translate-api-x'); // New package
const { extractKeywords, dateToTimestamp, analyzeSentiment } = require("../workers/analyzer");
const { tr } = require('google-translate-api/languages');

async function translateText(text) {
  try {
    const translated = await translate(text, { from: 'fr', to: 'en' });
    return translated.text;  // Return the translated text
  } catch (error) {
    console.error('Translation Error:', error);
    return text;  // Return the original text if translation fails
  }
}

const getMosaique = async () => {
  try {
    const response = await axios.get('https://api.mosaiquefm.net/api/fr/home/articles');
    const data = response.data.items;

    const transformedData = [];
    let count = 0;
    for (const item of data) {
      // Translate the headline, category, and description
      const translatedHeadline = await translateText(item.title);
      const translatedCategory = await translateText(item.label);
      const translatedDescription = await translateText(item.intro);

    
      transformedData.push({
        headline: translatedHeadline,
        category: translatedCategory,
        description: translatedDescription,
        articleImage: item.image,
        source: "Mosaique FM",
        articleUrl: item.link,
        keywords: extractKeywords(translatedHeadline),
        date: new Date(item.startPublish.date).toISOString().split('T')[0],
        label: analyzeSentiment(translatedHeadline),
        bias: "center",
        relatedCountry: "Tunisia"
      });
    }
    console.log(transformedData)
    return transformedData;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};


module.exports = {getMosaique};

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetches the article HTML data and extracts all <p> tags with the specified class name.
 * @param {string} className - The class name of the <p> tags to extract.
 * @param {string} articleUrl - The URL of the article to fetch.
 * @returns {Promise<string[]>} - A promise that resolves to an array of strings, each containing the text of a <p> tag with the specified class name.
 */

async function extractParagraphs(className, articleUrl) {
    try {
        const response = await axios.get(articleUrl);

        const $ = cheerio.load(response.data);

        const paragraphs = $(`p.${className}`).map((i, el) => $(el).text().trim()).get();

        return paragraphs;
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        return [];
    }
}

// Example usage
(async () => {
    const className = 'iie4';
    const articleUrl = 'https://www.mosaiquefm.net/fr/actualite-national-tunisie/1266923/greve-des-avocats-dans-les-tribunaux-du-grand-tunis';
    const paragraphs = await extractParagraphs(className, articleUrl);
    console.log(paragraphs);
})();



//module.exports = extractParagraphs;

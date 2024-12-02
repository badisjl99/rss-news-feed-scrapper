const axios = require('axios');
const cheerio = require('cheerio');
const analyzeHeadline = require('../ai-analyzer/sentimentAnalyzer');
const biasAnalyzer = require('../ai-analyzer/biasAnalyzer') ;
const relatedCountryAnalyzer = require('../ai-analyzer/relatedCountryAnalyzer') ;


const nlp = require('compromise');

async function getYahooNews() {
    const baseUrl = 'https://www.yahoo.com/';

    try {
        const allArticles = [];
        const response = await axios.get(baseUrl);
        const $ = cheerio.load(response.data);

        const articleElements = $('li.stream-item');
        
        for (let i = 0; i < articleElements.length; i++) {
            const element = articleElements[i];
            const $element = $(element);

            const article = {};
            article.articleImage = $element.find('a[data-test-locator="stream-item-image"] img').attr('src');
            article.headline = $element.find('h3.stream-item-title a').text().trim();
            article.description = $element.find('p[data-test-locator="stream-item-summary"]').text().trim();

            const dateText = $element.find('span[data-test-locator="stream-read-time"]').text().trim();
            article.date = new Date().toISOString().split('T')[0]; // Using current date as the article date isn't provided

            const category = $element.find('strong[data-test-locator="stream-item-category-label"]').text().trim();
            article.category = category.toLowerCase();

            const articlePath = $element.find('a[data-test-locator="stream-item-image"]').attr('href');
            article.articleUrl = articlePath;

            const source = $element.find('span[data-test-locator="stream-item-publisher"]').text().trim();
            article.source = source;
            
            article.bias = biasAnalyzer(article.source);
            article.relatedCountry = relatedCountryAnalyzer(article.source);

            

            const doc = nlp(article.headline);
            const people = doc.people().out('array');
            const nouns = doc.nouns().out('array');
            
            const keywords = [...new Set([...people, ...nouns])];
            article.keywords = keywords.join(' - ');

            // Adding delay between requests
            await new Promise((resolve) => setTimeout(resolve, 100));

            const sentimentLabel = await analyzeHeadline(article.headline);
            article.label = sentimentLabel;

            allArticles.push(article);
        }


        return allArticles; 
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
}
module.exports = getYahooNews;


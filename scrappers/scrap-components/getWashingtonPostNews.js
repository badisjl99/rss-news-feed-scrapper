const axios = require('axios');
const cheerio = require('cheerio');
const analyzeHeadline = require('../ai-analyzer/sentimentAnalyzer');
const biasAnalyzer = require('../ai-analyzer/biasAnalyzer') ;
const relatedCountryAnalyzer = require('../ai-analyzer/relatedCountryAnalyzer') ;


const nlp = require('compromise');

const urls = [

    { url: 'https://www.washingtonpost.com/politics/', category: 'Politics' }
];

async function getArticlesFromUrl(url, category) {
    try {
        const allArticles = [];
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const articleElements = $('div[data-feature-id="homepage/story"]');

        for (let i = 0; i < articleElements.length; i++) {
            const element = articleElements[i];
            const $element = $(element);

            const article = {};
            article.articleImage = $element.find('figure img').attr('src');
            article.headline = $element.find('h3').text().trim();
            article.description = $element.find('p').text().trim();

            const dateText = $element.find('span[data-testid="timestamp"]').text().trim();
            article.date = new Date(dateText).toISOString().split('T')[0]; 

            article.category = category; 
            article.articleUrl = $element.find('a[href^="https://www.washingtonpost.com/"]').attr('href');

            const source = "The Washington Post";
            article.source = source;
            article.bias = biasAnalyzer(article.source);
            article.relatedCountry = relatedCountryAnalyzer(article.source);


            const doc = nlp(article.headline);
            const people = doc.people().out('array');
            const nouns = doc.nouns().out('array');
            
            const keywords = [...new Set([...people, ...nouns])];
            article.keywords = keywords.join(' - ');

            await new Promise((resolve) => setTimeout(resolve, 70));

            const sentimentLabel = await analyzeHeadline(article.headline);
            article.label = sentimentLabel;

            allArticles.push(article);
        }

        return allArticles;
    } catch (error) {
        console.error(`Error fetching or parsing data from ${url}:`, error);
        return [];
    }
}

async function getWashingtonPostNews() {
    const allArticles = [];

    for (const { url, category } of urls) {
        const articles = await getArticlesFromUrl(url, category);
        allArticles.push(...articles);
    }
    console.log("Data scraped successfully from all URLs");
    return allArticles;
}



module.exports = getWashingtonPostNews ;
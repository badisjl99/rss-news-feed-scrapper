const axios = require('axios');
const cheerio = require('cheerio');
const nlp = require('compromise');
const analyzeHeadline = require('../ai-analyzer/sentimentAnalyzer');
const biasAnalyzer = require('../ai-analyzer/biasAnalyzer');
const relatedCountryAnalyzer = require('../ai-analyzer/relatedCountryAnalyzer');

const baseUrl = 'https://www.france24.com/en/archives/';
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const dateStr = `${yesterday.getFullYear()}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getDate().toString().padStart(2, '0')}-July-${yesterday.getFullYear()}`;

async function getFrance24News() {
    try {
        const allArticles = [];
        const response = await axios.get(`${baseUrl}${dateStr}`);
        const $ = cheerio.load(response.data);

        const articleElements = $('ul.o-archive-day__list li.o-archive-day__list__entry');
        
        for (let i = 0; i < articleElements.length; i++) {
            const element = articleElements[i];
            const $element = $(element);

            const article = {};
            article.headline = $element.find('a.a-archive-link h2').text().trim();
            const slug = $element.find('a.a-archive-link').attr('href');
            article.articleUrl = `https://www.france24.com${slug}`;

            const articleResponse = await axios.get(article.articleUrl);
            const articlePage = cheerio.load(articleResponse.data);

            article.description = articlePage('p.t-content__chapo').text().trim();
            const dateElement = articlePage('span.m-pub-dates__date time').attr('datetime');
            article.date = new Date(dateElement).toISOString().split('T')[0];

            const imageUrl = articlePage('figure.m-figure img').attr('src');
            article.articleImage = imageUrl ? imageUrl : '';

            const paragraphs = articlePage('p').map((i, el) => $(el).text().trim()).get();

            if (paragraphs.length === 0) {
                continue;
            }
            article.content = paragraphs;

            article.source = 'France 24';
            article.category = 'World';
            article.bias = biasAnalyzer(article.source);
            article.relatedCountry = relatedCountryAnalyzer(article.source);

            const doc = nlp(article.headline);
            const people = doc.people().out('array');
            const nouns = doc.nouns().out('array');
            const keywords = [...new Set([...people, ...nouns])];
            article.keywords = keywords.join(' - ');

            await new Promise((resolve) => setTimeout(resolve, 75));

            const sentimentLabel = await analyzeHeadline(article.headline);
            article.label = sentimentLabel;
            allArticles.push(article);
            console.log(`Article ${allArticles.length} Processed . `);
        }

        return allArticles;
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
}

module.exports = getFrance24News;

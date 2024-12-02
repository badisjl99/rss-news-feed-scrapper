const axios = require('axios');
const cheerio = require('cheerio');
const nlp = require('compromise');
const analyzeHeadline = require('../ai-analyzer/sentimentAnalyzer');
const biasAnalyzer = require('../ai-analyzer/biasAnalyzer');
const relatedCountryAnalyzer = require('../ai-analyzer/relatedCountryAnalyzer');

const baseUrl = 'https://www.scmp.com';

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function extractKeywords(headline) {
    const doc = nlp(headline);
    const keywords = doc
        .topics()
        .out('array')
        .join(' - '); 
    return keywords;
}

async function scrapeArticleContent(articleUrl) {
    try {
        const response = await axios.get(articleUrl);
        const $ = cheerio.load(response.data);
        const content = [];
        
        $('.e15kmbpe0.css-1c6uqr6.e1346ty31').each((i, el) => {
            content.push($(el).text().trim());
        });

        return content;
    } catch (error) {
        console.error('Error fetching article content:', error);
        return [];
    }
}

async function scrapeSCMP() {
    const url = 'https://www.scmp.com/live?module=oneline_menu_section_int&pgtype=homepage';
    var count = 0;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const articles = [];

        const items = $('.eibwf856.css-2gt3jz.e1xbfz5e6');

        for (let i = 0; i < items.length; i++) {
            const el = items[i];
            const headline = $(el).find('.css-1oyf3lu.e1xbfz5e4 .css-1xdhyk6.eun57400 span').text().trim();
            const category = $(el).find('.css-1772epl.e1xbfz5e5 .css-1xdhyk6.eygoivq1 span').text().trim();
            const description = $(el).find('.css-1b6exde.e1xbfz5e3 p').text().trim();
            const articleUrl = baseUrl + $(el).find('.css-1oyf3lu.e1xbfz5e4 a').attr('href').trim();
            const articleImage = $(el).find('.css-9h97w3.e1xbfz5e1 img').attr('src');
            const date = new Date($(el).find('time').attr('datetime')).toISOString().split('T')[0];
            const src = 'South China Morning Post';

            const content = await scrapeArticleContent(articleUrl);
            await timeout(65);

            const label = await analyzeHeadline(headline);
            const bias = await biasAnalyzer(src);
            const relatedCountry = await relatedCountryAnalyzer(src);
            
            const keywords = extractKeywords(headline); 

            const articleData = {
                headline: headline || 'N/A',
                category: category || 'N/A',
                description: description || 'N/A',
                articleImage: articleImage || 'N/A',
                source: src,
                articleUrl: articleUrl || 'N/A',
                date: date || 'N/A',
                label,
                bias,
                relatedCountry,
                keywords, 
                content 
            };

            articles.push(articleData);
            count++;
            console.log(`Article ${count} Processed.`);
            await timeout(65);
        }

        return articles;

    } catch (error) {
        console.error('Error fetching the URL:', error);
        return [];
    }
}


module.exports = scrapeSCMP;

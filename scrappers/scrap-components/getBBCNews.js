const axios = require('axios');
const cheerio = require('cheerio');
const analyzeHeadline = require('../ai-analyzer/sentimentAnalyzer');

const urls = [
    'https://www.bbc.com/news/world',
    'https://www.bbc.com/culture',
    'https://www.bbc.com/business',
    'https://www.bbc.com/future-planet'
];

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeBBCNews() {
    const allArticles = [];

    for (const url of urls) {
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            const articleElements = $('div[data-testid="liverpool-card"]');

            for (let i = 0; i < articleElements.length; i++) {
                const element = articleElements[i];
                const headline = $(element).find('h2[data-testid="card-headline"]').text().trim();
                const description = $(element).find('p[data-testid="card-description"]').text().trim();
                let articleImage = $(element).find('img').attr('src');
                const srcset = $(element).find('img').attr('srcset');

                if (srcset) {
                    const srcsetUrls = srcset.split(',').map(entry => entry.trim().split(' ')[0]);
                    articleImage = srcsetUrls[srcsetUrls.length - 1]; // Use the largest image URL
                }

                const date = new Date().toISOString().split('T')[0]; // Get today's date in yyyy-mm-dd format
                const category = $(element).find('span[data-testid="card-metadata-tag"]').text().trim();
                const articlePath = 'https://www.bbc.com' + $(element).find('a[data-testid="internal-link"]').attr('href');
                const source = 'BBC';
                const label = await analyzeHeadline(headline);

                const article = {
                    headline,
                    description,
                    articleImage,
                    date,
                    category,
                    articlePath,
                    source,
                    label
                };

                allArticles.push(article);

                await delay(70);
            }
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    }

    console.log(allArticles);
}

scrapeBBCNews();

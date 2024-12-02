const axios = require('axios');
const cheerio = require('cheerio');
const analyzeHeadline = require('../ai-analyzer/sentimentAnalyzer');
const biasAnalyzer = require('../ai-analyzer/biasAnalyzer') ;
const relatedCountryAnalyzer = require('../ai-analyzer/relatedCountryAnalyzer') ;

const nlp = require('compromise');

async function scrapeRTNews() {
    const baseUrls = [
        'https://www.rt.com/news/',

    ];
    try {
        const allArticles = [];

        for (let i = 0; i < baseUrls.length; i++) {
            const url = baseUrls[i];
            console.log(`Scraping articles from: ${url}`);

            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            const articlesOnPage = $('li.listCard-rows__item').length;
            console.log(`Found ${articlesOnPage} articles on ${url}`);

            for (let j = 0; j < articlesOnPage; j++) {
                const element = $('li.listCard-rows__item').eq(j);
                const article = {};

                article.articleImage = element.find('.media__image img').attr('data-src');
                article.headline = element.find('.list-card__content--title a').text().trim();
                article.description = element.find('.list-card__content--summary a').text().trim();

                const dateString = element.find('.card__date .date').text().trim();
                const date = new Date(dateString);
                article.date = date.toISOString().split('T')[0];

                if (url.includes('/news/')) {
                    article.category = 'world';
                } else if (url.includes('/business/')) {
                    article.category = 'business';
                } else if (url.includes('/india/')) {
                    article.category = 'india';
                } else if (url.includes('/africa/')) {
                    article.category = 'africa';
                } else if (url.includes('/russia/')) {
                    article.category = 'russia';
                } else if (url.includes('/pop-culture/')) {
                    article.category = 'entertainment';
                } else {
                    article.category = 'news';
                }

                const baseUrl = 'https://www.rt.com';
                const articlePath = element.find('.list-card__content--title a').attr('href');
                article.articleUrl = baseUrl + articlePath;
                article.source = "Russia Today";
                article.bias = biasAnalyzer(article.source);
                article.relatedCountry =  relatedCountryAnalyzer(article.source);
    
                const articleResponse = await axios.get(article.articleUrl);
                const $article = cheerio.load(articleResponse.data);

                article.paragraphs = [];
                $article('div.article__text.text p').each((index, element) => {
                    article.paragraphs.push($(element).text().trim());
                });

                const doc = nlp(article.headline);
                const people = doc.people().out('array');
                const nouns = doc.nouns().out('array');
                const keywords = [...new Set([...people, ...nouns])];
                article.keywords = keywords.join(' - ');

                
                const sentimentLabel = await analyzeHeadline(article.headline);
                article.label = sentimentLabel;
                allArticles.push(article);

                console.log(`Processed article ${j + 1}/${articlesOnPage}`);
               
            }

            console.log(`Finished scraping ${articlesOnPage} articles from ${url}`);
        }

        return allArticles;

    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
}


async function main(){
    const x = await scrapeRTNews() ;
    console.log(x);
}




main();

module.exports = scrapeRTNews;
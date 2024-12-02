const axios = require('axios');
const cheerio = require('cheerio');
/* const biasAnalyzer = require('../ai-analyzer/biasAnalyzer');
const relatedCountryAnalyzer = require('../ai-analyzer/relatedCountryAnalyzer'); */
const {extractKeywords,dateToTimestamp,analyzeSentiment} = require("../workers/analyzer");




const scrapeArticleContent = async (articleUrl) => {
  try {
    const response = await axios.get(articleUrl);
    const html = response.data;
    const $ = cheerio.load(html);
    const contentArray = [];
    
    $('#Content p').each((index, element) => {
      contentArray.push($(element).text().trim());
    });
    
    return contentArray;
  } catch (error) {
    console.error('Error fetching article content:', error);
    return [];
  }
};

const scrapeChinaDaily = async () => {
  const url = 'https://www.chinadaily.com.cn/china/governmentandpolicy/page_1.html';

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const articles = [];

    for (const element of $('.mb10.tw3_01_2').toArray()) {
      const article = $(element);
      const headline = article.find('.tw3_01_2_t h4 a').text().trim();
      const articleImage = 'https:' + article.find('.tw3_01_2_p a img').attr('src');
      const articleUrl = 'https:' + article.find('.tw3_01_2_p a').attr('href');
      const dateText = article.find('.tw3_01_2_t b').text().trim();
      const date = dateText.split(' ')[0]; 

      if (articleUrl.length < 25) {
        console.log(`Skipping article with short URL: ${articleUrl}`);
        continue;
      }

      const contentArray = await scrapeArticleContent(articleUrl);
      const description = contentArray.length > 0 ? contentArray[0] : '';

      const label = await analyzeHeadline(headline);
      const source = "China Daily";
      const bias = await biasAnalyzer(source); 
      const relatedCountry = await relatedCountryAnalyzer(source); 
      const keywords = extractKeywords(headline);

      articles.push({
        headline,
        description,
        articleImage,
        category: "World",
        articleUrl,
        date,
        source,
        label,
        bias,
        relatedCountry,
        keywords,
        content: contentArray
    
      });
      console.log(`Article ${articles.length} Processed`);
      await delay(200); 
    }

    return articles;
  } catch (error) {
    console.error('Error fetching the page:', error);
    throw error;
  }
};


module.exports = scrapeChinaDaily;

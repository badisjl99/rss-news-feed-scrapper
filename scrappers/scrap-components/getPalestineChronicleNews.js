const axios = require('axios');
const cheerio = require('cheerio');
const nlp = require('compromise');
const analyzeHeadline = require('../ai-analyzer/sentimentAnalyzer');
const biasAnalyzer = require('../ai-analyzer/biasAnalyzer');
const relatedCountryAnalyzer = require('../ai-analyzer/relatedCountryAnalyzer');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const formatKeywords = (keywords) => {
  return keywords.join(' - ');
};

const extractKeywords = (text) => {
  const doc = nlp(text);
  const nouns = doc.nouns().out('array');
  const people = doc.people().out('array');
  const keywords = [...nouns, ...people];
  return formatKeywords(keywords);
};

const getArticleContent = async (url) => {
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      const contentDiv = $('.entry-content.clearfix');
      const paragraphs = contentDiv.find('p').map((i, el) => $(el).text().trim()).get();
      return paragraphs; 
    } catch (error) {
      console.error('Error fetching article content:', error);
      return [];
    }
  };
  

const getPalestineChronicleNews = async () => {
  const url = "https://www.palestinechronicle.com/category/articles/";
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const articles = [];

    for (const [index, element] of $('article.mh-posts-list-item').toArray().entries()) {
      const headline = $(element).find('h3.entry-title a').text().trim();
      const description = $(element).find('.mh-posts-list-excerpt .mh-excerpt').text().trim().replace(/\s{2,}/g, ' ');
      const articleImage = $(element).find('figure img').attr('src');
      const articleUrl = $(element).find('h3.entry-title a').attr('href');
      const dateText = $(element).find('span.entry-meta-date a').text().trim();
      const date = new Date(dateText).toISOString().split('T')[0]; // Convert to yyyy-mm-dd format
      
      const source = "Palestine Chronicle";
      const category = "Palestine";
      const label = await analyzeHeadline(headline);
      const bias = biasAnalyzer(source);
      const relatedCountry = relatedCountryAnalyzer(source);

      const keywords = extractKeywords(headline);
      const content = await getArticleContent(articleUrl);

      articles.push({
        headline,
        description,
        category,
        articleImage,
        articleUrl,
        date,
        label,
        source,
        keywords,
        bias,
        relatedCountry,
        content 
      });

      console.log(`Article ${articles.length}`);
      await delay(75);
    }

    return articles;
  } catch (error) {
    console.error('Error fetching the URL:', error);
    throw error;
  }
};

module.exports = getPalestineChronicleNews;


const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// List of URLs to scrape, with their corresponding bias
const urls = [
  { url: 'https://mediabiasfactcheck.com/center/', bias: 'center' },
  { url: 'https://mediabiasfactcheck.com/left/', bias: 'left' },
  { url: 'https://mediabiasfactcheck.com/leftcenter/', bias: 'left-center' },
  { url: 'https://mediabiasfactcheck.com/right/', bias: 'right' },
  { url: 'https://mediabiasfactcheck.com/right-center/', bias: 'right-center' },
  { url: 'https://mediabiasfactcheck.com/conspiracy/', bias: 'conspiracy' },
  { url: 'https://mediabiasfactcheck.com/fake-news/', bias: 'fake-news' },
  { url: 'https://mediabiasfactcheck.com/satire/', bias: 'satire' },
  { url: 'https://mediabiasfactcheck.com/pro-science/', bias: 'pro-science' }
];

// Function to scrape a single URL
async function scrapeMediaBiasFactCheck(url, bias) {
  try {
    // Fetch the HTML of the page
    const { data } = await axios.get(url);
    
    // Load the HTML into cheerio
    const $ = cheerio.load(data);
    
    // Select all rows within the table
    const rows = $('#mbfc-table tbody tr');

    // Array to hold the results
    const scrapedItems = [];

    // Iterate over each row and extract the necessary data
    rows.each((index, element) => {
      const linkElement = $(element).find('a');
      
      // Extract the headline (source) and URL
      let headline = linkElement.text().trim();
    
      // Extract the source name and the URL within parentheses using regex
      const match = headline.match(/^(.*)\((.*)\)$/);
      if (match) {
        const source = match[1].trim(); // Text before parentheses
        const externalUrl = match[2].trim(); // URL inside parentheses

        // Push the extracted data along with the bias to the results array
        scrapedItems.push({ source, externalUrl, bias });
      }
    });

    // Log the progress for each URL
    console.log(`Scraped ${scrapedItems.length} sources from ${url} with bias: ${bias}`);

    // Return the scraped data from this URL
    return scrapedItems;

  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return [];
  }
}

// Function to scrape all URLs
async function scrapeAllUrls() {
  const allResults = [];

  // Total number of URLs to scrape
  const totalUrls = urls.length;

  // Loop through each URL and scrape it
  for (let i = 0; i < totalUrls; i++) {
    const { url, bias } = urls[i];
    
    console.log(`Processing ${i + 1}/${totalUrls}: Scraping ${url}...`);

    const result = await scrapeMediaBiasFactCheck(url, bias); // Wait for scraping to finish

    // Append results to the main array
    allResults.push(...result);

    // Log overall progress after each URL
    console.log(`Completed ${i + 1}/${totalUrls}: Scraped ${result.length} sources from ${url}`);
  }

  // Final log of all results
  console.log('All scraping completed. Total sources scraped:', allResults.length);

  // Save the results to a JSON file
  fs.writeFile('scrapedData.json', JSON.stringify(allResults, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('Data saved to scrapedData.json');
    }
  });
}

// Call the function to start scraping all URLs
scrapeAllUrls();

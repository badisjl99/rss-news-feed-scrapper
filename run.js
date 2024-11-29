const express = require("express");
const fs = require("fs");
const path = require("path");

const { getBbc } = require("./bbc");
const { getAbc } = require("./abc");
const { getIndiaToday } = require("./indiaToday");
const { getTheGuardian } = require("./theGuardian");
const { getTheLocal } = require("./theLocal");

const app = express();
const port = 3000;

// Function to get the current timestamp
function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Function to scrape data and save it to a JSON file
async function scrapeAndSaveData() {
    const scrapers = [
        { name: "BBC", func: getBbc },
        { name: "The Guardian", func: getTheGuardian },
        { name: "India Today", func: getIndiaToday },
        { name: "The Local", func: getTheLocal },
        { name: "ABC", func: getAbc }
    ];

    const allArticles = [];

    for (const scraper of scrapers) {
        try {
            const articles = await scraper.func();
            allArticles.push(...articles);
        } catch (error) {
            console.error(`Error fetching data from ${scraper.name}:`, error);
        }
    }

    // Define the path for the output JSON file
    const outputPath = path.join(__dirname, `scraped_data_${getTimestamp()}.json`);

    // Save the merged data to a JSON file
    fs.writeFileSync(outputPath, JSON.stringify(allArticles, null, 2));
    console.log(`Data successfully saved to ${outputPath}`);
}

app.get("/gather", async (req, res) => {
    try {
        await scrapeAndSaveData();
        res.status(200).json({ message: "Scraping completed successfully" });
    } catch (e) {
        console.error("Error during scraping:", e);
        res.status(500).json({ message: "An error occurred during scraping", error: e.message });
    }
});

app.listen(port, () => {
    console.log(`Web server running at http://localhost:${port}`);
});
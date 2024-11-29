const express = require("express");
const fs = require("fs");
const path = require("path");

const { getBbc } = require("./scrappers/bbc");
const { getAbc } = require("./scrappers/abc");
const { getIndiaToday } = require("./scrappers/indiaToday");
const { getTheGuardian } = require("./scrappers/theGuardian");
const { getTheLocal } = require("./scrappers/theLocal");

const app = express();
const port = 3000;

// Function to ensure the "data" directory exists
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}

// Function to get timestamp for file naming
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

// Scrape and save data function
async function scrapeAndSaveData() {
    const results = [];

    const scrapers = [
        { name: "ABC", func: getAbc },
        { name: "BBC", func: getBbc },
        { name: "The Guardian", func: getTheGuardian },
        { name: "India Today", func: getIndiaToday },
        { name: "The Local", func: getTheLocal },
    ];

    // Loop through scrapers and fetch data
    for (const { name, func } of scrapers) {
        try {
            const result = await func();
            results.push({ name, success: true, data: result });  // Storing scraped data
        } catch (e) {
            console.error(`Error fetching from ${name}:`, e);
            results.push({ name, success: false, error: e.message });
        }
    }

    // Generate timestamp for the file name
    const timestamp = getTimestamp();
    const filePath = path.join(__dirname, 'data', `scrapedData_${timestamp}.json`);

    // Ensure the "data" directory exists before writing the file
    ensureDirectoryExistence(filePath);

    // Save the results to a file with the timestamped filename
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

    return results;
}

// Endpoint to trigger scraping
app.get("/gather", async (req, res) => {
    try {
        const results = await scrapeAndSaveData();
        res.status(200).json({ message: "Scraping completed successfully", results });
    } catch (e) {
        console.error("Error during scraping:", e);
        res.status(500).json({ message: "An error occurred during scraping", error: e.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Web server running at http://localhost:${port}`);
});

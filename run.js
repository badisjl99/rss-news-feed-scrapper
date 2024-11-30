const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const { getBbc } = require("./bbc");
const { getAbc } = require("./abc");
const { getIndiaToday } = require("./indiaToday");
const { getTheGuardian } = require("./theGuardian");
const { getTheLocal } = require("./theLocal");

const app = express();
const port = 3000;

// Set up EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));  // Ensure this directory exists

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

    const outputPath = path.join(__dirname, `scraped_data_${getTimestamp()}.json`);

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

app.get("/", (req, res) => {
    const dir = path.join(__dirname);
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).send("Error reading directory");
        }

        // Filter files to only include those that start with 'scraped_data'
        const jsonFiles = files.filter(file => file.startsWith('scraped_data') && file.endsWith('.json'));
        res.render("index", { jsonFiles });
    });
});

app.get("/download-json", (req, res) => {
    const dir = path.join(__dirname);
    const output = fs.createWriteStream(path.join(dir, 'scraped_data.zip'));
    const archive = archiver('zip');

    res.attachment('scraped_data.zip');
    archive.pipe(output);

    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).json({ message: "Error reading directory" });
        }

        // Include only files that start with 'scraped_data'
        files.forEach(file => {
            if (file.startsWith('scraped_data') && file.endsWith('.json')) {
                archive.file(path.join(dir, file), { name: file });
            }
        });

        archive.finalize();
    });

    output.on('close', () => {
        console.log(`${archive.pointer()} total bytes`);
        console.log('Zip file has been finalized and the output file descriptor has closed.');
    });

    archive.on('error', err => {
        console.error("Error during archiving:", err);
        res.status(500).json({ message: "Error creating zip file" });
    });
});

app.listen(port, () => {
    console.log(`Web server running at http://localhost:${port}`);
});
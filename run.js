const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const app = express();
const port = 3000;

<<<<<<< HEAD
// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Path to JSON directory
const JSON_DIR = "/opt/render/project/src";

// Route to display JSON files in a download page
app.get("/", (req, res) => {
    fs.readdir(JSON_DIR, (err, files) => {
=======
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

// New endpoint to download all JSON files
app.get("/download-json", (req, res) => {
    const dir = __dirname; // Directory containing JSON files
    const output = fs.createWriteStream(path.join(dir, 'scraped_data.zip'));
    const archive = archiver('zip');

    res.attachment('scraped_data.zip'); // Set the header for file download
    archive.pipe(output);

    // Append JSON files to the archive
    fs.readdir(dir, (err, files) => {
>>>>>>> ff432cec915b8c6e0dd6adba04d7f751e0a03f07
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).send("Error reading directory");
        }

        const jsonFiles = files.filter(file => file.endsWith(".json"));
        res.render("downloadPage", { jsonFiles });
    });
});

// Route to download all JSON files as a zip
app.get("/download-all", (req, res) => {
    const output = fs.createWriteStream(path.join(__dirname, "scraped_data.zip"));
    const archive = archiver("zip");

    res.attachment("scraped_data.zip");
    archive.pipe(res);

    fs.readdir(JSON_DIR, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).send("Error reading directory");
        }

        files.forEach(file => {
            if (file.endsWith(".json")) {
                archive.file(path.join(JSON_DIR, file), { name: file });
            }
        });

        archive.finalize();
    });

<<<<<<< HEAD
    archive.on("error", err => {
=======
    output.on('close', () => {
        console.log(`${archive.pointer()} total bytes`);
    });

    archive.on('error', err => {
>>>>>>> ff432cec915b8c6e0dd6adba04d7f751e0a03f07
        console.error("Error during archiving:", err);
        res.status(500).send("Error creating zip file");
    });
});

// Start the server
app.listen(port, () => {
<<<<<<< HEAD
    console.log(`Server running at http://localhost:${port}`);
=======
    console.log(`Web server running at http://localhost:${port}`);
>>>>>>> ff432cec915b8c6e0dd6adba04d7f751e0a03f07
});

const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const { getBbc } = require("./workers/bbc");
const { getABCNews } = require("./workers/abc");
const { getIndiaToday } = require("./workers/indiaToday");
const { getTheGuardian } = require("./workers/theGuardian");
const { getTheLocal } = require("./workers/theLocal");
const { getTelegraphNews} = require("./workers/telegraph") ;
const { getAlJazeera }= require("./workers/alzajeera") ;
const { getFrance24 } = require("./workers/france24") ;
const { getMosaique } = require("./scrappers/getMosaiqueNews");
const { name } = require("ejs");
const app = express();
const port = 3000;

const jsonDirectory = path.join('/opt/render/project/src');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); 
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
        { name: "ABC", func: getABCNews } ,
        { name: "Al Jazeera", func: getAlJazeera } ,
        {name : "France24" , func : getFrance24 } ,
        { name: "Daily Telegraph", func: getTelegraphNews },
        { name :"Mosaique FM",func:getMosaique }
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

    const outputPath = path.join(jsonDirectory, `scraped_data_${getTimestamp()}.json`);

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
    fs.readdir(jsonDirectory, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).send("Error reading directory");
        }

        const jsonFiles = files.filter(file => file.startsWith('scraped_data') && file.endsWith('.json'));
        res.render("index", { jsonFiles });
    });
});

app.get("/download-json", (req, res) => {
    res.attachment('scraped_data.zip');
    const archive = archiver('zip');
    archive.pipe(res);

    fs.readdir(jsonDirectory, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).json({ message: "Error reading directory" });
        }
        files.forEach(file => {
            if (file.startsWith('scraped_data') && file.endsWith('.json')) {
                archive.file(path.join(jsonDirectory, file), { name: file });
            }
        });

        archive.finalize();
    });

    archive.on('error', err => {
        console.error("Error during archiving:", err);
        res.status(500).json({ message: "Error creating zip file" });
    });
});

app.listen(port, () => {
    console.log(`Web server running at http://localhost:${port}`);
});

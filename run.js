const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const app = express();
const port = 3000;

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Path to JSON directory
const JSON_DIR = "/opt/render/project/src";

// Route to display JSON files in a download page
app.get("/", (req, res) => {
    fs.readdir(JSON_DIR, (err, files) => {
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

    archive.on("error", err => {
        console.error("Error during archiving:", err);
        res.status(500).send("Error creating zip file");
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

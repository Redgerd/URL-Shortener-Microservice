require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const isValidUrl = (url) => {
  const urlRegex = /^(http|https):\/\/[a-zA-Z0-9-\.]+\.[a-z]{2,}(\/\S*)?$/;
  return urlRegex.test(url);
};

// Your first API endpoint
app.post("/api/shorturl", async (req, res) => {
  const originalUrl = req.body.url;

  // Check if the URL is valid
  if (!isValidUrl(originalUrl)) {
    return res.json({ error: "invalid url" });
  }

  try {
    // Check if the URL already exists in the database
    let urlEntry = await Url.findOne({ original_url: originalUrl });

    if (urlEntry) {
      return res.json({
        original_url: urlEntry.original_url,
        short_url: urlEntry.short_url,
      });
    }

    // Get the count of documents in the collection to use as short_url
    const urlCount = await Url.countDocuments({});
    const shortUrl = urlCount + 1;

    // Create a new URL entry in the database
    urlEntry = new Url({
      original_url: originalUrl,
      short_url: shortUrl,
    });

    await urlEntry.save();

    res.json({
      original_url: urlEntry.original_url,
      short_url: urlEntry.short_url,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Redirect to the original URL
app.get("/api/shorturl/:short_url", async (req, res) => {
  const { short_url } = req.params;

  try {
    const urlEntry = await Url.findOne({ short_url });

    if (urlEntry) {
      return res.redirect(urlEntry.original_url);
    } else {
      return res.json({ error: "No URL found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

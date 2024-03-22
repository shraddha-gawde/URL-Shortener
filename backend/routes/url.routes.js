const express = require("express")

const {redisClient} = require("../middlewares/redis.middleware")
const { URLModel } = require("../models/url.model")
const base62 = require('base62')

const urlRouter = express.Router()
const EXPIRATION_TIMES = {
    ONE_HOUR: 3600,
    SIX_HOURS: 21600,
    TWELVE_HOURS: 43200,
    ONE_DAY: 86400
};
urlRouter.post("/original", async (req, res) => {
    try {
        const { originalURL, expirationTime } = req.body;

        // Validate URL
        const validUrlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
        if (!validUrlPattern.test(originalURL)) {
            return res.status(400).json({ Error: "Invalid URL" });
        }

        let count = await redisClient.get("counter");
        let shortURL = base62.encode(count);
        
        let content = {
            originalURL: originalURL,
            shortURL: shortURL
        };
        let newURL = new URLModel(content);

        // Set expiration time
        let expirationInSeconds;
        switch (expirationTime) {
            case '1 hour':
                expirationInSeconds = EXPIRATION_TIMES.ONE_HOUR;
                break;
            case '6 hours':
                expirationInSeconds = EXPIRATION_TIMES.SIX_HOURS;
                break;
            case '12 hours':
                expirationInSeconds = EXPIRATION_TIMES.TWELVE_HOURS;
                break;
            case '1 day':
                expirationInSeconds = EXPIRATION_TIMES.ONE_DAY;
                break;
            default:
                expirationInSeconds = EXPIRATION_TIMES.ONE_DAY; // Default to 1 day
        }

        newURL.expireAt = new Date(Date.now() + (expirationInSeconds * 1000)); // Convert seconds to milliseconds
        await newURL.save();
        await redisClient.incr("counter");
        res.status(200).json({ "newURL": `http://localhost:8080/url/${shortURL}` });
    } catch (error) {
        console.error(error);
        res.status(400).json({ Error: "Error when shortening URL" });
    }
});
urlRouter.get("/:shortURL",async(req,res)=>{
    try {
        let shortURL = req.params.shortURL
        let entry = await URLModel.findOne({shortURL:shortURL})
        
        if(entry){
            let originalURL = entry.originalURL
        res.redirect(originalURL)
        }
        else{
            res.send("URL not found")
        }
        
    } catch (error) {
        res.status(400).send("error when fetching original URL")
    }
})

module.exports={
    urlRouter
}
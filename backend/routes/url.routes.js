const express = require("express")

const {redisClient} = require("../middlewares/redis.middleware")
const { URLModel } = require("../models/url.model")
const base62 = require('base62')

const urlRouter = express.Router()

urlRouter.post("/original",async(req,res)=>{
    try {
        let {originalURL} = req.body
        let count = await redisClient.get("counter")
        let shortURL = base62.encode(count);
        
        let content = {
            originalURL:originalURL,
            shortURL:shortURL
        }
        let newURL = new URLModel(content)
        await newURL.save()
        await redisClient.incr("counter")
        res.status(200).json({"newURL":`http://localhost:8080/${shortURL}`})
    } catch (error) {
        console.log(error)
        res.status(400).json({Error:"Error when shortening URL"})
    }
})

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
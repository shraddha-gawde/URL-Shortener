const express = require("express")
const cors = require("cors")
const path = require("path");
require('dotenv').config()
const PORT = process.env.PORT || 4040
const { connection } = require("./db");
const {redisClient} = require("./middlewares/redis.middleware")

const app = express();
app.use(cors());
app.use(express.json())

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"../index.html"))
})

app.listen(PORT,async()=>{

    try {
        await connection
        console.log("Connected to DB")
        console.log(`Server running at http://localhost:${PORT}`);
    } catch (error) {
        console.log(error)
    }
    
})
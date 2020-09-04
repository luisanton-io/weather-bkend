
let express = require("express")
let fetch = require("node-fetch")

let searchRouter = express()

searchRouter.get("/", async (req, res, next) => {

    try {
        let response = await fetch(process.env.WEATHER_SEARCH_ENDPOINT + req.query.q)
        let results = await response.json()
        res.send(results)
    } catch (error) {
        next(error)
    }

})

module.exports = searchRouter
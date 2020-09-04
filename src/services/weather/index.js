let express = require("express")
let fetch = require("node-fetch")
let weatherRouter = express()

weatherRouter.get("/", async (req,res,next) => {
    let lat = req.query.lat
    let lon = req.query.lon

    try {
        if (!lat || !lon) throw new Error("Invalid coordinates")
    
        let response = await fetch (
            `${process.env.WEATHER_ONECALL_ENDPOINT}&lat=${lat}&lon=${lon}`
        )
    
        let weatherData = await response.json()
    
        res.send(weatherData)
    } catch (error) {
        next(error)
    }

})

module.exports = weatherRouter
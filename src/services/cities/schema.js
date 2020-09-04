const mongoose = require("mongoose")
const { Schema } = mongoose

const CitySchema = new Schema(
    {
        id: {
            type: Number,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        lat: {
            type: Number,
            required: true
        },
        lon: {
            type: Number,
            required: true
        }
    }, { _id : false }
)

const CityModel = mongoose.model("City", CitySchema)
module.exports = CityModel
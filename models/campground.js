const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const CampgroundSchema = new Schema({
    title: String,
    images: String,
    pricing: Number,
    location: String,
    description: String
})

module.exports = mongoose.model("Campground", CampgroundSchema); 
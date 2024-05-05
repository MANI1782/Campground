//ALL IMPORTS
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require("./utils/ExpressError");
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require("./models/reviews");
const Joi = require('joi');


// MONGODB CONNECTION
const db = mongoose.connect('mongodb://localhost:27017/campGroundDB')
    .then(() => {
        console.log("Connected Database")
    })
    .catch((err) => {
        console.log(err);
    })




// EXPRESS CONNECT
const app = express();



// ALL SET USES
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
// EJS MATE SET
app.engine("ejs", ejsMate)



//CAMPGROUND REVIEW DELETE

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);


}))


//Posting reviews

app.post("/campgrounds/:id/reviews", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))



// CAMPGROUND ID GET
app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews");
    console.log(campground)
    res.render("campgrounds/show", { campground })
}))





// ERROR HANDLER

app.all("*", (req, res, next) => {
    next(new ExpressError("404", "Page not found"))
})

// ERROR HANDLER
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong"
    res.status(statusCode).render("error", { err });

});


app.listen(3000, (req, res) => {
    console.log("Started on port 3000");
})
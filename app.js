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


// HOME ROUTE
app.get("/", (req, res) => {
    res.render("home")

})

// CAMPGROUND ROUTE
app.get("/campgrounds", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds })


}))

// NEW CAMPGROUND
app.get("/campgrounds/new", (req, res, next) => {

    res.render("campgrounds/new")
})

// POST NEW CAMPGROUND

app.post("/campgrounds", catchAsync(async (req, res, next) => {
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
        }).required()
    })
    const result = campgroundSchema.validate(req.body);
    if (result.error) {
        throw new ExpressError(result.error.details, 400)
    }


    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`);




}))


// UPDATE CAMPGROUND

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground })
}))
// PUT UPDATE CAMPGROUND

app.put("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })

    res.redirect(`/campgrounds/${campground._id}`)

}))


// CAMPGROUND DELETE

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds")



}))

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
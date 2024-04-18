//ALL IMPORTS
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');


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
app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds })


})

// NEW CAMPGROUND
app.get("/campgrounds/new", (req, res, next) => {

    res.render("campgrounds/new")
})

// POST NEW CAMPGROUND

app.post("/campgrounds", async (req, res, next) => {
    try {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground.id}`);

    } catch (e) {
        next(e)

    }


})

// UPDATE CAMPGROUND

app.get("/campgrounds/:id/edit", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground })
})
// PUT UPDATE CAMPGROUND

app.put("/campgrounds/:id", async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })

    res.redirect(`/campgrounds/${campground._id}`)

})


// CAMPGROUND DELETE

app.delete("/campgrounds/:id", async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds")



})

// ERROR HANDLER

// ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err); // Log the error for debugging
    res.status(500).send("Internal Server Error"); // Send a generic error message to the client
})

// CAMPGROUND ID GET
app.get("/campgrounds/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground })
})


app.listen(3000, (req, res) => {
    console.log("Started on port 3000");
})
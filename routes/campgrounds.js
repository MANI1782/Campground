const express = require("express");
const router = express.Router();


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
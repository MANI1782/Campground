const express = require("express");
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require("../utils/ExpressError");
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor } = require("../middleware");
const multer = require("multer");
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const { cloudinary } = require("../cloudinary")





// CAMPGROUND ROUTE
router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds })


}))

// NEW CAMPGROUND
router.get("/new", isLoggedIn, (req, res, next) => {

    res.render("campgrounds/new")
})




// CAMPGROUND ID GET
router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground);
    if (!campground) {
        req.flash("error", "Cannot find the campground")
        return res.redirect("/campgrounds")
    }

    res.render("campgrounds/show", { campground })
}))



//POST NEW CAMPGROUND//

router.post("/", isLoggedIn, upload.array('image'), catchAsync(async (req, res, next) => {





    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();






    req.flash('success', 'Successfully added the campground');

    res.redirect(`/campgrounds/${campground.id}`);
    console.log(req.body, req.files)
    res.send("It worked")





}))




// UPDATE CAMPGROUND

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);

    res.render("campgrounds/edit", { campground })
}))
// PUT UPDATE CAMPGROUND

router.put("/:id", isLoggedIn, isAuthor, upload.array("image"), catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated');

    res.redirect(`/campgrounds/${campground._id}`)

}))


// CAMPGROUND DELETE

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted');
    res.redirect("/campgrounds")



}))

module.exports = router;







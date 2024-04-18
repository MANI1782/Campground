const mongoose = require("mongoose")
const cities = require("./cities")
const Campground = require("../models/campground");
const { places, descriptors } = require("./seedHelpers")


// MONGODB CONNECTION
const db = mongoose.connect('mongodb://localhost:27017/campGroundDB')
    .then(() => {
        console.log("Connected Database")
    })
    .catch((err) => {
        console.log(err);
    })

const sample = array => array[Math.floor(Math.random() * array.length)];
const seeds = async () => {

    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random = Math.floor(Math.random() * 200)
        const c = new Campground({
            location: `${cities[random].city} , ${cities[random].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: `https://source.unsplash.com/collection/9046579/480x480`,
            description: " Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sequi earum, consequatur expedita quis odio perspiciatis voluptates esse fuga consequuntur voluptatem cumque voluptate corporis quidem? Esse nihil quia nam perspiciatis iusto?"



        })
        await c.save()



    }

}
seeds().then(() => {
    mongoose.connection.close()
})
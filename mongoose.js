
require('dotenv/config');

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,

})

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Error Connecting to Database"));


db.once("open", function () {
    console.log("Successfully connected to Database");
});

module.exports = db;
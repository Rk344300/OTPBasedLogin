
const express = require('express');

//database
const db = require('./mongoose');

require('dotenv/config');

const app = express();

const userRouter = require('./Routers/userRouter');

//middleware
app.use(express.json());

app.use("/api/user/", userRouter);

const port = process.env.PORT || 8000;

app.listen(port, function (error) {
    if (error) {
        console.log(`Error in running the server :${error}`);
        return;
    }

    console.log(`Server is up and running on port : ${port}`);
});

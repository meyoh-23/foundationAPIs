const express = require('express');
const mongoose = require('mongoose');
const usersRouter = require("./routes/userRoute");

// initializing the app
const app = express();
const port = 8000;
DATABASE_CONNECT = "mongodb://127.0.0.1:27017/ICanHelpFoundation";

// middlewares
app.use(express.json({limit:'10kb'}));

// routings
app.use('/api/v1/users', usersRouter);

// connect to databse
const connectDB = async () => {
    try {
        await mongoose.connect( DATABASE_CONNECT, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("DB connection is Successful");
    } catch (error) {
        console.error(error.message);
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});
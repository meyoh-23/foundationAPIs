const express = require('express');
//const dotenv = require('dotenv');
//dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');

// initializing the app
const app = express();
const port = 8000;
DATABASE_CONNECT = "mongodb://127.0.0.1:27017/ICanHelpFoundation";

// basic routing
app.get('/', (req, res) => {
    res.send("hello World");
});

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
const express = require('express');
const mongoose = require('mongoose');
const usersRouter = require("./routes/userRoute");
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// initializing the app
const app = express();
const port = process.env.PORT;

// middlewares
app.use(express.json({limit:'100kb'}));

// routings
app.use('/api/v1/users', usersRouter);

// connect to databse
const connectDB = async () => {
    try {
        await mongoose.connect( process.env.MONGO_DB, {
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
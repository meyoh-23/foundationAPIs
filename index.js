const express = require('express');
const mongoose = require('mongoose');
const usersRouter = require("./routes/userRoute");
const dotenv = require('dotenv');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config({ path: './config.env' });

// initializing the app
const app = express();
const port = process.env.PORT;

// middlewares
app.use(express.json({limit:'100kb'}));
app.use(cors());
app.use(
        '/',
        createProxyMiddleware({
            target: 'http://localhost:8000',
            changeOrigin: true,
        })
    );
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    next();
});
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
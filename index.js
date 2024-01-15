const express = require('express');


// initializing the app
const app = express();


// basic routing
app.get('/', (req, res) => {
    res.send("hello World");
});

// Start the server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
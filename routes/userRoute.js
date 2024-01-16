const express  = require("express");
const router = express.Router();
const userController = require("./../controllers/iserController");

router.post("/sign-up", userController.newUser);


module.exports = router;
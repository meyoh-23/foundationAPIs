const express  = require("express");
const router = express.Router();
const userController = require("./../controllers/iserController");

router.post("/sign-up", userController.newUser);
router.post("/login", userController.login);

module.exports = router;
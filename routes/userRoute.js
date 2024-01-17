const express  = require("express");
const router = express.Router();
const userController = require("./../controllers/iserController");

router.post("/sign-up", userController.newUser);
router.post("/login", userController.login);
router.post("/activate-account", userController.activateAccount);

module.exports = router;
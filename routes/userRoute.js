const express  = require("express");
const router = express.Router();
const userController = require("./../controllers/iserController");

router.post("/sign-up", userController.newUser);
router.post("/login", userController.login);

// account activation prompt
// account activation
router.post("/activate-account", userController.activateAccount);
router.patch('/activate-account/:token', userController.initializeAccount);

module.exports = router;
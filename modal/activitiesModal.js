const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema( {

});

const Activity = mongoose.models("Activity", activitySchema);
module.exports = Activity;
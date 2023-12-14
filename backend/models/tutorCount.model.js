const mongoose = require("mongoose")

const tutorCountSchema = new mongoose.Schema({
    count: {
        type: Number,
        required: true,
    },
});


const TutorCountModel = mongoose.model('TutorCount', tutorCountSchema);

module.exports = { TutorCountModel };
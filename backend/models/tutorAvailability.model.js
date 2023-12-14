const mongoose = require("mongoose")

const tutorAvailabilitySchema = new mongoose.Schema({
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastPingTime: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false }, // Assuming a field for online status
    // Add more fields as needed
});

const TutorAvailabilityModel = mongoose.model('TutorAvailability', tutorAvailabilitySchema);

module.exports = { TutorAvailabilityModel };




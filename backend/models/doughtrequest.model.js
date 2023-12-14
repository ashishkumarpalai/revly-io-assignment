const mongoose = require("mongoose")

const doughtRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    question: { type: String, required: true },
    doubtSubject:{ type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    // Add more fields as needed
});

const DoubtRequestModel = mongoose.model('dought', doughtRequestSchema);

module.exports = { DoubtRequestModel };








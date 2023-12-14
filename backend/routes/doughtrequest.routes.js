const express = require("express")

const { DoubtRequestModel } = require("../models/doughtrequest.model")
const { UserModel } = require("../models/user.model")
const { authenticate } = require("../middleware/auth.middleware")

const doubtrequestRouter = express.Router()

doubtrequestRouter.get("/", authenticate, (req, res) => {

    res.send(req.body.user)
})

// Doubt History API (accessible to authenticated users only)
doubtrequestRouter.get('/doubt-history', authenticate, async (req, res) => {
    try {
        const userId = req.body.user; // Extracted from the JWT token

        const doubtHistory = await DoubtRequestModel.find({ userId }).sort({ timestamp: -1 })

        res.json(doubtHistory);
    } catch (error) {
        console.error('Error fetching doubt history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Doubt History API (accessible to authenticated users only)
doubtrequestRouter.get('/doubt-all', authenticate, async (req, res) => {
    try {

        const doubtHistory = await DoubtRequestModel.find().sort({ timestamp: -1 })

        res.json(doubtHistory);
    } catch (error) {
        console.error('Error fetching doubt history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
//dought created
doubtrequestRouter.post('/doubt-create', authenticate, async (req, res) => {
    try {
        const { question, doubtSubject } = req.body;
        const userId = req.body.user; // Extract user ID from the authenticated user (assuming the middleware sets req.user)

        // Check if the user has the required user type (e.g., 'user')
        const user = await UserModel.findById(userId);
        if (!user || user.userType !== 'Student') {
            return res.status(403).json({ error: 'Permission denied. Only Students post doubts.' });
        }

        const newDoubt = new DoubtRequestModel({
            userId,
            question,
            doubtSubject,
        });

        await newDoubt.save();

        res.status(201).json({ message: 'Doubt posted successfully' });
    } catch (error) {
        console.error('Error posting doubt:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = { doubtrequestRouter }
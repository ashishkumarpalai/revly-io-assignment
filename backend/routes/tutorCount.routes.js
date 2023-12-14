// routes/tutorCount.routes.js
const express = require('express');

const { TutorCountModel } = require('../models/tutorCount.model');

const  tutorCountRouter  = express.Router()
// GET route to retrieve the tutor count
tutorCountRouter.get('/count', async (req, res) => {
    try {
        // Retrieve the tutor count from the database
        const tutorCount = await TutorCountModel.findOne();

        if (!tutorCount) {
            return res.status(404).json({ message: 'Tutor count not found' });
        }

        res.json({ tutorCount: tutorCount.count });
    } catch (error) {
        console.error('Error retrieving tutor count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = { tutorCountRouter };

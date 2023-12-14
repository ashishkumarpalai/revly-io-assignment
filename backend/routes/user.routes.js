const express = require("express")

const { UserModel } = require("../models/user.model")
const { TutorAvailabilityModel } = require("../models/tutorAvailability.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { authenticate } = require("../middleware/auth.middleware")
const cron = require('node-cron');

const userRouter = express.Router()

// Get all users with related data (posts and tasks)
userRouter.get("/", authenticate, async (req, res) => {
    try {
        const allUsers = await UserModel.find()
        res.status(200).json(allUsers);
    } catch (error) {
        res.status(500).json({ "msg": "Something went wrong", "error": error.message });
    }
});

//get Porticuar User
userRouter.get("/:userId", authenticate, async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await UserModel.findById(userId); // Use 'tasks' here if you want to populate tasks for this user
        if (!user) {
            return res.status(404).json({ "msg": "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ "msg": "Something went wrong", "error": error.message });
    }
});

// Update user information
userRouter.put("/:userId", authenticate, async (req, res) => {
    const userId = req.params.userId;
    const updateData = req.body;

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ "msg": "User not found" });
        }

        res.status(200).json({ "msg": "User updated successfully", "user": updatedUser });
    } catch (error) {
        res.status(500).json({ "msg": "Something went wrong", "error": error.message });
    }
});

// Delete user
userRouter.delete("/:userId", authenticate, async (req, res) => {
    const userId = req.params.userId;

    try {
        const deletedUser = await UserModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ "msg": "User not found" });
        }

        res.status(200).json({ "msg": "User deleted successfully", "user": deletedUser });
    } catch (error) {
        res.status(500).json({ "msg": "Something went wrong", "error": error.message });
    }
});
// Register a new user
userRouter.post("/register", async (req, res) => {
    const { name, email, password, userType, language, subjectExpertise, classGrade } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ "msg": "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new UserModel({ name, email, password: hashedPassword, userType, language, subjectExpertise, classGrade });
        await newUser.save();

        res.status(201).json({ "msg": "New user has been registered" });
    } catch (error) {
        res.status(500).json({ "msg": "Something went wrong", "error": error.message });
    }
});

// Login an existing user
userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ "msg": "Wrong Credentials" });
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ "msg": "Wrong Password" });
        }

        // Create and send a JWT token upon successful login
        const token = jwt.sign({ userID: user._id }, "masai", { expiresIn: "1h" });

        // If the user is a tutor, update their online status in TutorAvailabilityModel
        if (user.userType === "Tutor") {
            let tutorAvailability = await TutorAvailabilityModel.findOne({ tutorId: user._id });

            // If the entry does not exist, create it
            if (!tutorAvailability) {
                tutorAvailability = new TutorAvailabilityModel({
                    tutorId: user._id,
                    isOnline: true,
                    lastPingTime: Date.now(),
                });

                await tutorAvailability.save();
            } else {
                // If the entry exists, update it
                await TutorAvailabilityModel.updateOne(
                    { tutorId: user._id },
                    { isOnline: true, lastPingTime: Date.now() }
                );
            }
        }

        res.status(200).json({ "msg": "Successfully logged in", "token": token, "user": user._id, "name": user.name, "email": user.email });
    } catch (error) {
        res.status(500).json({ "msg": "Something went wrong", "error": error.message });
    }
});

// Logout user
userRouter.post("/logout", authenticate, async (req, res) => {
    try {
        const userId = req.body.user;

        // Get the user to check their userType
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ "msg": "User not found" });
        }else if(user.userType === "Student"){
            return res.status(404).json({ "msg": "you are not Tutor" });
        }

        // If the user is a tutor, update their online status in TutorAvailabilityModel
        if (user.userType === "Tutor") {
            const tutorAvailability = await TutorAvailabilityModel.findOne({ tutorId: userId });

            if (tutorAvailability) {
                // Update the tutor's availability to false
                await TutorAvailabilityModel.updateOne(
                    { tutorId: userId },
                    { isOnline: false, lastPingTime: Date.now() }
                );
            }
        }


        res.status(200).json({ "msg": "Successfully logged out" });
    } catch (error) {
        res.status(500).json({ "msg": "Something went wrong", "error": error.message });
    }
});

// Schedule a task to run every hour
// cron.schedule('0 * * * *', async () => {
//     try {
//         // Update availability for tutors inactive for one hour
//         const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // One hour ago
//         await TutorAvailabilityModel.updateMany(
//             { lastPingTime: { $lt: oneHourAgo }, isOnline: true },
//             { isOnline: false }
//         );
//     } catch (error) {
//         console.error("Error updating tutor availability:", error);
//     }
// });

module.exports = { userRouter }
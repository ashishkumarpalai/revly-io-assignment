// Import required libraries and modules
const express = require("express")
const { connection } = require("./configs/db")
const { userRouter } = require("./routes/user.routes")
const {doubtrequestRouter}=require("./routes/doughtrequest.routes")
const {tutorCountRouter}=require("./routes/tutorCount.routes")
const {TutorAvailabilityModel}=require("./models/tutorAvailability.model")
const{TutorCountModel}=require("./models/tutorCount.model")
const { authenticate } = require("./middleware/auth.middleware")
const socketIo = require('socket.io');
const http = require('http');
const cron = require('node-cron');
const cors = require("cors")

require("dotenv").config()

// Create an Express application
const app = express()
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json())
app.use(cors())
// app.use(express.static('./public')); // Serve static files from the 'public' directory

// Define a basic route for the root endpoint
app.get("/", async (req, res) => {
    res.send(`<h1 style="text-align: center; color: blue;">Wellcome To Revly.io DoubtShare (Real-Time Doubt Solving Platform)</h1>`)
    console.log("Wellcome Real-Time Doubt Solving Platform")
})

// Use the userRouter for user registration and login
app.use("/user", userRouter)

// Use the doubtrequestRouter for user all dought 
app.use("/dought",doubtrequestRouter)

//use the tutorCountRouter for count how many tutor online
app.use("/",tutorCountRouter)

// cron.schedule('* * * * * *', async () => {
//     try {
//         const availableTutorsCount = await TutorAvailabilityModel.countDocuments({ isOnline: true });

//         // Emit the real-time tutor count to connected clients
//         io.emit('tutorCount', availableTutorsCount);
//         // console.log(`Real-time available tutors: ${availableTutorsCount}`);
//         // console.log('Tutor ping times updated successfully.');
//     } catch (error) {
//         console.error('Error updating tutor ping times:', error);
//     }
// });

cron.schedule('* * * * * *', async () => {
    try {
        const availableTutorsCount = await TutorAvailabilityModel.countDocuments({ isOnline: true });

        // Update the tutor count in the database
        await TutorCountModel.updateOne({}, { count: availableTutorsCount }, { upsert: true });

        // console.log('Tutor count updated successfully.');
    } catch (error) {
        console.error('Error updating tutor count:', error);
    }
});

// Polling function to update Tutor's latest ping time every 3 seconds
cron.schedule('*/3 * * * * *', async () => {
    try {
        const tutors = await TutorAvailabilityModel.find({ isOnline: true });

        for (const tutor of tutors) {
            // Update each tutor's latest ping time
            await TutorAvailabilityModel.updateOne(
                { _id: tutor._id },
                { lastPingTime: Date.now() }
            );
        }

        // console.log('Tutor ping times updated successfully.');
    } catch (error) {
        console.error('Error updating tutor ping times:', error);
    }
});
// Uncomment the next line if you want to add authentication middleware
app.use(authenticate);
app.get("/a", async (req, res) => {
    res.send(req.body.user);
})
// Start the server, listen to the specified port
app.listen(process.env.port, async () => {
    try {
        await connection
        console.log("DataBase is connected")
    } catch (error) {
        console.log(error.message)
    }
    console.log(`server is running on port ${process.env.port}`)
})
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        enum: ['Student', 'Tutor'],
        default: 'Student', // Default value set to 'Student'
        required: true
    },
    language: {
        type: String,
        default: null
    },
    subjectExpertise: {
        type: String,
        default: null
    },
    classGrade: {
        type: String,
        default: null
    },
    
});

const UserModel = mongoose.model("user", userSchema)

module.exports = { UserModel }



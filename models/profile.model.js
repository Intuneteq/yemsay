const mongoose = require('mongoose');
const { Schema } = mongoose

const ProfileSchema = new Schema({
    fullName: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Profile', ProfileSchema);
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
}, {
    timestamps: true  // automatically create createdAt and updatedAt
});


User.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

module.exports = User;
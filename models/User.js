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
    fileUrl:[
        {
            path : String,
            fileId : String,
            _id : false,
        }
    ],
quizInteractions: [{
  questionIndex: { type: Number },
  question: { type: String },
  type: { type: String },
  known: { type: Boolean },
  marked: { type: Boolean },
  markTimestamp: { type: Date },
  fixed: { type: Boolean },
  fixedTimestamp: { type: Date },
  timestamp: { type: Date }
}]

}, {
    timestamps: true  // automatically create createdAt and updatedAt
});


userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

module.exports = User;
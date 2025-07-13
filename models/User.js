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
    generatedContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GeneratedContent"
    }
  ]

}, {
    timestamps: true  // automatically create createdAt and updatedAt
});


userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

module.exports = User;
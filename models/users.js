const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});


userSchema.plugin(passportLocalMongoose);



const userModel = mongoose.model('3mtt-users', userSchema);

module.exports = userModel;
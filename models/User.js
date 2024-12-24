const mongoose = require('mongoose');
const Schema = mongoose.Schema

//Create Schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,

    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('users', UserSchema) //this create the schema for 'users' (the name we want) in the mongodb with the column we specified in the Schema(UserSchema) above


//the convention of naming the schema files is to be single and starts with capital letter like this file "User.js"
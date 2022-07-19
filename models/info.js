const mongoose = require('mongoose');

const infoSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    employeeID:{
        type: Number,
        unique: true
    },
    phnnumber:{
        type: Number,
        unique: true
    }
})

const Info = mongoose.model('info',infoSchema)

module.exports = Info
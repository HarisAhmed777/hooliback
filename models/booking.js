const mongoose = require('mongoose');

const BookingsSchema = new mongoose.Schema({
    name:String,
    age:String,
    email:String,
    persons:Number,
    city:String,
    startdate:Date,
    enddate :Date,
    adults:Number,
    children:Number,
    totalamount:Number
})

const BookingModel = mongoose.model("bookings",BookingsSchema)
module.exports = BookingModel;
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const ticketSchema = new mongoose.Schema(
    {
        image: {
            data: Buffer,
            contentType: String
        },
        artistName: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        seat: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        venue: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        city: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        state: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        seller: {
            type: ObjectId,
            ref: "User",
            required: true
        },
        price: {
            type: Number,
            trim: true,
            required: true,
            maxlength: 32
        },
        genre: {
            type: ObjectId,
            ref: "Genre",
            required: true
        },
        quantity: {
            type: Number
        },
        status: {
            type: Boolean   //for the countdown timer to start
        },
        concertDate: {  //should turn into date
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        shipping: {
            required: false,
            type: Boolean
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tickets", ticketSchema);

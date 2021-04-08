const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            maxlength: 32
        },
        lastName: {
            type: String,
            trim: true,
            maxlength: 32
        },
        email: {
            type: String,
            trim: true,
            required: true,
        },
        address: {
            type: String,
        },
        country: {
            type: String,
        },
        total: {
            Number,
        },
        cartItems: [{
            _id: String,
            title: String,
            price: Number,
            count: Number
        }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
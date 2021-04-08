const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const genreSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
            unique: true
        },
        // user: {
        //     type: ObjectId,
        //     ref: "User",
        //     required: true
        // }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Genre", genreSchema);

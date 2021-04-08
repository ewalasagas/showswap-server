const mongoose = require('mongoose');
const crypto = require('crypto');
const { v1: uuidv1 } = require('uuid');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    lastName: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: 32
    },
    hashed_password: {
        type: String,
        required: true
    },
    salt: String,   //used to generate hashed password
    role: {
        type: Number,
        default: 0      //0 is any user, admin is 1
    },
    rating: {
        type: Number,   //this is the star rating of user
        default: 0      
    },
    history: {  //to store history of purchase history
        type: Array,
        default: []
    }
    }, {timestamps: true}
);

//virtual field
userSchema.virtual('password')  //sending password from client side
.set(function(password) {
    this._password = password;
    this.salt = uuidv1();   //will give us a randomg string
    this.hashed_password = this.encryptPassword(password);
})
.get(function() {
    return this._password
})

userSchema.methods = {
    authenticate: function(plainText) {
        const a = this.encryptPassword(plainText);
        const b = this.hashed_password;
        return (a === b);
    },

    encryptPassword: function(password) {       //to encrypt password function
        if(!password) return "";
        try {
            return crypto.createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')
        } catch (error) {
            return "";
        }
    }
};

module.exports = mongoose.model("User", userSchema);
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const expressValidator = require('express-validator');
const session = require('express-session');
const MongoDBStore = require("connect-mongo")(session);

require('dotenv').config();

//Importing Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const genreRoutes = require("./routes/genre");
const ticketRoutes = require("./routes/tickets");
const braintreeRoutes = require("./routes/braintree");
const orderRoutes = require("./routes/order");

//App
const app = express();

//allow cors policy for now
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

//Connecting to database
mongoose.connect(
    process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}). then(() => console.log('DB Connected'));


const store = new MongoDBStore ({
    url:  process.env.MONGO_URI,
    secret: process.env.JWT_SECRET,
    touchAfter: 24 * 60 * 60    //refresh on a whole day
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));

//Add middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());

//Routes middlewares
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", genreRoutes);
app.use("/api", ticketRoutes);
app.use("/api", braintreeRoutes);
app.use("/api", orderRoutes);

app.use(cors());


const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
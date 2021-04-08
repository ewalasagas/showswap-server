const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Ticket = require('../models/tickets');
const { userById } = require('../controllers/user');


exports.ticketById = (req, res, next, id) => {
    Ticket.findById(id).exec((err, ticket) => {
            if (err || !ticket) {
                return res.status(400).json({
                    error: 'ticket not found'
                });
            }
            req.ticket = ticket;
            next();
        });
};

exports.read = (req, res) => {
    req.ticket.image = undefined;  //don't want to send because of the size
    return res.json(req.ticket);
};


exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true; //whatever image we're getting ,extensions will be there
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }

        //populate seller.id w/ user informaton
       let seller = req.params.userId;
       console.log(seller);

        //Check that all fields are accurate
        const {artistName, seat, venue, city, state, price, genre, quantity, concertDate, shipping} = fields
        if(!artistName || !seat || !venue || !city || !state || !price || !genre || !quantity || !concertDate || !shipping) {
            return res.json(400).json({
                error: "All fields are required"
            })
        }
        
        let ticket = new Ticket({...fields, seller});

        //what about the files? 
        if (files.image) {
            //SIZE: 1kb = 1000, but 1mb = 1000000
            //console.log('FILES image: ', files.image);
            if(files.image.size > 1000000) {
                return res.json(400).json({
                    error: "Image should be less than 1mb in size"
                })
            }
            ticket.image.data = fs.readFileSync(files.image.path);
            ticket.image.contentType = files.image.type;
        }

        ticket.save((err, result) => {
            if (err) {
                console.log('TICKET CREATE ERROR ', err);
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

//remove
exports.remove = (req, res) => {
    let ticket = req.ticket;
    ticket.remove((err, deletedTicket) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            // deletedTicket,
            "message" : "Ticket deleted successfully!"
        })
    })
}


//update
exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true; //whatever image we're getting ,extensions will be there
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }

        //Check that all fields are accurate
        const {artistName, seat, venue, city, state, price, genre, quantity, concertDate, shipping} = fields
        if(!artistName || !seat || !venue || !city || !state || !price || !genre || !quantity || !concertDate || !shipping) {
            return res.json(400).json({
                error: "All fields are required"
            })
        }

        let ticket = req.ticket;
        ticket = _.extend(ticket, fields);    //use _.extend method from LODASH

        //what about the files? lets handl that here
        if (files.image) {
            //SIZE: 1kb = 1000, but 1mb = 1000000
            //console.log('FILES image: ', files.image);
            if(files.image.size > 1000000) {
                return res.json(400).json({
                    error: "Image should be less than 1mb in size"
                })
            }
            ticket.image.data = fs.readFileSync(files.image.path);
            ticket.image.contentType = files.image.type;
        }

        ticket.save((err, result) => {
            if (err) {
                console.log('TICKET CREATE ERROR ', err);
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};


//list
exports.list = (req, res) => {
    let order = req.query.order ? req.query.order:'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy:'_id';
    // let limit = req.query.limit ? parseInt(req.query.limit): 6;

    Ticket.find()
        .select("-ticket")
        .populate('genre')
        .sort([[sortBy, order]])
        // .limit(limit)
        .exec((err, tickets) => {
            if(err) {
                return res.status(400).json({
                    error: "Tickets not found"
                });
            };
            res.send(tickets);
        });
};

exports.listTicketsByUser = (req, res) => {
    // let limit = req.query.limit ? parseInt(req.query.limit): 6;
    let filter = req.query.filter ? req.query.filter:'seller';

    Ticket.find()
        .select("-ticket")
        .populate('genre')
        .sort([[filter]])
        // .limit(limit)
        .exec((err, tickets) => {
            if(err) {
                return res.status(400).json({
                    error: "Tickets not found"
                });
            };
            res.send(tickets);
        });
};
/*
* Sell/arrival
* by sell = /tickets?sortBy=sold&order=desc&limit=4
* by arrival = /tickets?sortBy=createdAt&order=desc&limit=4
* if no params are sent, than all tickets are returned
*/

/*Will find the tickets based on the req ticket genre
* other tickets that has same genre will be returned
*/
//listRelated
exports.listRelated = (req, res) => {
    // let limit = req.query.limit ? parseInt(req.query.limit): 6;

    //$ne means not including
    Ticket.find({_id: {$ne: req.ticket}, genre: req.ticket.genre})
    // .limit(limit)
    .populate('genre', '_id name')
    .exec((err, tickets) => {
        if(err) {
            return res.status(400).json({
                error: "Tickets not found"
            });
        };
        res.send(tickets);
    });
}

//listGenres
exports.listGenres = (req, res) => {
    Ticket.distinct('genre', {}, (err, genres) => {
        if (err) {
            return res.status(400).json({
                error: 'Genres not found'
            });
        }
        res.json(genres);
    });
};

//listBySearch

/* LIST TICKETS BY SEARCH
- Will implement ticket search in react frontend
- Will show genres in checkbox and price range in radio buttons
- As user clicks on those checkbox and radio buttons
- We will make API request and show the tickets to the user based on what she wants
*/
exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};  //will be populated once request is made
 
    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
 
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
 
    ticket.find(findArgs)
        .select("-image")
        .populate("genre")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Tickets not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};


//image is undefined
exports.image = (req, res, next) => {
    if(req.ticket.image.data) {
        res.set('Content-Type', req.ticket.image.contentType)
        return res.send(req.ticket.image.data)
    }
    next();
};
const express = require("express");
const router = express.Router();

const { create, ticketById, read, remove, update, list, listTicketsByUser, listRelated, listGenres, listBySearch, image} = require('../controllers/tickets');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');


router.get("/ticket/:ticketId", read);
router.post("/ticket/create/:userId", requireSignin, isAuth, create);
router.delete("/ticket/:ticketId/:userId", requireSignin, isAuth, isAdmin, remove);
router.put("/ticket/:ticketId/:userId", requireSignin, isAuth, update);

//search for tickets
router.post("/tickets/by/search", listBySearch);

//to get all the tickets
router.get('/tickets', list) 
router.get('/tickets/related/:ticketId', listRelated);
router.get('/tickets/genres', listGenres);
router.get('/ticket/photo/:ticketId', image);

//get ticket by user
router.get('/tickets/:userId', userById);

router.param('userId', userById);
router.param("ticketId", ticketById);

module.exports = router;
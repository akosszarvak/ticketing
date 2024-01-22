const express = require("express");
const router = express.Router();

const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
} = require("../controllers/ticketController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getTickets);
router.route("/:id").get(protect, getTicket);
router.route("/").post(protect, createTicket);
router.route("/:id").delete(protect, deleteTicket);
router.route("/:id").put(protect, updateTicket);

module.exports = router;

const express = require("express");
// const cors = require("cors");
const dotenv = require("dotenv").config();
const db = require("./db/db");
const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.use("/api/users", require("./routes/userRoutes"));
// app.use("/api/tickets", require("./routes/ticketRoutes"));

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

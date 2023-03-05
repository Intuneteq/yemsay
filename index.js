//import dependencies here
require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const mongoose = require("mongoose");

//import utils
const corsOptionsDelegate = require("./utils/corsOptions");
const connectDB = require("./utils/dbConnect");

//import custom middlewares

//import custom routes
const authRoutes = require('./routes/authRouter');
const propertyRoutes = require('./routes/propertyRouter');

//Define middlewares
const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

//use middlewares
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.use(bodyParser.json());

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(compression());

//static assests
app.use("/", express.static(path.join(__dirname, "/public")));

//use custom middlewares

//use routes
app.get("/api", (req, res) => {
  res.send("Welcome to yemsay server");
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/property', propertyRoutes);


//invalid routes
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "public", "404.html"));
  } else if (req.accepts("json")) {
    console.log("json");
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

//connect to server
mongoose.connection.once("open", () => {
  console.log("Connected to DB");
  app.listen(PORT, () => console.log(`server running on port ${PORT}`));
});
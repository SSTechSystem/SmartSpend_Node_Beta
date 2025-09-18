const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./config/dbconfig');
const routes = require('./routes/index');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/public", express.static(path.join("./public")));
app.use("/uploads", express.static(path.join("./uploads")));
app.use(
  cors({
    origin: "*",
  })
);

app.use('/', routes);

app.use((_, res) => {
  res.status(405).json({
    statusCode: 405,
    success: false,
    type: "Error",
    message: "Method Not Allowed",
    data: {},
  });
});

const PORT = 2000;
app.listen(PORT,() => {
    console.log(`Server is running on port : ${PORT}`);
});
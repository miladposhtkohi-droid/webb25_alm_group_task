const express = require("express");
const connectDB = require("./config/database");
const UserRouter = require("./routes/User");
const AccommodationRouter = require("./routes/accommodationRoutes");


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/users", UserRouter);

app.use("/accommodations", AccommodationRouter);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

module.exports = app;

const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/mongo_connect");
const userRoute = require("./routes/user");
const adminRoute = require("./routes/admin");
const itemRoute = require("./routes/order");

const app = express();

app.use(morgan('dev'));

app.use(express.json({}));
app.use(express.json({
    extented: true
}));

dotenv.config({
    path:'./config/config.env'
});

connectDB();

app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.use("/item", itemRoute);


const PORT = process.env.PORT || 7000;

app.listen(PORT, 
    console.log(`Server running on  Port :${PORT}`));
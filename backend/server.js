const express = require('express');
const app = express();
const cors = require("cors")
const dbConnect = require("./config/dbConnect")
const User = require("./models/userSchema")
const UserRoutes = require("./routes/userRoutes")
const BlogRoutes = require("./routes/blogRoutes");
const CloudinaryConfig = require('./config/cloudinaryConfig');
require("dotenv").config()

const PORT = process.env.PORT

app.use(express.json());
app.use(cors())
app.use("/api/v1",UserRoutes);
app.use("/api/v1",BlogRoutes)

app.listen(PORT,()=>{
    console.log("server started")
    dbConnect(process.env.DB_URL)
    CloudinaryConfig()
})
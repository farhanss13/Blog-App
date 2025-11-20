const express = require('express');
const app = express();
const cors = require("cors")
const dbConnect = require("./config/dbConnect")
const User = require("./models/userSchema")
const UserRoutes = require("./routes/userRoutes")
const BlogRoutes = require("./routes/blogRoutes")

app.use(express.json());
app.use(cors())
app.use("/api/v1",UserRoutes);
app.use("/api/v1",BlogRoutes)

app.listen(3000,()=>{
    console.log("server started")
    dbConnect()
})
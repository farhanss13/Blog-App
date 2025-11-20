const express = require("express")
const User = require("../models/userSchema")
const {createUser,getUsers,getUsersById,updateUser,deleteUser}=require("../controllers/userController")
const route  = express.Router()
route.post("/users",createUser)
route.get("/users",getUsers)
route.get("/users/:id",getUsersById);
route.patch("/users/:id",updateUser );
route.delete("/users/:id",deleteUser );
module.exports = route
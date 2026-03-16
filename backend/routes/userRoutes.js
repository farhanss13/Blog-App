const express = require("express")
const User = require("../models/userSchema")
const {createUser,getUsers,getUsersById,updateUser,deleteUser, login, updateProfile}=require("../controllers/userController")
const verifyUser = require("../middlewares/auth")
const upload = require("../utilities/multer")
const route  = express.Router()
route.post("/signup",createUser)
route.post("/signin",login)
route.get("/users",getUsers)
route.get("/users/:id",getUsersById);
route.patch("/users/:id",updateUser );
route.delete("/users/:id",deleteUser );
route.patch("/profile", verifyUser, upload.single("avatar"), updateProfile);
module.exports = route
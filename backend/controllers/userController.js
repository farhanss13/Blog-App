const User = require("../models/userSchema")
 
async function createUser(req, res){
  console.log(req.body)
    const {name,email, password} = req.body;
    try{
        if(!name){
            return res.status(400).json({success: false, message: 'Name is required'})
        }
         if(!email){
            return res.status(400).json({success: false, message: 'Email is required'})
        }
         if(!password){
            return res.status(400).json({success: false, message: 'Password is required'})
        }
        const checkExistingUser = await User.findOne({email})
        if(checkExistingUser){
          res.status(200).json({success:false,message:'User Already Existed!'})
        }
        const newUser = await User.create({
          name,
          email,
          password
        })
        return res.status(200).json({success:true,message:'User Created Successfully',newUser})

    }catch(error){
        console.error(error);
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
    }

async function getUsers (req,res){
        try{
            const users = await User.find({}) 
            return res.status(200).json({success:true,message:"Users fetched Successfully",users})
        }catch(err){
            return res.status(400).json({success:false,message:"Internal server error",message:err.message})
        }
    }
 async function getUsersById (req, res)  {
  try {
    const id = req.params.id;
    const user = await User.findById(id); 

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "User fetched successfully", user });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
async function updateUser (req, res)  {
  try {
    const id = req.params.id;
  const{name,email,password}=req.body;
  const updatedUser = await User.findByIdAndUpdate(id,{name,email,password})
  return res
      .status(200)
      .json({ success: true, message: "User fetched successfully", updatedUser});
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Please Try Again" });
  }
}
async function deleteUser (req, res)  {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
module.exports = {createUser,getUsers,getUsersById,updateUser,deleteUser};
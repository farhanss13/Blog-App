const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const { generateJWT } = require("../utilities/generateToken");  

async function createUser(req, res) {
  const { name, email, password } = req.body;

  try {
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    if (!password) return res.status(400).json({ success: false, message: "Password is required" });

    const checkExistingUser = await User.findOne({ email });
    if (checkExistingUser) {
      return res.status(400).json({ success: false, message: "User Already Existed!" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPass,
    });

    const token = await generateJWT({
     email: newUser.email,
     id: newUser._id,
});
    return res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      token,  
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}


async function login(req, res) {
  const { email, password } = req.body;

  try {
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    if (!password) return res.status(400).json({ success: false, message: "Password is required" });

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    }

    const token = await generateJWT({
    email: user.email,
    id: user._id,
});


    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        name: user.name,
        email: user.email,
      },
      token,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getUsers(req, res) {
  try {
    const users = await User.find({}).select("-password");
    return res.status(200).json({ success: true, message: "Users fetched successfully", users });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getUsersById(req, res) {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User fetched successfully", user });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function updateUser(req, res) {
  try {
    const id = req.params.id;
    let { name, email, password } = req.body;

    if (password) {
      password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
 
    return res.status(200).json({ success: true, message: "User updated successfully", updatedUser });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deleted successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  createUser,
  getUsers,
  getUsersById,
  updateUser,
  deleteUser,
  login,
};

const { verifyJWT } = require("../utilities/generateToken");

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Please sign in",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please sign in",
      });
    }

    const user = await verifyJWT(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = user; 
    console.log(user);

    next(); 
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = verifyUser;

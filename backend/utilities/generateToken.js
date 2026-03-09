const jwt = require("jsonwebtoken")
require("dotenv").config()

function generateJWT(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" })
}

function verifyJWT(token) {
    try {
        jwt.verify(token, process.env.JWT_SECRET)
        return true
    } catch (error) {
        return false
    }
}

function decodeJWT(token) {
    return jwt.decode(token)
}

module.exports = { generateJWT, verifyJWT, decodeJWT }

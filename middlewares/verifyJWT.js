const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
    // Use req.header to get access token 
    const authHeader = req.headers.authorization || req.headers.Authorization; // This should return "Bearer TOKEN_VAL"

    // Check if token does not exist
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "You are unauthorized!" });
    }

    const token = authHeader.split(" ")[1]; // Split will return ["Bearer", "TOKEN_VAL"]

    // Verify if token is valid
    jwt.verify(token, process.env.ACCESSTOKEN_SECRET, (err, decoded_val) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Token expired" });
            } else {
                return res.status(403).json({ message: "Forbidden (invalid token)" });
            }
        }else{

            // Send user info if token is valid to be visible to all coming middleware
            // Otherwise, we should do that by sending a request to the database, 
            // which could impact performance with multiple requests.
            req.user = decoded_val.UserInfo.id;
    
            // Proceed to the next middleware
            next();
        }

    });
};

module.exports = verifyJWT;

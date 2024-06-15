const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            console.error("JWT verification failed:", err.message);
            return res.sendStatus(403); // Forbidden
        }
        req.user = decodedToken; // Attach decoded token payload to request object
        next();
    });
};

module.exports = authenticateToken;

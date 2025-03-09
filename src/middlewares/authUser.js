const jwt = require('jsonwebtoken');
require('dotenv').config();

const authUser = (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "User not authenticated"
            });
        }

        const verifiedUser = jwt.verify(token, process.env.SECRET_KEY);
        if (!verifiedUser) {
            return res.status(401).json({
                success: false,
                error: "User not authenticated"
            });
        }

        req.user = verifiedUser.data;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Authentication failed try Again'
        });
    }
}

module.exports = { authUser }
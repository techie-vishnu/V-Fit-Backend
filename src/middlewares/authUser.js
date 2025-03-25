const jwt = require('jsonwebtoken');
require('dotenv').config();

const authUser = (req, res, next) => {
    try {
        let { token } = req.cookies;
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

        const newToken = jwt.sign({ data: verifiedUser.data }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', newToken);

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            error: error.message || 'Authentication failed try Again'
        });
    }
}

module.exports = { authUser }
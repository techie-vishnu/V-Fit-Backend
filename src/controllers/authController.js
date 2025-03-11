
const User = require('../models/userModel');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



exports.registerUser = async (req, res) => {
    try {
        const { name, username, email, mobile, password, confirmPassword, gender } = req.body;
        const user = await User.findOne({ $or: [{ username: username.trim() }, { email: email.trim() }] });

        if (user) {
            let error = 'User exists';
            if (user.username === username.trim() && user.email === email.trim()) {
                error = 'Already registered user. Try login with username/email.';
            } else if (user.username === username.trim()) {
                error = 'Username already exists';
            } else if (user.email === email.trim()) {
                error = 'Email already registered. Try login with email.';
            }
            return res.status(405).json({
                success: false,
                error: error
            });
        } else {
            const hashedPwd = bcrypt.hashSync(password, 10);
            const user = new User({ name, username, email, mobile, password: hashedPwd, gender });
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: "User created successfully."
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

exports.usernameExists = async (req, res) => {
    const { username } = req.body;
    try {
        const user = User.findOne({ username: username.trim() });

        if (user) {
            return res.status(200).json({
                success: false,
                error: 'Username already exists.'
            });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Username Ok'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

exports.emailExists = async (req, res) => {
    const { email } = req.body;
    try {
        const user = User.findOne({ email: email.trim() });

        if (user) {
            return res.status(200).json({
                success: false,
                error: 'User registration exists with this email.'
            });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Email Ok'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const userExists = await User.findOne({
            $or: [{ username: username.trim() }, { email: username.trim() }]
        });

        if (!userExists) {
            return res.status(401).json({
                success: false,
                error: 'Username or password is wrong.'
            });
        }

        const passwordMatch = bcrypt.compareSync(password, userExists.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Username or password is wrong.'
            });
        }

        const token = jwt.sign({ data: userExists }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token);
        userExists.last_login = Date.now();
        await userExists.save();

        const userData = {
            id: userExists._id,
            name: userExists.name,
            username: userExists.username,
            email: userExists.email,
            mobile: userExists.mobile,
            roles: userExists.roles
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            userId: userExists._id,
            data: userData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Authentication failed try Again'
        });
    }
}

exports.logout = (req, res) => {
    try {
        /* 
        You may want to perform additional
        cleanup or session invalidation here
        */
        res.clearCookie('token');

        return res.status(200).json({
            success: true,
            error: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

exports.userProfile = async (req, res) => {
    try {
        const { email } = req.user;
        const userData = await User.findOne({ email }).select(["-_id", "-password", "-__v"]);

        if (!userData) {
            return res.status(404).json({
                success: false,
                error: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (deletedUser) {
            return res.status(200).json({ success: true, message: "User deleted successfully." });
        } else {
            return res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, username, email, mobile, password, confirmPassword } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(405).json({
                success: false,
                error: 'User do not exists.'
            });
        }

        if (name) {
            user.name = name;
        }
        if (email) {
            if (user.email !== email.trim()) {
                const emailExists = await User.findOne({ email: email.trim() });
                if (emailExists) {
                    return res.status(405).json({
                        success: false,
                        error: 'Email already exists.'
                    });
                }
            }
            user.email = email.trim();
        }
        if (username) {
            if (user.username !== username.trim()) {
                const usernameExists = await User.findOne({ username: username.trim() });
                if (usernameExists) {
                    return res.status(405).json({
                        success: false,
                        error: 'Username already exists.'
                    });
                }
            }
            user.username = username.trim();
        }
        if (mobile) {
            if (user.mobile !== mobile) {
                const mobileExists = await User.findOne({ mobile });
                if (mobileExists) {
                    return res.status(405).json({
                        success: false,
                        error: 'Mobile number already exists.'
                    });
                }
            }
            user.mobile = mobile;
        }
        if (password) {
            const hashedPwd = bcrypt.hashSync(password, 10);
            user.password = hashedPwd;
        }

        user.updatedAt = Date.now();
        await user.save();

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        let { limit, page } = req.query;
        limit = parseInt(limit ?? 50);
        page = parseInt(page ?? 1);
        const offset = (page - 1) * limit;

        const users = await User.find()
            .select(["-password", "-__v"])
            .sort({ lastLogin: -1 })
            .skip(offset)
            .limit(limit);
        
        return res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

exports.assignUserRole = async (req, res) => {
    try {
        let { id } = req.params;
        let { roles } = req.query;

        const user = await User.findById(id);
        if (!user) {
            return res.status(405).json({
                success: false,
                error: 'User do not exists.'
            });
        }

        let currentRoles = user.roles;

        user.updated = req.user._id;
        await user.save();

        return res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

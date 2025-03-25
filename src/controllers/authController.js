
const User = require('../models/userModel');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



exports.registerUser = async (req, res, next) => {
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
        next(error)
    }
}

exports.usernameExists = async (req, res, next) => {
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
        next(error)
    }
}

exports.emailExists = async (req, res, next) => {
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
        next(error)
    }
}

exports.login = async (req, res, next) => {
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
        next(error)
    }
}

exports.logout = (req, res, next) => {
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
        next(error)
    }
}

exports.userProfile = async (req, res, next) => {
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
        next(error)
    }
}

exports.getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select(["-password", "-__v"]);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found."
            });
        }
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error)
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (deletedUser) {
            return res.status(200).json({ success: true, message: "User deleted successfully." });
        } else {
            return res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        next(error)
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, username, email, mobile, gender, roles, password, confirmPassword } = req.body;

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
        if (gender) {
            user.gender = gender;
        }
        if (roles && Array.isArray(roles) && roles.length > 0) {
            const currentRoles = user.roles;
            const isAdmin = currentRoles.indexOf('Admin') !== -1;
            // Connot Remove admin role of a Admin user
            if (isAdmin && roles.indexOf('Admin') !== -1) {
                return res.status(405).json({
                    success: false,
                    error: 'You cannot remove Admin role of the User.'
                });
            }

            let newRoles = [];
            roles.forEach((role, i) => {
                if (newRoles.indexOf(role) !== -1) {
                    newRoles.push(role);
                }
            });

            user.roles = newRoles;
        }
        if (password) {
            if (password !== confirmPassword) {
                return res.status(405).json({
                    success: false,
                    error: 'Passwords do not match.'
                });
            }
            const hashedPwd = bcrypt.hashSync(password, 10);
            user.password = hashedPwd;
        }

        user.updatedAt = Date.now();
        await user.save();

        return res.status(200).json({ success: true, message: "User updated successfully." });
    } catch (error) {
        next(error)
    }
}

exports.getAllUsers = async (req, res, next) => {
    try {
        // Pagination
        let { limit, page, q, sortBy, sortDir } = req.query;
        limit = parseInt(limit ?? 50);
        page = parseInt(page ?? 1);
        const offset = (page - 1) * limit;

        // User Search Query
        let query = {};
        if (q && q !== '') {
            query = {
                $or: [
                    { name: { $regex: q, $options: "i" } },
                    { email: { $regex: q, $options: "i" } },
                    { username: { $regex: q, $options: "i" } }
                ]
            }
        }

        // Column Sorting
        let sort = { lastLogin: -1 };
        if (sortBy && sortDir) {
            const dir = sortDir === 'desc' ? -1 : 1;
            switch (sortBy) {
                case '_id':
                    sort = { _id: dir }
                    break;
                case 'name':
                    sort = { name: dir }
                    break;
                case 'username':
                    sort = { username: dir }
                    break;
                case 'email':
                    sort = { email: dir }
                    break;
                case 'gender':
                    sort = { gender: dir }
                    break;
                default:
                    break;
            }
        }

        // Total Records for Pagination
        const total = await User.countDocuments(query);

        // Fetch Users
        const users = await User.find(query)
            .select(["-password", "-__v"])
            .sort(sort)
            .skip(offset)
            .limit(limit);

        return res.status(200).json({
            success: true,
            users,
            total
        });

    } catch (error) {
        next(error)
    }
}

exports.assignUserRole = async (req, res, next) => {
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
        next(error)
    }
}

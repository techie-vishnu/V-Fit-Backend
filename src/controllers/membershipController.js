const Membership = require("../models/membershipModel");
const MembershipPlan = require("../models/membershipPlanModel");
const User = require("../models/userModel");


exports.addMembership = async (req, res) => {
    try {
        const { planId, userId, price, startDate, personalTraining, paymentStatus, status } = req.body;

        const plan = await MembershipPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'planId is not valid'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'userId is not valid'
            });
        }

        // Calculate End date
        let calculatedEndDate = new Date(startDate);
        let duration = 0;
        let type = 'days';
        switch (plan.durationUnit) {
            case "Year":
                duration = plan.duration * 12;
                type = 'months';
                break;
            case "Months":
                duration = plan.duration;
                type = 'months';
                break;
            case "Month":
                duration = plan.duration;
                type = 'months';
                break;
            default:
                duration = plan.duration;
                break;
        }
        if (type === 'months') {
            calculatedEndDate.setMonth(calculatedEndDate.getMonth() + duration);
        } else {
            calculatedEndDate.setDate(calculatedEndDate.getDate() + duration);
        }

        let m = {
            planId, userId, price, startDate, endDate: calculatedEndDate, createdBy: req.user._id, updatedBy: req.user._id
        }

        if (personalTraining) {
            m.personalTraining = personalTraining;
        }
        if (paymentStatus) {
            m.paymentStatus = paymentStatus;
        }
        if (status) {
            m.status = status;
        }

        const membership = new Membership(m);

        await membership.save();

        return res.status(200).json({
            success: true,
            message: 'Membership added successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.updateMembership = async (req, res) => {
    try {
        const { id } = req.params;
        const { planId, userId, price, startDate, personalTraining, paymentStatus, status } = req.body;

        const membership = await Membership.findById(id);

        if (!membership) {
            return res.status(404).json({
                success: false,
                error: 'membershipId is not valid'
            });
        }

        const plan = await MembershipPlan.findById(planId ?? membership.planId);
        if (planId) {
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    error: 'planId is not valid'
                });
            }
            membership.planId = planId;
        }

        if (userId) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'userId is not valid'
                });
            }
            membership.userId = userId;
        }

        if (price) {
            membership.price = price;
        }

        if (startDate) {
            membership.startDate = startDate;

            let calculatedEndDate = new Date(startDate);
            let duration = 0;
            let type = 'days';
            switch (plan.durationUnit) {
                case "Year":
                    duration = plan.duration * 12;
                    type = 'months';
                    break;
                case "Months":
                    duration = plan.duration;
                    type = 'months';
                    break;
                case "Month":
                    duration = plan.duration;
                    type = 'months';
                    break;
                default:
                    duration = plan.duration;
                    break;
            }
            if (type === 'months') {
                calculatedEndDate.setMonth(calculatedEndDate.getMonth() + duration);
            } else {
                calculatedEndDate.setDate(calculatedEndDate.getDate() + duration);
            }
            membership.endDate = calculatedEndDate;
        }

        if (personalTraining) {
            membership.personalTraining = personalTraining;
        }
        if (paymentStatus) {
            membership.paymentStatus = paymentStatus;
        }
        if (status) {
            membership.status = status;
        }

        await membership.save();

        return res.status(200).json({
            success: true,
            message: 'Membership updated successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.getAllMemberships = async (req, res) => {
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
                    { name: { $regex: q, $options: "i" } }
                ]
            }
        }

        // Column Sorting
        let sort = { updatedAt: -1 };
        if (sortBy && sortDir) {
            const dir = sortDir === 'desc' ? -1 : 1;
            switch (sortBy) {
                case '_id':
                    sort = { _id: dir }
                    break;
                case 'name':
                    sort = { name: dir }
                    break;
                case 'price':
                    sort = { price: dir }
                    break;
                case 'duration':
                    sort = { duration: dir }
                    break;
                case 'personalTraining':
                    sort = { personalTraining: dir }
                    break;
                case 'createdAt':
                    sort = { createdAt: dir }
                    break;
                case 'updatedAt':
                    sort = { updatedAt: dir }
                    break;
                default:
                    break;
            }
        }

        // Total Records for Pagination
        const total = await Membership.countDocuments(query);

        const memberships = await Membership.find(query)
            .sort({ createdAt: -1, endDate: -1 })
            .populate({ path: 'userId', model: 'User', select: '_id name username' })
            .populate({ path: 'planId', model: 'MembershipPlan', select: '_id name price duration durationUnit' })
            .populate({ path: 'createdBy', model: 'User', select: '_id name username' })
            .populate({ path: 'updatedBy', model: 'User', select: '_id name username' })
            .skip(offset)
            .limit(limit);

        return res.status(200).json({
            success: true,
            memberships,
            total
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.getMyMemberships = async (req, res) => {
    try {

        let { limit, page } = req.query;
        limit = limit ?? 50;
        page = page ?? 1;
        const offset = (page - 1) * limit;

        let memberships = await Membership.find({ userId: req.user._id })
            .sort({ createdAt: -1, endDate: -1 })
            .skip(offset)
            .limit(limit);

        return res.status(200).json({
            success: true,
            data: memberships
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.getMembershipById = async (req, res) => {
    try {
        let { id } = req.params;
        let membership = await Membership.findById(id);
        if (!membership) {
            return res.status(404).json({
                success: false,
                error: 'Membership not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: membership
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.deleteMembership = async (req, res) => {
    try {
        const { id } = req.params;
        let membership = await Membership.findById(id);
        if (!membership) {
            return res.status(404).json({
                success: false,
                error: 'Membership not found'
            });
        }

        membership.status = "Canceled";
        membership.updatedBy = req.user._id;

        await membership.save();

        res.status(200).json({
            success: true,
            message: "Membership deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.addMembershipPlan = async (req, res) => {
    try {
        const { name, price, personalTraining, duration, durationUnit } = req.body;

        const plan = await MembershipPlan.findOne({ name, personalTraining, status: true });
        if (plan) {
            return res.status(404).json({
                success: false,
                error: 'Membership Plan already exists'
            });
        }

        const membership = new MembershipPlan({
            name, price, personalTraining, duration, durationUnit, createdBy: req.user._id, updatedBy: req.user._id
        });

        await membership.save();

        return res.status(200).json({
            success: true,
            message: 'Membership Plan added successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.updateMembershipPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, personalTraining, duration, durationUnit } = req.body;

        let plan = await MembershipPlan.findById(id);
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'planId is invalid'
            });
        }

        if (name) {
            plan.name = name.trim();
        }
        if (price) {
            plan.price = parseFloat(price);
        }
        if (personalTraining) {
            plan.personalTraining = personalTraining;
        }
        if (duration) {
            plan.duration = duration;
        }
        if (durationUnit) {
            plan.durationUnit = durationUnit;
        }

        plan.updatedBy = req.user._id;

        await plan.save();

        return res.status(200).json({
            success: true,
            message: 'Membership Plan updated successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.getMembershipPlans = async (req, res) => {
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
                    { name: { $regex: q, $options: "i" } }
                ]
            }
        }

        // Column Sorting
        let sort = { updatedAt: -1 };
        if (sortBy && sortDir) {
            const dir = sortDir === 'desc' ? -1 : 1;
            switch (sortBy) {
                case '_id':
                    sort = { _id: dir }
                    break;
                case 'name':
                    sort = { name: dir }
                    break;
                case 'price':
                    sort = { price: dir }
                    break;
                case 'duration':
                    sort = { duration: dir }
                    break;
                case 'personalTraining':
                    sort = { personalTraining: dir }
                    break;
                case 'createdAt':
                    sort = { createdAt: dir }
                    break;
                case 'updatedAt':
                    sort = { updatedAt: dir }
                    break;
                default:
                    break;
            }
        }

        // Total Records for Pagination
        const total = await MembershipPlan.countDocuments(query);

        const plans = await MembershipPlan.find(query)
            .select(["-__v"])
            .populate({ path: 'createdBy', model: 'User', select: '_id name username' })
            .populate({ path: 'updatedBy', model: 'User', select: '_id name username' })
            .sort(sort)
            .skip(offset)
            .limit(limit);

        return res.status(200).json({
            success: true,
            plans,
            total
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.getMembershipPlanById = async (req, res) => {
    try {
        let { id } = req.params;
        const plan = await MembershipPlan.findById(id);
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Membership Plan not found'
            });
        }
        return res.status(200).json({
            success: true,
            plan
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.deleteMembershipPlan = async (req, res) => {
    try {
        const { id } = req.params;
        let membership = await MembershipPlan.findById(id);
        if (!membership) {
            return res.status(404).json({
                success: false,
                error: 'Membership Plan not found'
            });
        }

        membership.status = false;
        membership.updatedBy = req.user._id;

        await membership.save();

        res.status(200).json({
            success: true,
            message: "Membership Plan deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}
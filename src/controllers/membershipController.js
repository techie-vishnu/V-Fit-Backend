const Membership = require("../models/membershipModel");
const MembershipPlan = require("../models/membershipPlanModel");
const User = require("../models/userModel");


exports.addMembership = async (req, res) => {
    try {
        const { planId, userId, price, startDate, endDate } = req.query;

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

        const membership = new Membership({
            planId, userId, price, startDate, endDate: calculatedEndDate
        });

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
        const { membershipId, planId, userId, price, startDate, endDate } = req.query;

        const membership = await Membership.findById(membershipId);

        if (!membership) {
            return res.status(404).json({
                success: false,
                error: 'membershipId is not valid'
            });
        }

        if (planId) {
            const plan = await MembershipPlan.findById(planId);
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
            let calculatedEndDate = new Date();
            calculatedEndDate.setDate(Date(startDate).getDate() + plan.duration);
            membership.endDate = calculatedEndDate;
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

        let { limit, page } = req.query;
        limit = limit ?? 50;
        page = page ?? 1;
        const offset = (page - 1) * limit;

        let memberships = await Membership.find().sort({ createdAt: -1, endDate: -1 }).skip(offset).limit(limit);

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

exports.getMyMemberships = async (req, res) => {
    try {

        let { limit, page } = req.query;
        limit = limit ?? 50;
        page = page ?? 1;
        const offset = (page - 1) * limit;

        let memberships = await Membership.find({ userId: res.user._id })
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
        const { planId } = req.params;
        const { name, price, personalTraining, duration, durationUnit } = req.query;

        const plan = await MembershipPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'planId is invalid'
            });
        }

        if (name) {
            plan.name = name;
        }
        if (price) {
            plan.price = price;
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
        let { limit, page } = req.query;
        limit = limit ?? 50;
        page = page ?? 1;
        const offset = (page - 1) * limit;

        const plans = await MembershipPlan.find().skip(offset).limit(limit);

        return res.status(200).json({
            success: true,
            data: plans
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
        let membership = await MembershipPlan.findById(id);
        if (!membership) {
            return res.status(404).json({
                success: false,
                error: 'Membership Plan not found'
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
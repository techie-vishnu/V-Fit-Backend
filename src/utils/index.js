const { default: mongoose } = require("mongoose");

exports.validateId = (req, res, next) => {
    let { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id))
        next()
    else
        return res.status(405).json({ status: false, error: 'id is not valid' })
}
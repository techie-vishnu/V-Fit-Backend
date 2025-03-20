

const handleGenericErrors = (error, req, res, next) => {
    try {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Someting went wrong, Please try again';

        return res.status(statusCode).json({
            success: false,
            message: message
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Someting went wrong, Please try again'
        });
    }
}

module.exports = { handleGenericErrors };
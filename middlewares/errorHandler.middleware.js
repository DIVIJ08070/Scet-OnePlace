const errorHandler = (err, req, res, next) => {
    return res.status(err.statusCode || 500).json(err);
}

module.exports = {errorHandler}
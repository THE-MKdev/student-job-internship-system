const authenticate = (req, res, next) => {
    if (req.session && req.session.user) {
        //attach user info request for convienence
        req.userId = req.session.userId;
        req.role = req.session.role;
        return next();
    }

    return res.status(401).json({ message: 'Authentication required'});
};

//ensure user has one of the allowed roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (req.session && req.session.user && roles.includes(req.session.user.role)) {
            return next();
        }

        return res.status(403).json({ message: 'Forbidden: insufficient permissions'});
    };
};

module.exports = { authenticate, authorize}
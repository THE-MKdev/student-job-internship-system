const bycrypt = require('bcrypt');

const hashPassword = async (password) => {
    return bycrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
    return bycrypt.compare(password, hash);
};

module.exports = {hashPassword, comparePassword}
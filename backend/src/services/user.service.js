const User = require("../models/user");

exports.getUsers = async () => {
    return await User.find();
}

exports.getUserById = async (id) => {
    return await User.findById(id);
};

exports.checkAccountExists = async (account) => {
    const user = await User.findOne({ account: account });
    return !!user;  // Trả về true nếu có, false nếu không
};

exports.createUser = async (data) => {
    return await User.create(data);
}

exports.updateUser = async (id, data) => {
    return await User.findByIdAndUpdate(id, data, { new: true });
}

exports.saveUser = async (user) => {
    return await user.save();
}

exports.deleteUser = async (id) => {
    return await User.findByIdAndDelete(id);
}

exports.deleteAllUser = async () => {
    return await User.deleteMany();
}
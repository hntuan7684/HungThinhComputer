const userService = require("../services/user.service.js");
const bcrypt = require("bcrypt");

exports.getUsers = async (req, res) => {
    try {
        const user = await userService.getUsers();
        if(!user) {
            return res.status(500).json({ message: "No Users found!"});
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error while fetching Users:", error.message);
        return res.status(500).json({ message: "Internal server error!"});
    }
}

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        if(!user) {
            return res.status(404).json({ message: "User not found!"});
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error while fetching user:", error.message);
        return res.status(500).json({ message: "Internal server error!"});
    }
}

exports.createUser = async (req, res) => {
    try {
        const data = req.body;
        const account = await userService.checkAccountExists(data.account);
        if(account) {
            return res.status(409).json({
                message: "Account user already exists!",
            })
        }
        const saltRounds = 10;
        const password = await bcrypt.hash(data.password, saltRounds);
        
        const updateData = {
            ...data,
            password
        }
        const user = await userService.createUser(updateData);

        if(!user) {
            return res.status(500).json({ message: "Could not create user!"});
        } 
        return res.status(200).json({
            message: "Create user successfully!",
            user
        })
    } catch (error) {
        console.error("Error while creating user:", error.message);
        return res.status(500).json({ message: "Internal server error!"});
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const userExist = await userService.getUserById(id);
        if(!userExist) {
            return res.status(404).json({ message: "User not found!"});
        }
        const update = await userService.updateUser(id, data);
        if(!update) {
            return res.status(500).json({ message: "Could not update user!"});
        }
        return res.status(200).json({
            message: "Update user successfully!",
            user: update,
        })
    } catch (error) {
        console.error("Error while updating user:", error.message);
        return res.status(500).json({ message: "Internal server error!"});
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const existUser = await userService.getUserById(id);
        if(!existUser) {
            return res.status(404).json({ message: "User not found!"});
        }
        const user = await userService.deleteUser(id);
        if(!user) {
            return res.status(500).json({ message: "Could not delete user!"});
        }
        return res.status(200).json({
            message: "Delete user successfully!"
        });
    } catch (error) {
        console.error("Error while deleting user:", error.message);
        return res.status(500).json({ message: "Internal server error!"});
    }
}

exports.deleteAllUser = async (req, res) => {
    try {
        const deleteUser = await userService.deleteAllUser();
        if(!deleteUser) {
            return res.status(500).json({ message: "Could not delete all users!"});
        }
        return res.status(200).json({
            message: "Delete all users successfully!",
        });
    } catch (error) {
        console.error("Error while deleting all users:", error.message);
        return res.status(500).json({ message: "Internal server error!"});
    }
}

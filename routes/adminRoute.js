const express = require("express");
const route = express.Router();
const adminController = require("../controllers/adminController");
route.post("/signup", adminController.signup);
route.get("/list", adminController.getAllAdmins);
route.post("/register", adminController.register);
route.post("/login", adminController.login);
route.post("/logout", adminController.logout);

//export route
module.exports = route;

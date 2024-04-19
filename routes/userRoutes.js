const express =require("express")
const router = express.Router()
const userController= require("../controllers/usersController")
const verifyJWT = require("../middlewares/verifyJWT")

// apply middelware firdst to check if user is authrized 
router.use(verifyJWT)

router.route("/").get(userController.getAllUsers)



module.exports = router
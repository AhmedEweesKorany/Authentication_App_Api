const User = require("../models/User")

const getAllUsers = async(req,res)=>{
   if(req.user){
    const users = await User.find().select("-password").lean()
    if(!users.length) return res.status(404).json({message:"no user found"})
    return res.status(200).json({users})
   }
   return res.status(401).json({message:"you are not authorized !"})
}


module.exports = {
    getAllUsers
} 
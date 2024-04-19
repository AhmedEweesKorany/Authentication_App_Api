const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
// register endpoint
const register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  //check if all feilds are filled correctly
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: "All feilds are required ya m3lm" });
  }

  // check if user is alread exist or not
  const foundUser = await User.findOne({ email }).exec();
  if(foundUser){
    res.status(401).json({ message: "user already exists" })
  } else{
 // start creatign new user if he doesn't exist and start by hashing user password
 const hashedPassword = await bcrypt.hash(password,10)

 const user = await User.create({first_name,last_name,email,password:hashedPassword})

 // start generating accessToken after creating user
 const accessToken = jwt.sign({
   UserInfo:{
       id:user._id
   }
 },process.env.ACCESSTOKEN_SECRET,{expiresIn: "15m" })

 const refreshToken = jwt.sign({
   UserInfo:{
       id:user._id
   }
 },process.env.REFRESHTOKEN_SECRET,{expiresIn:"7d"})

 res.cookie("jwt",refreshToken,{
   httpOnly:true ,// make it accssiable only by web server
   secure:true ,// access only using https ==> ( production step )
   sameSite:"none" ,// send cookie to main and suboamin __________ "strict" option means it send cookie to the main domain only (subDomain won't recive anything) 
   maxAge: 1000 * 60 * 60 *24*7 // expire date 
 })

 res.json({accessToken,email:user.email,first_name:user.first_name,last_name:user.last_name})
};

}

// creatinglogin endpoint
const login = async(req,res)=>{
  const {email,password} = req.body
  if(!email|| !password) return res.status(400).json({message:"all feilds are required"})
  // find user by email
  const foundUser = await User.findOne({email})

  // if user not found return message with user not found 
  if(!foundUser){
    return res.status(404).json({message:"user not found"})
  }else{

    // if user is exist now we check if it's password is correct
    const checkPassword = await bcrypt.compare(password,foundUser.password)
    // handle if password isn't correct 
    if(!checkPassword)    return res.status(401).json({message:"invalid password"})
    
    // successful login if correct password

 // start generating accessToken after creating user
 const accessToken = jwt.sign({
  UserInfo:{
      id:foundUser._id
  }
},process.env.ACCESSTOKEN_SECRET,{expiresIn: "15m" })

const refreshToken = jwt.sign({
  UserInfo:{
      id:foundUser._id
  }
},process.env.REFRESHTOKEN_SECRET,{expiresIn:"7d"})

res.cookie("jwt",refreshToken,{
  httpOnly:true ,// make it accssiable only by web server
  secure:true ,// access only using https ==> ( production step )
  sameSite:"none" ,// send cookie to main and suboamin __________ "strict" option means it send cookie to the main domain only (subDomain won't recive anything) 
  maxAge: 1000 * 60 * 60 *24*7 // expire date 
})

res.json({accessToken,email:foundUser.email})
  }
}

// refresh token endpoint 

const refresh = async(req,res)=>{
  const cookies = req.cookies

  // check if there is no refresh token stored in cookies ___ (to know if user is already exist but his access token is expired)
  if(!cookies?.jwt){
    return res.status(401).json({ message: "You are unauthorized!" });
  }

  // check if refresh token is valid
  jwt.verify(cookies.jwt,process.env.REFRESHTOKEN_SECRET,async(err,decoded_val)=>{
    if (err) {
      if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: "Refresh Token expired" });
      } else {
          return res.status(403).json({ message: "Forbidden (invalid token)" });
      }
  }else{
    // use id from token to find the targeted user 
    const foundUser = await User.findById(decoded_val.UserInfo.id).exec()
    if(!foundUser) return res.status(401).json({ message: "You are unauthorized!" });

    //generate new access token for user
    const accessToken = jwt.sign({
      UserInfo:{
          id:foundUser._id
      }
    },process.env.ACCESSTOKEN_SECRET,{expiresIn: "15m" })

    res.status(200).json({accessToken})
  }
  })
}

// init logout endpoint 

const logout = (req,res)=>{
  const cookies = req.cookies
  if(!cookies?.jwt){
    return res.sendStatus(204) // which indicate there is no content 
  }
  res.clearCookie("jwt",{
    httpOnly:true ,// make it accssiable only by web server
    secure:true ,// access only using https ==> ( production step )
    sameSite:"none" ,// send cookie to main and suboamin
  })

  // logged out !
  return res.json({message:"successful logout"})
}

module.exports = {
  register,login,refresh,logout
}
 

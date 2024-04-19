// import dependencies
require("dotenv").config()
const express =require('express')
const app= express()
const port = process.env.PORT || 3010;
const cors = require("cors")
const corsOptions = require("./config/corsOptions")
const cookieParser = require("cookie-parser")
const path = require("path")
const mongoose = require("mongoose")
const connectDb =require("./config/dbConn");

// adding middlewars 
app.use(express.json())
app.use(cors(corsOptions))
app.use(cookieParser())

//connecting to database
connectDb()

// using express.stactics to apply linking with css file
app.use("/",express.static(path.join(__dirname,"public")))

// init  routes as middleware
app.use("/",require("./routes/root"))
app.use("/auth",require("./routes/authRoutes"))
app.use("/users",require("./routes/userRoutes"))



// error handlign for unexpected routes
app.all("*",(req,res)=>{
    res.status(404)
    if(req.accepts("html")){
        res.sendFile(path.join(__dirname,"views","404.html"))
    }else if(req.accepts("json")){
        res.json({message:"page not found"})
    }else{res.type("txt").send("page not found")}
})
// handle errors
mongoose.connection.on("error",(e)=>{
    console.log(e)
})

// init server if database is connected succeffully 
mongoose.connection.once("open",()=>{
    app.listen(port,()=>{
        console.log(`app is runnging at http://localhost:${port}`)
    })
})
const mongoose = require("mongoose")

// connceting to datadbase
const connectDb = async()=>{
    try{
        console.log("connected to db !!")
        await mongoose.connect(process.env.DATABASE_UEL)

    }catch(e){
        console.log("err from databse",e)
    }
}
module.exports = connectDb
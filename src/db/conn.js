const mongoose=require("mongoose")
mongoose.connect(process.env.DB_CONNECTION).then(()=>{              //connection code is written inside the .env file
    console.log("connection successfull")
}).catch((e)=>{
    console.log("no connection")
})

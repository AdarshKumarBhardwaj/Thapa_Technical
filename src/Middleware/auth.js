//this is used to provide restriction on secret page which can be access only after login
const jwt=require("jsonwebtoken")
const productmodel=require("../models/register")

const auth=async(req,resp,next)=>{
    try{
          const token=req.cookies.jwt;
          const verifyuser=jwt.verify(token,process.env.SECRET)   //verification of user is done here
           console.log(verifyuser)
          
           const user=await productmodel.findOne({_id:verifyuser._id})
           console.log(user)
          //for logout
           req.token=token;
           req.user=user;
           next()
    }catch(error){
       resp.status(401).send(error) 
    }
}

module.exports=auth;
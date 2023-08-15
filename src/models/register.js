  
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); //for hashing
const jwt = require("jsonwebtoken"); //for authentication
const productschema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cpassword: {
    type: String,
    required: true,
  },
  //for authentication jwt
  tokens:[{
    token:{
      type: String,
      required: true,
    }
  }]
});




//authentication using jwt token
productschema.methods.generateAuthToken = async function () {
  try {
    const token =  jwt.sign(
      { _id: this._id.toString()},process.env.SECRET);    //secret key is written inside .env file
    this.tokens=this.tokens.concat({token:token})
    await this.save()
    return token;
  } catch (error) {
    resp.send("the error part is" + error);
    console.log("the error part is" + error);
  }
};








// hashing code this is applied on before save
productschema.pre("save", async function (next) {
  if (this.isModified("password")) {
    //when password is modified then hashing of password is done
    this.password = await bcrypt.hash(this.password, 10);
    this.cpassword = await bcrypt.hash(this.password, 10); //value of conferm password not show in database
  }
  next();
});

const productmodel = mongoose.model("curds", productschema);
module.exports = productmodel;

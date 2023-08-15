require("dotenv").config(); //for securing our secret key of authentication
const express = require("express");
const app = express();
app.use(express.json());
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser"); //it is used to get the value of cookie
app.use(cookieparser());
const auth = require("./Middleware/auth"); //this is used to provide restriction on secret page which can be access only after login
app.use(express.urlencoded({ extended: false })); //this is used to access the content of body

const hbs = require("hbs"); //this is used because we use partials
const productmodel = require("./models/register");
require("./db/conn");
const port = process.env.PORT || 5000;

const path = require("path");
const publicpath = path.join(__dirname, "../public");
const viewpath = path.join(__dirname, "../template/views");
const partialpath = path.join(__dirname, "../template/partials");

app.use(express.static(publicpath));

app.set("view engine", "hbs");
app.set("views", viewpath);
hbs.registerPartials(partialpath); //this is used because we use partials

const bcrypt = require("bcrypt"); //this is used for hashing and get by npm in

// console.log(process.env.SECRET)  //this gives the value of secret key

app.get("/", (req, resp) => {
  resp.render("index");
});

app.get("/secret", auth, (req, resp) => {
  // console.log(`this is the cookie awesome ${req.cookies.jwt}`)            //this is used to get the value of cookie using cookie-parser
  resp.render("secret");
});

app.get("/logout", auth,async (req, resp) => {
  try {
    console.log(req.user)
    //for single devices
    // req.user.tokens=req.user.tokens.filter((currelement)=>{       //for removing tokens from database
    //    return  currelement.token !=req.token
    // })

    // for multiple devices logout 

    req.user.tokens=[];

    resp.clearCookie("jwt");         //it is used for logout remove cookie
    console.log("logout successfully");
    await req.user.save();
    resp.render("login")

  } catch (error) {
    resp.status(500).send(error);
  }
});

app.get("/register", (req, resp) => {
  resp.render("register");
});

app.post("/register", async (req, resp) => {
  const password = req.body.password;
  const cpassword = req.body.cpassword;
  if (password == cpassword) {
    const data = new productmodel({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
      cpassword: req.body.cpassword,
    });

    //jwt authentication
    const Token = await data.generateAuthToken();
    console.log("register token is" + Token);

    //this is used to store tokens in cookies
    resp.cookie("jwt", Token, {
      expires: new Date(Date.now() + 60000), //this means cookies expires in 3 second
      httpOnly: true, //this shows that no any javascript tools delete cookies
    });

    const result = await data.save();

    resp.render("index");
    console.log(result);
  } else {
    resp.send("Password are not matching");
  }
});

app.get("/login", (req, resp) => {
  resp.render("login");
});

app.post("/login", async (req, resp) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const datas = await productmodel.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, datas.password); //hashing is used to check password is present on database or not
    //authentication jwt
    const Token = await datas.generateAuthToken();
    console.log(" login token is" + Token);

    //this is used to store tokens in cookies
    resp.cookie("jwt", Token, {
      expires: new Date(Date.now() + 600000), //this means cookies expires in 3 second
      httpOnly: true, //this shows that no any javascript tools delete cookies
    });

    if (isMatch) {
      resp.render("index");
      console.log(datas);
    } else {
      resp.send("Invalid password details");
    }
  } catch (error) {
    resp.send("Invalid login details");
  }
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

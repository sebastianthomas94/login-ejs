const express= require("express");
const app= express();
const path= require('path');
const bodyparser = require('body-parser');
const userData= require('./usersData');
const session = require('express-session');
var cookieParser = require('cookie-parser');


app.set("view engine", "ejs");     
app.set("views"); 


app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"styles")));
app.use(bodyparser.json());
app.use(session({
    secret: 'my-secret-key', // Change this to a strong secret in production
    resave: false,
    saveUninitialized: false,

  }));
app.use((req, res, next) => {
    res.header('Cache-control', 'no-cache,private,no-store,must-revalidate,max-stale=0, post-check=0,pre-check=0');
    next();
});
app.use(cookieParser());



  let authData={
    username: true,
    password: true,
    user: ""
};

let userPointer;


app.get("/", function(req,res){
    //console.log("Login page credentials check :", req.query);

     
    console.log(userData);
    if(req.session.auth)
        res.redirect("/home");
    else
    {
        res.render("login", authData);
        authData={
            username: true,
            password: true,
            user: ""
        };
    }
});

app.get("/home", function(req,res){ console.log("req.session.userPointer: ", req.session)
    if(req.session.auth)
        res.render("home", userData[req.session.userPointer]);
    else
        res.redirect("/");
    
    console.log("cookies using req.cookie from /home:", req.cookies);
    console.log("cookies using req.cookie:", req.cookies.mycookie);
    console.log("session of '", userData[req.session.userPointer].name , "' from /home:", req.session);
    
});

app.post("/UserAuth",(req, res) =>{
    console.log(req.body);


    for(let i in userData)
    {
        if(userData[i].username == req.body.username && userData[i].password == req.body.password)
        {
            req.session.auth= true;
            console.log("cookie session id: ",req.session.id);
            userPointer= i;
            req.session.userPointer= userPointer;
            res.redirect("/home");
            console.log("logged in succesfully");
            
            console.log("from userAuth: ",req.session);
            return;
        }
        else if(userData[i].username == req.body.username)
        {
            req.session.userPointer= i;
            console.log("inside ",req.session.userPointer);
        }

    }

    console.log("User Not Found or invalid entry");
    if(req.session.userPointer)
    {
        authData.username= userData[req.session.userPointer].username == req.body.username;
        authData.password= userData[req.session.userPointer].password == req.body.password && authData.username;
    }
    else{
        authData.username= false;
        authData.password= false;
    }
    console.log("username :",authData.username);
    console.log("password :", authData.password);
    if (authData.username)
        authData.user= req.body.username;
    console.log("user :", authData.user);
    res.redirect("/");  
});


app.get("/logout", function(req,res){
    console.log("loging out...");
    req.session.destroy( (err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
    userPointer=null;

});

app.get("/register", function(req,res){
    if(req.session.auth)
        res.redirect("/home");
    else
        res.render("register",{name:""});
});

app.post("/newUser", function(req,res){
    console.log("inside /new User");
    for (let i in userData)
    {
        if(userData[i].username == req.body.username)
        {
            console.log("Username alredy exist! create another username.");
            res.render("register", {message: "Username alredy exist! create another username.", name: req.body.name});
            return;
        }
    }
    userData.push(req.body);
    console.log(userData);
    req.session.auth= true;
    req.session.userPointer= userData.length-1;
    res.redirect("/home");
});


app.listen(8080,function(req,res){
    console.log("server is running at port 8080...");
});



if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyparser = require('body-parser');
const Info = require('./models/info.js');
const bcrypt = require('bcrypt');
const passport = require('passport');
const initializePassport = require('./passport-config');
const flash = require('express-flash');
const session = require('express-session');
const users = [];
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

const mongodbUri = "database link";
const app = express();

mongoose.connect(mongodbUri,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'EIL'
}).then(result => console.log("Connected to the database"))
.catch(error => console.log(error))

app.set('view engine','ejs');
app.use(express.json());
app.use(bodyparser.urlencoded({extended:false}));
app.use(express.static('public'));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/',(req,res)=>{
    res.render("login-page")
});

app.get('/database-page',checkAuthenticated,(req,res)=>{
    Info.find({}, function(error,allData){
        res.render("database", {allData});
    });
    
});

app.post('/', passport.authenticate('local', {
    successRedirect: '/database-page',
    failureRedirect: '/',
    failureMessage: true
}))


app.get('/register',(req,res)=>{
    res.render("register")
});

app.post('/register', async (req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        // console.log(users);
        res.redirect('/')
    }catch{
        res.redirect('/register')
    }
    // try{
    //     const hashedPassword = await bcrypt.hash(req.body.password, 10);
    //     users.push({
    //         id: Date.now().toString(),
    //         name: req.body.name,
    //         // employeeID : req.body.employeeID,
    //         email : req.body.email,
    //         // number : req.body.number,
    //         password : hashedPassword
    //     })
    //     res.redirect('/');
    // }catch{
    //     res.redirect('/register');
    // }
    // console.log(users);
})

app.get('/updateinfo/:id',checkAuthenticated,(req,res)=>{
    const id = req.params.id;
    // console.log(req.params.id);
    Info.findById(id, function (err, docs) {
        if (err){
            console.log(err)
        }else{
            res.render("edit-page",{docs});  
        }
    });
})

app.post('/updateinfo',checkAuthenticated,async (req,res)=>{
    const data = req.body;
    const id = data.id;
    // console.log(data, id);
    Info.findByIdAndUpdate(id, data, (err, docs)=> {
        if(err){
            console.log(err);
        }else{
            // console.log("docs"+ docs)
            res.redirect("/database-page")
        }
    });
})

app.post('/addinfo',checkAuthenticated,async (req,res)=>{
    const data = req.body;
    console.log(data);
    const employeeinfo = await Info.create(req.body);
    res.status(200);
    res.redirect("/database-page")
})

app.get('/delete/:id',checkAuthenticated,async (req,res)=>{
    const id = req.params.id;
    // console.log(req.params.id);
    Info.findByIdAndDelete(id, function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
            // console.log("Deleted : ", docs);
        }
    });
    res.redirect("/database-page")
})

app.get('/search', (req,res) =>{
    var regex = new RegExp(req.query.search,'i');
    Info.find({name:regex}).then((result)=>{
        // res.status(200).json(result)
        console.log(regex)
        res.render('database', {allData:result})
    })
})

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/');
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        res.redirect('/');
    }
    return next()
}

app.listen(3000);
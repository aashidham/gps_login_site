const express = require('express')
const app = express()
const http = require('http').Server(app)
const fs = require('fs')
const port = 8000
const bodyParser = require('body-parser');
const firebase = require('firebase')
const firebaseRef = new firebase("https://the-work-app-gps.firebaseio.com/govt_log_0")

const cookieSession = require('cookie-session');

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieSession({ keys: ['e$$svNZZ$zyr','bDbSFRZW','esvN2kyr'] }));
app.use(express.static('static'))

//load index.html on home page
app.get('/', function(req,res){
    return res.send(fs.readFileSync(__dirname + '/index.html').toString())
})

//send 'success' and name of user on successful login
app.get('/success', function(req, res){
    if (req.session && req.session.user) {
        return res.send('<h1>success</h1><h2>hi @' + req.session.user  + '!</h2>')
    }
    else return res.send('Please login first')
})

//on login attempt, write to DB and redirect to /success if correct 
app.post('/login', async function(req,res){
    if(!req.body.username || !req.body.pw) return res.send({err: 10, msg: "some fields missing"});
    
    //make a prototype object for what will be inserted in db to represent logging attempt
    const new_login_attempt = {username: req.body.username, ip: req.ip, time: new Date().toUTCString(), latitude: null, longitude:null  }
    
    if(req.body.loc && req.body.loc.latitude && req.body.loc.longitude) {
        new_login_attempt['latitude'] = req.body.loc.latitude
        new_login_attempt['longitude'] = req.body.loc.longitude
    }
        
    // check for login validity
    // in prod, use bcrypt to hash and salt the password rather than compare two raw strings
    const pw_actual = "theworkapp0$"
    var login_success;
    if (pw_actual === req.body.pw) {
        req.session.user = req.body.username;
        login_success = true
    }
    else login_success = false
    new_login_attempt['success'] = login_success
    
    //push to db
    firebaseRef.push().set(new_login_attempt)
    
    if(login_success) return res.send({redirect:'/success'});
    else return res.send({err:1,msg:'invalid credentials'});
});

//start server
http.listen(port, function() {
        console.log('server started on port',port)
        return true;
})


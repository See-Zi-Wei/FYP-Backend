const express = require('express'); // DO NOT DELETE
const cors = require('cors');
const morgan = require('morgan');
const app = express(); // DO NOT DELETE
const port = 3000; // Use port no. 3000


const database = require('./database');
const { concat, queue } = require('async');
const { json } = require('express');


app.use(morgan('dev'));
app.use(cors());
app.use(express.json())

// Dependencies
const moment = require('moment');

// Validation w/ JSON Schema 
var validate = require('json-schema').validate

/**
 * =====================================================================
 * ========================== CODE STARTS HERE =========================
 * =====================================================================
=======
 */


/**
 * ========================== SETUP APP =========================
 */

/**
 * JSON Body
 */

/**
 * ========================== RESET API =========================
 */

/** WORKING
 * Reset API 
 */

app.post('/api/logout',function(req,res){
    res.send("{\"logoutStatus\":\"Success\"}")
});



app.put('/api/user/:userid', function (req, res) {
    
    var userid = req.params.userid;   
    var username = req.body.username;
    var profile_pic_url = req.body.profile_pic_url;
    var email = req.body.email;
    
    
    user.updateUser(username,profile_pic_url, userid, email, function (err, result) {
        if (!err) {
            console.log(result+" row updated.");
            // res.send(result + ' record updated');
            res.send(JSON.stringify(result));
        } else{
          
           res.status(500).send("Condition:Unknown error \nCode: 500 Internal Server Error");
        }
    });
});



/**
 * ========================== UTILS =========================
 */

/**
 * 404
 */

/**
 * Error Handler
 */

app.use(function (err, req, res, next) {
    console.log(err)
    res.status(err.status).json(err);
})

function tearDown() {
    // DO NOT DELETE
    return database.closeDatabaseConnections();
}

/**
 *  NOTE! DO NOT RUN THE APP IN THIS FILE.
 *
 *  Create a new file (e.g. server.js) which imports app from this file and run it in server.js
 */

module.exports = { app, tearDown }; // DO NOT DELETE

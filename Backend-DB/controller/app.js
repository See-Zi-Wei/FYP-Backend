const express = require('express'); 
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const database = require('../model/database');

app.use(morgan('dev'));
app.use(cors());
app.use(express.json())


var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);
app.use(bodyParser.json());


app.all('http://127.0.0.1:3000', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'URLs to trust of allow');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');
  headers.append('Access-Control-Allow-Credentials', 'true');
  if ('OPTIONS' == req.method) {
  res.sendStatus(200);
  } else {
    next();
  }
});

// GET /user FUNCTION userLogin
app.get('/user', (req,res,next) => {

  const username = req.body.username;
  const password_hash = req.body.password_hash;

      // Connect to Database
      database.getUser(username, password_hash, function (err, result) {

        // If there is an error, Print Error Status & Message
          if (err) {
            res.status(500);
            res.send(`{"Message":"Internal Server Error"}`);

          } else {
          // If there is no error, Print Result
              res.status(201).send(result);
              console.log(result)
          }
      });
})


// POST /user FUNCTION userLogin
app.post('/user', function (req, res) {

    // Attributes required for Login (Username & Password)
    var username = req.body.username;
    var password_hash = req.body.password_hash;
  
    // Connect to Database
    database.userLogin(username, password_hash, function (err, result) {

    // If there is an error, Print Error Status & Message
      if (err) {
        res.status(500);
        res.send(`{"Message":"Internal Server Error"}`);

      } else {
    // If there is no error, Print Result
        res.status(201).send(result);
        console.log(result)
      }
    });
  });

// PUT /user FUNCTION updateProfile
app.put('/user/:id/', function (req, res) {

    // Attributes required for Update Profile (Full Name, Email, Job Title, Description, Picture)
    var user_id = req.params.id;
    var full_name = req.body.full_name;
    var email = req.body.email;
    var job_title = req.body.job_title;
    var description = req.body.description;
    var picture = req.body.picture;

    // Connect to database
    database.updateProfile (full_name, email, job_title, description, picture, user_id, function (err, result) {

    // If there is an error, Print Error Status & Message
      if (err) {
        res.status(500);
        res.send(`{"Message":"Internal Server Error"}`);

      } else {
    // If there is no error, Print Result

        res.status(201).send(result);
        console.log(result)
      }
    });
  });
      
// PUT /user/password_hash FUNCTION changePassword
app.put('/user/:id/password_hash', function (req, res, next) {

    var user_id = req.params.id;
    var password_hash = req.body.password_hash;

        // Connect to database
        database.changePassword (password_hash, user_id, function (err, result) {
            if (!err) {
                // Unknown User ID (user_id not found in database)
                if (result.length == 0) {
                    next({ body: { error: "User ID: '" + user_id + "' Not Found", code: 'UNKNOWN_USER' }, status: 404 });
                } else {
                // Success
                    res.status(200).send(result);
                }
            } else {
                // Unexpected Server Error
                next({ body: { error: err.message, code: 'UNEXPECTED_ERROR' }, status: 500 });
            }
        });
});


module.exports = app;
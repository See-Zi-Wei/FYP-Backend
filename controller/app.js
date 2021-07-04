const express = require('express'); 
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const database = require('../model/database');
const validator = require('../jsonValidation');

app.use(morgan('dev'));
app.use(cors());
app.use(express.json())


var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);
app.use(bodyParser.json());

const corsOptions = {
  origin: 'http://localhost:3000/',
  credentials: true,
}

app.use(cors(corsOptions));


// app.all('http://127.0.0.1:3000', function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', 'URLs to trust of allow');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');
//   headers.append('Access-Control-Allow-Credentials', 'true');
//   if ('OPTIONS' == req.method) {
//   res.sendStatus(200);
//   } else {
//     next();
//   }
// });

// GET /user 
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
              res.status(200).send(result);
              console.log(result)
          }
      });
})


// POST /user FUNCTION userLogin (Invalid Username/Password)
app.post('/user', function (req, res) {

    // Attributes required for Login (Username & Password)
    var username = req.body.username;
    var password_hash = req.body.password_hash;
  
    // Connect to Database
    database.userLogin(username, password_hash, function (err, result) {

    // If there is an error, Print Error Status & Message
      if (!err) {

        // Username not found
        if (result == 'NOEXIST') {
          next({ body: { error: "Username/Password '" + username + "/" + password + "' Not Found", code: 'UNKNOWN_USERNAME' }, status: 404 });
        } 
        else {
        // Sucess
        res.status(200).send(result);
      }
    }
        // Unexpected Server Error
        else {
       next({ body: { error: err.message, code: 'UNEXPECTED_ERROR' }, status: 500 });
  }
  });
  });

// PUT /user FUNCTION updateProfile (Upload Picture)
app.put('/user/:id/', function (req, res) {

    // Attributes required for Update Profile (Full Name, Email, Job Title, Description, Picture)
    var user_id = req.params.id;
    var full_name = req.body.full_name;
    var email = req.body.email;
    var job_title = req.body.job_title;
    var description = req.body.description;
    var picture = req.body.picture;

    // JSON Validation
    var descValidator = validator.isValid(description, validator.check50Char);
    var emailValidator = validator.isValid(email, validator.checkEmail);

    // Validation Passed
    if (descValidator && emailValidator) {

      // Connect to database
    database.updateProfile (full_name, email, job_title, description, picture, user_id, function (err, result) {

      // If there is an error, Print Error Status & Message
        if (err) {
          res.status(500);
          res.send(`{"Message":"Internal Server Error"}`);
  
        } else {
      // If there is no error, Print Result
  
          res.status(200).send(result);
          console.log(result)
        }
      });
    }

    // Validation fail - Max 50 Characters for Description
    else if (!descValidator) {
      next ({ body: errors.INVALID_QUERY_DESC.body, status: errors.INVALID_QUERY_DESC.status });
    }
    // Validation fail - Email
    else if (!emailValidator) {
      res.status({ body: errors.INVALID_QUERY_EMAIL.body, status: errors.INVALID_QUERY_EMAIL.status });
    }
    else {
      next({ body: { error: err.message, code: 'UNEXPECTED_ERROR' }, status: 500 });
    }
});
      
// PUT /user/password_hash FUNCTION changePassword (Unauthorised operation)
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

const errors = {
  // INVALID_BODY_COMPANY: {
  //     body: { error: 'Company Id should be 10-digits', code: 'INVALID_JSON_BODY' },
  //     status: 400,
  // },
  // INVALID_BODY_CUSTOMER: {
  //     body: { error: 'Customer Id should be 10-digits', code: 'INVALID_JSON_BODY' },
  //     status: 400,
  // },
  // INVALID_QUERY_CUSTOMER: {
  //     body: { error: 'Customer Id should be 10-digits', code: 'INVALID_QUERY_STRING' },
  //     status: 400,
  // },
  // INVALID_BODY_QUEUE: {
  //     body: { error: 'Queue Id should be 10-character alphanumeric string', code: 'INVALID_JSON_BODY' },
  //     status: 400,
  // },
  INVALID_QUERY_DESC: {
      body: { error: 'Description should only contain a maximum of 50 Characters', code: 'INVALID_QUERY_BODY' },
      status: 400,
  },
  INVALID_BODY_EMAIL: {
      body: { error: 'Email does not follow the appropriate format E.g. alantan@omenstudios.com', code: 'INVALID_JSON_BODY' },
      status: 400,
  }
};

/* Error Handler */
 app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const body = err.body || {
      error: 'Unknown Error!',
      code: 'UNKNOWN_ERROR'
  };
  res.status(status).send(body);
});

module.exports = app;
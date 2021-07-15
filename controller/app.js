const express = require('express'); 
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const database = require('../model/database');
const multer = require('multer');

app.use(morgan('dev'));
app.use(cors());
app.use(express.json())


var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);
app.use(bodyParser.json());

// result.setHeader ('Content-Type', 'application/json');

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

// Check Email Validation
var checkEmail = {
  validate: function (req,res,next) {

    var email = req.body.email;
    
    var pattern = new RegExp ("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]*$")

    if (pattern.test(email)) {
      next();
    }
    else {
      console.log ("The email you have entered is not valid.");
      res.status(500);
      res.send(`{"Message":"The email you have entered is not valid."}`)
    }
  }
}

// Multer configurations (Node.js middleware for uploading files - image)
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, `${__dirname}/../uploads`);
  },
  filename: function (req, file, callback) {
    const parts = file.mimetype.split("/");
    callback(null, `${file.fieldname}-${Date.now()}.${parts[1]}`);
  },
});

var upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      callback(null, true);
    } else {
      callback(null, false);
      return;
    }
  },
});

// GET /user 
app.get('/user', (req,res) => {

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


// POST /user FUNCTION userLogin  
app.post('/user', function (req, res) {

  // Attributes required for Login (Username & Password)
  var username = req.body.username;
  var password_hash = req.body.password_hash;

  // Connect to Database
  database.userLogin (username, password_hash, function (err, result, token) {

    // If No Result, Print Error, Token, Status & Message
    if (result.length == 0) {

      // Unknown Username/Password (Not Found in Database)
      res.status(500);
      console.log ("Username/Password is incorrect")
      res.json({ success: false, token: token, message: 'Username/Password is incorrect' });
      res.send();
 
    } else {

      // Success
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      console.log(res);
      res.json({ success: true, UserData: result, token: token, status: 'You are successfully logged in!' });
      res.send();
    }
  });
});

// PUT /user/:id FUNCTION updateProfile 
app.put('/user/:id/', checkEmail.validate, upload.single("image"), function (req, res) {

  // Attributes required for Update Profile (Full Name, Email, Job Title, Description, Picture)
  var user_id = req.params.id;
  var full_name = req.body.full_name;
  var email = req.body.email;
  var job_title = req.body.job_title;
  var description = req.body.description;
  var picture = req.body.picture;

  // Connect to database
  database.updateProfile (full_name, email, job_title, description, picture, user_id, function (err, result) {

    res.type("json");

    // If there is an error, Print Error Status & Message
      if (err) {
 
        res.status(500);
        res.send(`{"Message":"Internal Server Error"}`);

    // Description Validation (Cannot exceed 50 Characters)          
      } else if (description.length>50) {
      
        console.log ("The description you have entered have exceeded 50 Characters.");
        res.status(500);
        res.send(`{{"Message":"The description you have entered have exceeded 50 Characters."}}`);
      } 
      else {

        // If there is no error, Print Result
        res.status(200);
        res.send(`{{"Message":"Profile Updated"}}`);
        console.log(result)
      }
    });
  });
      
// PUT /user/password_hash FUNCTION changePassword
app.put('/user/:id/password_hash', function (req, res, next) {

    var user_id = req.params.id;
    var password_hash = req.body.password_hash;
    var old_password = req.body.old_password

        // Connect to database
        database.changePassword (password_hash, old_password, user_id, function (err, result, token) {
            if (!err) {

                // Unknown User ID (user_id not found in database)
                if (res == 'null') {
                  res.status(404);
                  console.log ("User ID not found")
                  res.json({ success: false, UserData: JSON.stringify(result), token: token, status: 'User ID not found' });
                  res.send();

                } 

                else if (result.length == 0) {
                  res.status(400);
                  res.json({ success: false, token: token, status: 'The Old Password that you have entered is incorrect' });
                  res.send(); 
                } 

                else {

                
                // Success
                    res.status(200);
                    console.log ("Password Found")
                    res.json({ success: true, UserData: JSON.stringify(result), token: token, message: 'Password Found' });
                    res.send();
                }
            } else {

                // Unexpected Server Error
                next({ body: { error: err.message, code: 'UNEXPECTED_ERROR' }, status: 500 });
            }
        });
});

// Rhithan's Code - Logout
app.post('/api/logout',function(req,res){
  res.send("{\"logoutStatus\":\"Success\"}")
});

// Rhithan's Code - Update User
app.put('/user/:id/', function (req, res) {

    console.log(" User id ");

    var user_id = req.body.user_id;   
    var full_name = req.body.full_name;
    var picture = req.body.picture;
    var email = req.body.email;
    var job_title = req.body.job_title;
    var description = req.body.description
  
  database.updateUser(user_id,full_name,picture,email,job_title,description, function (err, result) {
      if (!err) {

          console.log(result+" row updated.");
          res.send(JSON.stringify(result));

      } else{
        
         res.status(500).send("Condition:Unknown error \nCode: 500 Internal Server Error");
      }
  });
});

// GET /user/user_id [User List Table] 
app.get('/user/:id', (req, res) => {

  var user_id = req.params.id;

      // Connect to Database
      database.getUserID(user_id, function (err, result) {

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

// GET /user/:id/status [User List Table] 
app.get('/user/:id/status', (req, res) => {

  var user_id = req.params.id;

      // Connect to Database
      database.getUserStatus (user_id, function (err, result) {

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

// POST /comp_job [Comp Job Table] - Create
app.post('/comp_job', function (req, res) {

  var software = req.body.software;
  var host = req.body.host;
  var comp_time = req.body.comp_time;
  var comp_file_path = req.body.comp_file_path;
  var max_job_time = req.body.max_job_time;
  var min_job_time = req.body.min_job_time;

  // Connect to Database
  database.createCompJob (software, host, comp_time, comp_file_path, max_job_time, min_job_time, function (err, result) {

    // If there is an error, Print Error Status & Message   
    if (err) {
      res.status(500);
      res.send(`{"Message":"Internal Server Error"}`);

    } else {
    // If there is no error, Print Result
      res.status(200)
      console.log ("Successfully created Comp Job!")
      res.send(`{"Message":"Successfully created Comp Job!"}`);
    }
  });
});

// DELETE /comp_job [Comp Job Table] - Delete
app.delete('/comp_job', function (req, res) {

  var software = req.body.software;
  var host = req.body.host;
  var comp_time = req.body.comp_time;
  var comp_file_path = req.body.comp_file_path;
  var max_job_time = req.body.max_job_time;
  var min_job_time = req.body.min_job_time;

  database.deleteCompJob (software, host, comp_time, comp_file_path, max_job_time, min_job_time, function (err, result) {
  
    // If there is an error, Print Error Status & Message   
    if (err) {
      res.status(500);
      res.send(`{"Message":"Internal Server Error"}`);

    } else {
    // If there is no error, Print Result
      res.status(200)
      console.log ("Successfully deleted Comp Job!")
      res.send(`{"Message":"Successfully deleted Comp Job!"}`);
    }
  });
});

// GET /comp_job [Comp Job Table] - Get 
app.get('/comp_job', (req, res) => {

  var software = req.body.software;
  var host = req.body.host;
  var comp_time = req.body.comp_time;
  var comp_file_path = req.body.comp_file_path;
  var max_job_time = req.body.max_job_time;
  var min_job_time = req.body.min_job_time;

      // Connect to Database
      database.getCompJob (software, host, comp_time, comp_file_path, max_job_time, min_job_time, function (err, result) {

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

// // PUT /comp_job [Comp Job Table] - Update
// app.put('/comp_job/:id', function (req, res) {

//   // Attributes required for Update Comp Job (Software, Host, Comp_Time, Comp_file_Path, Max_Job_Time, Min_Job_Time)
//   var job_id = req.params.job_id;
//   var software = req.body.software;
//   var host = req.body.host;
//   var comp_time = req.body.comp_time;
//   var comp_file_path = req.body.comp_file_path;
//   var max_job_time = req.body.max_job_time;
//   var min_job_time = req.body.min_job_time;

//   // Connect to database
//   database.updateCompJob (software, host, comp_time, comp_file_path, max_job_time, min_job_time, job_id, function (err, result) {

//     // If there is an error, Print Error Status & Message 
//     if (err) {
//       res.status(500);
//       res.send(`{"Message":"Internal Server Error"}`);

//     } else {
//     // If there is no error, Print Result
//       res.status(200)
//       console.log ("Successfully updated Comp Job!")
//       res.send(`{"Message":"Successfully updated Comp Job!"}`);
//     }
//     });
//   });

// GET /host/host_id [Host Table] 
app.get('/host/:id', (req, res) => {

  var host_id = req.params.id;

      // Connect to Database
      database.getHostID(host_id, function (err, result) {

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

// GET /host [Host Table]
app.get('/host', (req,res) => {

      // Connect to Database
      database.getHosts (function (err, result) {

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

// PUT /host/host_group/:id FUNCTION updateHostGroup [Host Table]
app.put('/host/host_group/:id', function (req, res) {

  // Attributes required for Update Host Group
  var host_id = req.params.id;
  var host_group = req.body.host_group;

  // Connect to database
  database.updateHostGroup (host_group, host_id, function (err, result) {


    // If there is an error, Print Error Status & Message
      if (err) {
 
        res.status(500);
        res.send(`{"Message":"Internal Server Error"}`);
         
      } else {

        // If there is no error, Print Result
        res.status(200);
        res.send(`{{"Message":"Status Updated"}}`);
        console.log(result)
      }
    });
  });

// PUT /host/:id FUNCTION updateHostStatus [Host Table]
app.put('/host/status/:id', function (req, res) {

  // Attributes required for Update Status
  var host_id = req.params.id;
  var status = req.body.status;

  // Connect to database
  database.updateHostStatus (status, host_id, function (err, result) {


    // If there is an error, Print Error Status & Message
      if (err) {
 
        res.status(500);
        res.send(`{"Message":"Internal Server Error"}`);
         
      } else {

        // If there is no error, Print Result
        res.status(200);
        res.send(`{{"Message":"Status Updated"}}`);
        console.log(result)
      }
    });
  });

// // PUT /host_license/:id FUNCTION updateHostLicense [Host License Table]
// app.put('/host_license/:id', function (req, res) {

//   // Attributes required for Update Host Group
//   var host_license_id = req.params.id;
//   var license_name = req.body.license_name;
//   var product = req.body.product;
//   var version = req.body.version;
//   var out_time = req.body.out_time;
//   var updated_time = req.body.updated_time;
  
//   // Connect to database
//   database.updateHostLicense (license_name, product, version, out_time, updated_time, host_license_id, function (err, result) {


//     // If there is an error, Print Error Status & Message
//       if (err) {
 
//         res.status(500);
//         res.send(`{"Message":"Internal Server Error"}`);
         
//       } else {

//         // If there is no error, Print Result
//         res.status(200);
//         res.send(`{{"Message":"Host License Updated"}}`);
//         console.log(result)
//       }
//     });
//   });

// // DELETE /host [Host Table] - Delete
// app.delete('/host/:id', function (req, res) {

//   var host_id = req.params.id;

//   database.deleteHost (host_id, function (err, result) {
  
//     // If there is an error, Print Error Status & Message   
//     if (err) {
//       res.status(500);
//       res.send(`{"Message":"Internal Server Error"}`);

//     } else {
//     // If there is no error, Print Result
//       res.status(200)
//       console.log ("Successfully deleted Host!")
//       res.send(`{"Message":"Successfully deleted Host!"}`);
//     }
//   });
// });

// // PUT /render_job [Render Job Table] - Update
// app.put('/render_job/:id', function (req, res) {

//   // Attributes required for Update Render Job (render_time, done, fail, progress, busy, maya_version, rendere, scene_path, frame_id)
//   var frame_id = req.params.frame_id
//   var render_time = req.body.render_time;
//   var done = req.body.done;
//   var fail = req.body.fail;
//   var progress = req.body.progress;
//   var busy = req.body.busy;
//   var maya_version = req.body.maya_version;
//   var renderer = req.body.renderer;
//   var scene_path = req.body.scene_path;

//   // Connect to database
//   database.updateRenderJob (render_time, done, fail, progress, busy, maya_version, renderer, scene_path, frame_id, function (err, result) {

//     // If there is an error, Print Error Status & Message 
//     if (err) {
//       res.status(500);
//       res.send(`{"Message":"Internal Server Error"}`);

//     } else {
//     // If there is no error, Print Result
//       res.status(200)
//       console.log ("Successfully updated Render Job!")
//       res.send(`{"Message":"Successfully updated Render Job!"}`);
//     }
//     });
//   });

module.exports = app;
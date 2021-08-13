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
  
        // Extra Validation when Username/Password Incorrect or does not exist in database 
          } else if (result == 0) {
            console.log ("Username/Password Not Found!")
            res.send(`{"Message":"Username/Password not found!"}`);
            return false;

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

  var comp_id = req.body.comp_id;
  var job_name = req.body.job_name;
  var software = req.body.software;
  var host_group = req.body.host_group;
  var comp_time = req.body.comp_time;
  var comp_file_path = req.body.comp_file_path;
  var max_job_time = req.body.max_job_time;
  var min_job_time = req.body.min_job_time;
  var priority = req.body.priority;

  // Connect to Database
  database.createCompJob (comp_id, job_name, software, host_group, comp_time, comp_file_path, max_job_time, min_job_time, priority, function (err, result) {

    // If there is an error, Print Error Status & Message   
    if (err) {
      res.status(500);
      console.log (job_name)
      console.log(comp_id)
      res.send(`{"Message":"Internal Server Error"}`);
    }
      else if (job_name == "") {
        res.send(`{"Message":"Please Enter the Job Name"}`);
        return false;
      }
      else if (host_group == "") {
        res.send(`{"Message":"Please Enter the Host Group"}`);
        return false;
      }
      else if (comp_file_path == "") {
        res.send(`{"Message":"Please Enter the Comp File Path"}`);
        return false;
      }
      else if ( max_job_time == "") {
        res.send(`{"Message":"Please Enter the Maximum Job Time"}`);
        return false;
      }
      else if (min_job_time == "") {
        res.send(`{"Message":"Please Enter the Minimum Job Time"}`);
        return false;
      }
      else if (priority == "") {
        res.send(`{"Message":"Please Enter the Priority"}`);
        return false;
      }
     else {
    // If there is no error, Print Result
      res.status(200)
      console.log ("Successfully created Comp Job!")
      res.send(`{"Message":"Successfully created Comp Job!"}`);
    }
  });
});

// DELETE /comp_job [Comp Job Table] - Delete
app.delete('/comp_job/:id', function (req, res) {

  var comp_id = req.params.id;

  database.deleteCompJob (comp_id, function (err, result) {
  
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

  // Connect to Database
  database.getCompJob (function (err, result) {

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

// PUT /comp_job [Comp Job Table] - Update
app.put('/comp_job/:id', function (req, res) {

  // Attributes required for Update Comp Job (Job Name, Host_Group, Max_Job_Time, Min_Job_Time, Priority)
  var job_name = req.body.job_name;
  var host_group = req.body.host_group;
  var max_job_time = req.body.max_job_time;
  var min_job_time = req.body.min_job_time;
  var priority = req.body.priority;
  var comp_id = req.params.id;

  // Connect to database
  database.updateCompJob (job_name, host_group, max_job_time, min_job_time, priority, comp_id, function (err, result) {

    // If there is an error, Print Error Status & Message 
    if (err) {
      res.status(500);
      res.send(`{"Message":"Internal Server Error"}`);

    } else if (result == 'undefined') {
      res.send(`{"Message":"Failed to Update Comp Job"}`);

    } else {
    // If there is no error, Print Result
      res.status(200)
      console.log ("Successfully updated Comp Job!")
      res.send(`{"Message":"Successfully updated Comp Job!"}`);
    }
    });
  });

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

//Rhithan's code
app.post('/user/', function (req, res) {
    console.log(" User id ");

    var user_id = req.body.user_id;
    var user_role_id = req.body.user_role_id;
    var department_id = req.body.department_id;
    var location_id = req.body.location_id;
    var password_hash = req.body.password_hash;   
    var username = req.body.username
    var full_name = req.body.full_name;
    var picture = req.body.picture;
    var email = req.body.email;
    var job_title = req.body.job_title;
    var description = req.body.description
    var status = req.body.status
    var created_time = req.body.created_time
    var created_by = req.body.created_by
    var updated_time = req.body.updated_time
    var updated_by = req.body.updated_by
    var last_login_time = req.body.last_login_time
    var last_login_ip = req.body.last_login_ip
    
    database.createUser(user_id,user_role_id,department_id,location_id,password_hash,username,full_name,email,picture,job_title,description,status,created_time,created_by,updated_time,updated_by,last_login_time,last_login_ip , function (err, result) {
        if (err) {
            res.status(500);
            res.send(`{"Message":"Internal Server Error"}`);
      
          } else {
          // If there is no error, Print Result
            res.status(200)
            console.log ("Successfully created User!")
            res.send(`{"Message":"Successfully created User!"}`);
          }
    });
});

//Rhithan's code
app.get('/api/listings/:listingsid', function (req, res) {
        var id = req.params.listingsid;
        console.log("READING");

    });

//Rhithan's code
app.post('/render_job', function (req, res) {
  var frame_id = req.body.frame_id
    var render_time = req.body.render_time;
    var done = req.body.done;
    var fail = req.body.fail;
    var progress = req.body.progress;
    var busy = req.body.busy;
    var maya_version= req.body.maya_version;
    var renderer = req.body.renderer;
    var scene_path = req.body.scene_path;
   
  
    // Connect to Database
    database.createrenderJob (frame_id,render_time,done,fail,progress,busy,maya_version,renderer,scene_path, function (err, result) {
  
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

  //Rhithan's code
  app.delete('/render_job', function (req, res) {

    var frame_id = req.body.frame_id
    var render_time = req.body.render_time;
    var done = req.body.done;
    var fail = req.body.fail;
    var progress = req.body.progress;
    var busy = req.body.busy;
    var maya_version= req.body.maya_version;
    var renderer = req.body.renderer;
    var scene_path = req.body.scene_path;
  
    database.deleterenderJob (frame_id,render_time,done,fail,progress,busy,maya_version,renderer,scene_path, function (err, result) {
    
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

  //Rhithan's code
  app.put('/frames/status/:id', function (req, res) {

    // Attributes required for Update Status
    var frame_id = req.params.id;
    var status = req.body.status;
  
    // Connect to database
    database.updateRenderjobsStatus (status, frame_id, function (err, result) {
  
  
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


    //Rhithan's code
    app.get('/render_job', (req,res) => {

      // Connect to Database
      database.getRenderJob (function (err, result) {

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

//Rhithan's code
app.put('/renderjobs/status/:id', function (req, res) {

  // Attributes required for Update Status
  var frame_id = req.params.id;
  var status = req.body.status;

  // Connect to database
  database.updateFrameJobsStatus (status, frame_id, function (err, result) {


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

//Rhithan's code
app.put('/compjobs/status/:id', function (req, res) {

  // Attributes required for Update Status
  var comp_id = req.params.id;
  var status = req.body.status;

  // Connect to database
  database.updateCompJobsStatus (status, comp_id, function (err, result) {


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

  //Rhithan's code
  app.put('/hosts/status/:id', function (req, res) {

    // Attributes required for Update Status
    var host_id = req.params.id;
    var status = req.body.status;
  
    // Connect to database
    database.updatehostStatus (status, host_id, function (err, result) {
  
  
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

    //Rhithan's code
    app.put('/user/:id/password_hash', function (req, res, next) {

      var user_id = req.params.id;
      var password_hash = req.body.password_hash;
      console.log("password>>",password_hash);
          // Connect to database
          database.resetPassword (password_hash, user_id, function (err, result, token) {
              if (!err) {
  
                  // Unknown User ID (user_id not found in database)
                  if (res == 'null') {
                    res.status(404);
                    console.log ("User ID not found")
                    res.json({ success: false, UserData: JSON.stringify(result), token: token, status: 'User ID not found' });
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

// PUT /host/:id/redshift FUNCTION updateRedshift [Host Table]
app.put('/host/redshift/:id', function (req, res) {

  // Attributes required for Update Redshift
  var host_id = req.params.id;
  var redshift = req.body.redshift;

  // Connect to database
  database.updateHostLicense (redshift, host_id, function (err, result) {


    // If there is an error, Print Error Status & Message
      if (err) {
 
        res.status(500);
        res.send(`{"Message":"Internal Server Error"}`);
         
      } else {

        // If there is no error, Print Result
        res.status(200);
        res.send(`{{"Message":"Redshift Updated"}}`);
        console.log(result)
      }
    });
  });

// DELETE /host [Host Table] - Delete 
app.delete('/host/:id', function (req, res) {

  var host_id = req.params.id;

  database.deleteHost (host_id, function (err, result) {
  
    // If there is an error, Print Error Status & Message   
    if (err) {
      res.status(500);
      res.send(`{"Message":"Internal Server Error"}`);

    } else {
    // If there is no error, Print Result
      res.status(200)
      console.log ("Successfully deleted Host!")
      res.send(`{"Message":"Successfully deleted Host!"}`);
    }
  });
});

// PUT /render_job [Render Job Table] - Update
app.put('/render_job/:id', function (req, res) {

  // Attributes required for Update Render Job (job_name, host_group, max_hosts, batch_frames, max_batch_tine, min)_frame_time, priority)
  var job_name = req.body.job_name;
  var host_group = req.body.host_group;
  var max_hosts = req.body.max_hosts;
  var max_job_time = req.body.max_job_time;
  var min_job_time = req.body.min_job_time;
  var priority = req.body.priority;
  var frame_id = req.params.id;

  // Connect to database
  database.updateRenderJob (job_name, host_group, max_hosts, max_job_time, min_job_time, priority, frame_id, function (err, result) {

    // If there is an error, Print Error Status & Message 
    if (err) {
      res.status(500);
      res.send(`{"Message":"Internal Server Error"}`);

    } else {
    // If there is no error, Print Result
      res.status(200)
      console.log ("Successfully updated Render Job!")
      res.send(`{"Message":"Successfully updated Render Job!"}`);
    }
    });
  });

module.exports = app;

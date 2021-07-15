var mysql = require("mysql");

const { Pool, Client } = require('pg');

// Remote Database - ElephantSQL URL
const connectionString = 'postgres://rtxfbqzx:tqHqDdm7gu5u97U3v0b9GxfJ3eNP98NC@john.db.elephantsql.com/rtxfbqzx'


// Connect to ElephantSQL 
const pool = new Pool({
    connectionString,
    max: 4,
    statement_timeout: 10000
});


// Connect to Database
pool.connect();


// Error if ElephantSQL Connection is Idle
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})


// Get Connection
function getDatabasePool() {
    return pool;
}


// Get User
function getUser (username, password_hash, callback) {

    // Get Connection
    const pool = getDatabasePool();
    // SQL Query
    const sql = 'SELECT * FROM "user" WHERE username = $1 AND "password_hash" = $2';

    // Query
    pool.query(sql, [username, password_hash], function (err, res) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        else {
            return callback(null, res.rows);
        }
    });
}


// For User Login
function userLogin (username, password_hash, callback) {

   // Connect to Database
   const pool = getDatabasePool();

    // SQL Query/Statement to Retrieve Data from Database Tables
   const sql = 'SELECT * FROM "user" WHERE username = $1 AND password_hash = $2';

        // SQL Query - Database
        pool.query(sql, [username, password_hash], function (err, res) {

   	      // If error, Print Error
          if (err) {
            console.log(err);
            return callback(err, null);
          } 

          // Else, Print Res.rows (Result) I used .rows to achieve an easier view
          else {
              console.log(res.rows)
              return callback(null, res.rows);
          }
        });
};


// For Update My Profile 
function updateProfile (full_name, email, job_title, description, picture, user_id, callback) {

    // Get Connection
    const pool = getDatabasePool()

    // Query
    pool.connect (function (err) {
        if (err) {
            console.log(err);
            return callback(err, null);

        } else {

            // SQL Query
            var sql = 'SELECT * FROM "user" WHERE user_id = $1'

            // Query
            pool.query (sql, [user_id], function (err, result) {

        if (err) {
            console.log(err);
            return callback(err, result);
            
        } else {

            // SQL Query
            var sql = 'UPDATE "user" SET full_name = $1, email = $2, job_title = $3, description = $4, picture = $5 WHERE user_id = $6';
                    
            // Query
            pool.query (sql, [full_name, email, job_title, description, picture, user_id], function (err, res) {
                if(err) {
                    console.log(err);
                } else {
                    console.log (res.rows);
                }
                return callback (err, res);
            });
        }
            });
        }      
    });
}


// For Change Password
function changePassword (password_hash, old_password, user_id, callback) {

    // Get Connection
    const pool = getDatabasePool()

    // SQL Query 
    const sql = 'SELECT * FROM "user" WHERE password_hash = $1';


    pool.query(sql, [old_password], function (err, res) {

        if (err) {
            return callback(err, null);

        } else if (res.rows.length == 0) {

            console.log ("The Old Password that you have entered is incorrect")
            
            return callback(err, res.rows);

        } else if (res.rows.length > 0) {

            console.log ("Rows Returned")

            // SQL Qeury
            const sql = 'UPDATE "user" SET password_hash = $1 WHERE user_id = $2';
            
             // UPDATE Query
             pool.query(sql, [password_hash, user_id], function (err, result) {

                console.log(result)
                if (result.rows.length == 0) {
                    return callback(err, null);

                } else if (result.rows.length>0) {
                    return callback(null, res.rows);
                }
            });
        }
    })
}


// Rhithan's Code - Update User
function updateUser (user_id,full_name,email,picture,job_title,description, callback) {

    var sql = 'select * from "user" WHERE user_id = $1';
    pool.query(sql, [user_id], function(err, result) {
        if(err) {
            return callback(err , result);
        } else{
        console.log("rowcount",err);
        console.log("resulst one >>",result);

            var sql1 = 'UPDATE "user" SET  full_name =$2, email = $3,picture = $4, job_title = $5 ,description = $6 WHERE user_id = $1';
            
            pool.query(sql1, [user_id,full_name,email,picture,job_title,description], function (err, res){
        if(err){
            console.log(err);
        }else {
            console.log(res.rows);
        }
        return callback(err, res);

        })
    }
    
    })
};

// For GET User ID [User List Table]
function getUserID (user_id, callback) {

    // Get Connection
    const pool = getDatabasePool();

    // SQL Query
    const sql = 'SELECT * FROM "user" WHERE user_id = $1';

    // Query
    pool.query(sql, [user_id], function (err, res) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        else {
            return callback(null, res.rows);
        }
    });
}

// For GET User's Status [User List Table]
function getUserStatus (user_id, callback) {

    // Get Connection
    const pool = getDatabasePool();

    // SQL Query
    const sql = 'SELECT status FROM "user" WHERE user_id = $1';

    // Query
    pool.query(sql, [user_id], function (err, res) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        else {
            return callback(null, res.rows);
        }
    });
}

// For POST Comp Job [Comp Job Table]
function createCompJob (software, host, comp_time, comp_file_path, max_job_time, min_job_time, callback) {

    // Connect to Database
    const pool = getDatabasePool();
 
     // SQL Query/Statement to Retrieve Data from Database Tables
    const sql = 'INSERT INTO Comp_job (software, host, comp_time, comp_file_path, max_job_time, min_job_time) VALUES ($1,$2,$3,$4,$5,$6)';
 
         // SQL Query - Database
         pool.query(sql, [software, host, comp_time, comp_file_path, max_job_time, min_job_time], function (err, res) {
 
              // If error, Print Error
           if (err) {
             console.log(err);
             return callback(err, null);
           } 
 
           // Else, Print Res.rows (Result) 
           else {
               console.log("Created Successfully")
               return callback(null, res.rows);
           }
         });
 };

 // For DELETE Comp Job [Comp Job Table]
function deleteCompJob (software, host, comp_time, comp_file_path, max_job_time, min_job_time, callback) {

    // Connect to Database
    const pool = getDatabasePool();
 
     // SQL Query/Statement to Retrieve Data from Database Tables
    const sql = 'DELETE FROM Comp_job WHERE software = $1 AND host = $2 AND comp_time = $3 AND comp_file_path = $4 AND max_job_time = $5 AND min_job_time = $6';
 
         // SQL Query - Database
         pool.query(sql, [software, host, comp_time, comp_file_path, max_job_time, min_job_time], function (err, res) {
 
              // If error, Print Error
           if (err) {
             console.log(err);
             return callback(err, null);
           } 
 
           // Else, Print Res.rows (Result) 
           else {
               console.log("Deleted Successfully")
               return callback(null, res.rows);
           }
         });
 };

 // For GET Comp Job [Comp Job Table]
function getCompJob (software, host, comp_time, comp_file_path, max_job_time, min_job_time, callback) {

    // Get Connection
    const pool = getDatabasePool();

    // SQL Query
    const sql = 'SELECT * FROM comp_job WHERE software = $1 AND host = $2 AND comp_time = $3 AND comp_file_path = $4 AND max_job_time = $5 AND min_job_time = $6';

    // Query
    pool.query (sql, [software, host, comp_time, comp_file_path, max_job_time, min_job_time], function (err, res) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        else {
            return callback(null, res.rows);
        }
    });
}

// For Update Comp Job
// function updateCompJob (software, host, comp_time, comp_file_path, max_job_time, min_job_time, job_id, callback) {

//     // Get Connection
//     const pool = getDatabasePool();

//     // SQL Query
//     const sql = 'UPDATE Comp_Job SET software = $1 AND host = $2 AND comp_time = $3 AND comp_file_path = $4 AND max_job_time = $5 AND min_job_time = $6 WHERE job_id = $7';

//     pool.query (sql, [software, host, comp_time, comp_file_path, max_job_time, min_job_time, job_id], function (err, res) {
//         if (err) {
//             return callback(err, null);
//         }
//         else {
//             pool.query(sql, [software, host, comp_time, comp_file_path, max_job_time, min_job_time], function (err, res) {
//                 if (err) {
//                     return callback(err, null);
//                 } else {
//                     return callback(null, res.rows);
//                 }
//             });
//         }
//     });
// }

// For GET Host ID [Host Table]
function getHostID (host_id, callback) {

    // Get Connection
    const pool = getDatabasePool();

    // SQL Query
    const sql = 'SELECT * FROM host WHERE host_id = $1';

    // Query
    pool.query(sql, [host_id], function (err, res) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        else {
            return callback(null, res.rows);
        }
    });
}

// For Get Hosts
function getHosts (callback) {

    // Get Connection
    const pool = getDatabasePool();

    // SQL Query
    const sql = 'SELECT * FROM host';

    // Query
    pool.query(sql, function (err, res) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        else {
            return callback(null, res.rows);
        }
    });
}

// For Update Host Group
function updateHostGroup (host_group, host_id, callback) {

    // Get Connection
    const pool = getDatabasePool()


    // SQL Query
    var sql = 'UPDATE host SET host_group = $1 WHERE host_id = $2';
                    
    // Query
    pool.query (sql, [host_group, host_id], function (err, res) {
        if(err) {
            console.log(err);
        } else {
            console.log (res.rows);
        }
            return callback (err, res);
    });
}

// For Update Host Status
function updateHostStatus (status, host_id, callback) {

    // Get Connection
    const pool = getDatabasePool()


    // SQL Query
    var sql = 'UPDATE host SET status = $1 WHERE host_id = $2';
                    
    // Query
    pool.query (sql, [status, host_id], function (err, res) {
        if(err) {
            console.log(err);
        } else {
            console.log (res.rows);
        }
            return callback (err, res);
    });
}

// For Update Host License 
// function updateHostLicense (license_name, product, version, out_time, updated_time, host_license_id, callback) {

//     // Get Connection
//     const pool = getDatabasePool()


//     // SQL Query
//     var sql = 'UPDATE host_license SET license_name = "KL_OMENS_48" AND product = "redshift" AND version = "v2020" AND out_time = "00:19" AND updated_time = "00:20" WHERE host_license_id = "1"';
                    
//     // Query
//     pool.query (sql, [license_name, product, version, out_time, updated_time, host_license_id], function (err, res) {
//         if(err) {
//             console.log(err);
//         } else {
//             console.log (res.rows);
//         }
//             return callback (err, res);
//     });
// }

 // For DELETE Host [Host Table]
//  function deleteHost (host_id, callback) {

//     // Connect to Database
//     const pool = getDatabasePool();
 
//      // SQL Query/Statement to Retrieve Data from Database Tables
//     const sql = 'DELETE FROM host WHERE host_id = $1';
 
//          // SQL Query - Database
//          pool.query(sql, [host_id], function (err, res) {
 
//               // If error, Print Error
//            if (err) {
//              console.log(err);
//              return callback(err, null);
//            } 
 
//            // Else, Print Res.rows (Result) 
//            else {
//                console.log("Deleted Successfully")
//                return callback(null, res.rows);
//            }
//          });
//  };

 // For Update Render Job
// function updateRenderJob (render_time, done, fail, progress, busy, maya_version, renderer, scene_path, frame_id, callback) {

//     // Get Connection
//     const pool = getDatabasePool()


//     // SQL Query
//     var sql = 'UPDATE render_job SET render_time = $1 AND done = $2 AND fail = $3 AND progress = $4 AND busy = $5 AND maya_version = $6 AND renderer = $7 AND scene_path = $8 WHERE frame_id = $9';
                    
//     // Query
//     pool.query (sql, [render_time, done, fail, progress, busy, maya_version, renderer, scene_path, frame_id], function (err, res) {
//         if(err) {
//             console.log(err);
//         } else {
//             console.log (res.rows);
//         }
//             return callback (err, res);
//     });
// }

module.exports = {
    userLogin,
    getUser,
    updateProfile,
    changePassword,
    updateUser,
    getUserID,
    getUserStatus,
    createCompJob,
    deleteCompJob,
    getCompJob,
    // updateCompJob,
    getHostID,
    getHosts,
    updateHostStatus,
    updateHostGroup,
    // updateHostLicense,
    // deleteHost,
    // updateRenderJob
};
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
   const sql = 'SELECT * FROM "user" WHERE username = $1 AND "password_hash" = $2';

        // SQL Query - Database
        pool.query(sql, [username, password_hash], function (err, res) {

   	      // If error, Print Error
          if (err) {
            console.log(err);
            return callback(err, null);
          } 

          // Else, Print Res.rows (Result) I used .rows to achieve an easier view
          else {
              return callback(err, res.rows);
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
function changePassword (password_hash, user_id, callback) {

    // Get Connection
    const pool = getDatabasePool()

    // SQL Qeury
    const sql = 'UPDATE "user" SET password_hash = $1 WHERE user_id = $2';

    pool.query(sql, [password_hash, user_id], function (err, res) {

        if (err) {
            return callback(err, null);
        }
        else {

            // SQL Query
            const sql = 'SELECT user_id FROM "user" WHERE user_id = $1';
            
            // Query
            pool.query(sql, [user_id], function (err, res) {
                if (err) {
                    return callback(err, null);
                } else {
                    return callback(null, res.rows);
                }
            });
        }
    });
}


module.exports = {
    userLogin,
    getUser,
    updateProfile,
    changePassword
};
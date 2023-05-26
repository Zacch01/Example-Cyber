var express = require('express'); 
var bodyParser = require('body-parser'); 
var sqlite3 = require('sqlite3').verbose(); 

var app = express(); 
app.use(express.static('.')); 
app.use(bodyParser.urlencoded({ extended: true })); 

var db = new sqlite3.Database(':memory:'); // Creating an in-memory SQLite database
db.serialize(function () {
  db.run('CREATE TABLE user (username TEXT, password TEXT, name TEXT)'); // Creating a 'user' table with columns: username, password, name
  db.run("INSERT INTO user VALUES ('admin', 'admin123', 'App Administrator')"); // Inserting a sample user into the 'user' table
});

app.post('/login', function (req, res) {
  // Handling POST requests to '/login' route
  var username = req.body.username; // Extracting the username from the request body
  var password = req.body.password; // Extracting the password from the request body

  console.log('username: ' + username); // Logging the received username
  console.log('password: ' + password); // Logging the received password

  // Use parameterized query to prevent SQL injection attacks
  db.get(
    'SELECT name FROM user where username = ? and password = ?',
    [username, password],
    function (err, row) {
      // Executing the SQL query with parameters on the database
      if (err) {
        // If an error occurs during the query execution
        console.log('ERROR', err); // Logging the error
        res.redirect('/index.html#error'); // Redirecting the response to the error page
      } else if (!row) {
        // If no rows are returned from the query
        res.redirect('/index.html#unauthorized'); // Redirecting the response to the unauthorized page
      } else {
        // If a row is returned from the query
        res.send(
          // Sending a response to the client
          'Hello <b>' +
            row.name +
            '</b><br /><a href="/index.html">Go back to login</a>'
        );
      }
    }
  );
});

app.listen(3000); // Starting the server and listening on port 3000

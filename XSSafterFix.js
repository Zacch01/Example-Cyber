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

function sanitizeString(str) {
  // Function to sanitize a string by replacing special characters
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

app.post('/login', function (req, res) {
  // Handling POST requests to '/login' route
  var username = sanitizeString(req.body.username); // Sanitizing the username
  var password = sanitizeString(req.body.password); // Sanitizing the password

  // Use parameterized query to prevent SQL injection attacks
  var query = 'SELECT name FROM user where username = ? and password = ?';
  db.get(query, [username, password], function (err, row) {
    // Executing the parameterized SQL query on the database
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
          sanitizeString(row.name) +
          '</b><br /><a href="/index.html">Go back to login</a><br /><br /><div>' +
          sanitizeString(req.body.message) +
          '</div>'
      );
    }
  });
});

app.listen(3000); // Starting the server and listening on port 3000

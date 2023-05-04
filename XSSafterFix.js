var express = require('express');
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();

var app = express();
app.use(express.static('.'));
app.use(bodyParser.urlencoded({ extended: true }));

var db = new sqlite3.Database(':memory:');
db.serialize(function () {
  db.run('CREATE TABLE user (username TEXT, password TEXT, name TEXT)');
  db.run("INSERT INTO user VALUES ('admin', 'admin123', 'App Administrator')");
});

function sanitizeString(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

app.post('/login', function (req, res) {
  var username = sanitizeString(req.body.username); // a valid username is admin
  var password = sanitizeString(req.body.password); // a valid password is admin123

  // Use parameterized query to prevent SQLI attacks
  var query = 'SELECT name FROM user where username = ? and password = ?';
  db.get(query, [username, password], function (err, row) {
    if (err) {
      console.log('ERROR', err);
      res.redirect('/index.html#error');
    } else if (!row) {
      res.redirect('/index.html#unauthorized');
    } else {
      res.send(
        'Hello <b>' +
          sanitizeString(row.name) +
          '</b><br /><a href="/index.html">Go back to login</a><br /><br /><div>' +
          sanitizeString(req.body.message) +
          '</div>'
      );
    }
  });
});

app.listen(3000);

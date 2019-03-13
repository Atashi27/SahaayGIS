var express = require("express");
var pg = require("pg");
var app = express();
var path = require("path");
var bodyParser = require('body-parser');
var session = require('express-session');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
var config = {
  user: 'postgres',
  database: 'postgres',
  password: 'star',
  port: 5432,
  max: 10, // max number of connection can be open to database
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));
// var pool = new pg.Pool(config);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var sess;
app.use("/images", express.static(__dirname + "/public/images"));
app.use("/data", express.static(__dirname + "/public/data"));
app.use("/header", express.static(__dirname + "/public/pages/header.html"));
app.use("/header1", express.static(__dirname + "/public/pages/header1.html"));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/nearesthospital", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/nearesthospital.html"));
});

app.get("/nearestpharmacy", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/nearestpharmacy.html"));
});

app.get("/tips", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/tips.html"));
});

app.get("/feedback", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/feedback.html"));
});

app.get("/signup", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/signup.html"));
});

app.get("/login", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/login.html"));
});

app.get("/dashboard", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/dashboard.html"));
});

app.get("/feedback1", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/feedback1.html"));
});

app.get("/logout", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/logout.html"));
});

app.get("/nearesthospital1", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/nearesthospital1.html"));
});

app.get("/filterhospital1", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/filterhospital1.html"));
});

app.get("/tips1", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/tips1.html"));
});

app.get("/nearestpharmacy", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/nearestpharmacy.html"));
});

app.get("/nearestpharmacy1", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/pages/nearestpharmacy1.html"));
});



app.post('/users', function(req, res) {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("not able to get connection " + err);
      res.status(400).send(err);
    }
    client.query('INSERT INTO users(name, email, password, bloodgrp, age, gender, allergies, address, contact) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)', [req.body.name, req.body.email, req.body.password, req.body.bloodgrp, req.body.age, req.body.gender, req.body.allergies, req.body.address, req.body.contact]);
    //call `done()` to release the client back to the pool
    done();
    res.redirect('/login');
  });
});

app.post('/feedback', function(req, res) {

  pool.connect(function(err, client, done) {
    if (err) {
      console.log("not able to get connection " + err);
      res.status(400).send(err);
    }
    client.query('INSERT INTO feedback(name, email, comment) VALUES($1, $2, $3)', [req.body.name, req.body.email, req.body.comment]);
    //call `done()` to release the client back to the pool
    done();
    res.redirect('/');

  });
});
app.post('/add', function(req, res) {
  pool.connect(function(err, client, done) {
    var email = req.body.email;
    var password = req.body.password;
    client.query('SELECT email,password FROM users WHERE email = $1 AND password =$2', [email, password], function(error, results) {
      // console.log(email);
      //console.log(password);


      if (error) {
        res.send({
          "code": 400,
          "failed": "error ocurred"
        })
      } else {
        if (results.rowCount == 1) {
          sess = req.session;
          sess.email = req.body.email;

          done();
          res.redirect('/dashboard');

          app.post('/feedback1', function(req, res) {
            if (err) {
              console.log("not able to get connection " + err);
              res.status(400).send(err);
            }
            client.query('INSERT INTO service_feedback(name, email, rating, suggestions) VALUES($1, $2, $3, $4)', [req.body.name, email, req.body.rating, req.body.suggestions]);
            //call `done()` to release the client back to the pool

            res.redirect('/dashboard');
          });
          app.post('/sub', function(req, res) {
            const accountSid = 'AC8f2597d0199bedbdbb4f98203d77e21e';
            const authToken = 'd662dfb87866e64826ac15babb662db3';
            client = require('twilio')(accountSid, authToken);

            client.messages
              .create({
                body: 'Emergency!!' + email,
                from: '+18647131453',
                to: '+918668626097'
              })
              .then(message => console.log(message.sid));

          });
        } else {
          res.send({
            "code": 204,
            "success": "Email and password does not match"
          });
        }
      }

    });
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

console.log("Running at http://localhost:" + port);
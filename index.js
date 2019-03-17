var express = require("express");
var pg = require("pg");
var path = require("path");
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();

// HEROKU code
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

//LOCALHOST code
// var config = {
//   user: 'postgres',
//   database: 'postgres',
//   password: 'star',
//   port: 5432,
//   max: 10,
//   idleTimeoutMillis: 30000,
// };
// var pool = new pg.Pool(config);

app.use(session({ secret: 'godisgreat', saveUninitialized: true, resave: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var sess;

app.use("/images", express.static(__dirname + "/public/images"));
app.use("/data", express.static(__dirname + "/public/data"));
app.use("/header", express.static(__dirname + "/public/pages/header.html"));
app.use("/loggedinheader", express.static(__dirname + "/public/pages/loggedinheader.html"));

app.get("/", function(req, res) {
  sess = req.session;
  if (sess.email) {
    res.sendFile(path.join(__dirname + "/public/pages/dashboard.html"));
  } else {
    res.sendFile(path.join(__dirname + "/index.html"));
  }
});

app.get("/logout", function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

app.get("/nearesthospital", function(req, res) {
  sess = req.session;
  if (sess.email) {
    res.sendFile(path.join(__dirname + "/public/pages/nearesthospital.html"));
  } else {
    res.redirect('/');
  }
});

app.get("/tips", function(req, res) {
  sess = req.session;
  if (sess.email) {
    res.sendFile(path.join(__dirname + "/public/pages/tips.html"));
  } else {
    res.redirect('/');
  }
});

app.get("/nearestpharmacy", function(req, res) {
  sess = req.session;
  if (sess.email) {
    res.sendFile(path.join(__dirname + "/public/pages/nearestpharmacy.html"));
  } else {
    res.redirect('/');
  }
});

app.get("/hospital", function(req, res) {
  sess = req.session;
  if (sess.email) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname + "/public/pages/hospital.html"));
  }
});

app.get("/ambulance", function(req, res) {
  sess = req.session;
  if (sess.email) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname + "/public/pages/ambulance.html"));
  }
});

app.get("/user", function(req, res) {
  sess = req.session;
  if (sess.email) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname + "/public/pages/user.html"));
  }
});

app.get("/viewprofile", function(req, res) {
  sess = req.session;
  if (sess.email) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname + "/public/pages/viewprofile.html"));
  }
});

app.route('/signup')
  .get((req, res) => {
    sess = req.session;
    if (sess.email) {
      res.redirect('/');
    } else {
      res.sendFile(path.join(__dirname + "/public/pages/signup.html"));
    }
  })
  .post((req, res) => {
    pool.connect(function(err, client, done) {
      if (err) {
        console.log("Connection error: " + err);
        res.status(400).send(err);
      }
      client.query('INSERT INTO user_details(name,email,password,contact_no,emergency_contact_no, blood_group,dob,gender,height,weight,allergies, address,pincode,created_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())', [req.body.name, req.body.email, req.body.password, req.body.contact_no, req.body.emergency_contact_no, req.body.blood_group, req.body.dob, req.body.gender, req.body.height, req.body.weight, req.body.allergies, req.body.address, req.body.pincode]);
      done();
      res.redirect('/login');
    });
  });

app.route('/feedback')
  .get((req, res) => {
    sess = req.session;
    if (sess.email) {
      res.sendFile(path.join(__dirname + "/public/pages/feedback.html"));
    } else {
      res.redirect('/');
    }
  })
  .post((req, res) => {
    pool.connect(function(err, client, done) {
      if (err) {
        console.log("Connection error: " + err);
        res.status(400).send(err);
      }
      client.query('INSERT INTO feedback(name, email, comment) VALUES($1, $2, $3)', [req.body.name, req.body.email, req.body.comment]);
      done();
      res.redirect('/');
    });
  });

app.route('/hospitalfeedback')
  .get((req, res) => {
    sess = req.session;
    if (sess.email) {
      res.sendFile(path.join(__dirname + "/public/pages/hospitalfeedback.html"));
    } else {
      res.redirect('/');
    }
  })
  .post((req, res) => {
    pool.connect(function(err, client, done) {
      if (err) {
        console.log("Connection error: " + err);
        res.status(400).send(err);
      }
      client.query('INSERT INTO service_feedback(name, email, rating, suggestions) VALUES($1, $2, $3, $4)', [req.body.name, sess.email, req.body.rating, req.body.suggestions]);
      done();
      res.redirect('/');
    });
  });

app.post('/sub', function(req, res) {
  const accountSid = 'AC8f2597d0199bedbdbb4f98203d77e21e';
  const authToken = 'd662dfb87866e64826ac15babb662db3';
  client = require('twilio')(accountSid, authToken);
  client.messages
    .create({
      body: 'Emergency!!' + sess.email,
      from: '+18647131453',
      to: '+918668626097'
    })
    .then(message => console.log(message.sid));
});

app.route('/login')
  .get((req, res) => {
    sess = req.session;
    if (sess.email) {
      res.redirect('/');
    } else {
      res.sendFile(path.join(__dirname + "/public/pages/login.html"));
    }
  })
  .post((req, res) => {
    pool.connect(function(err, client, done) {
      var email = req.body.email;
      var password = req.body.password;
      client.query('SELECT email,password FROM user_details WHERE email = $1 AND password =$2', [email, password], function(error, results) {
        if (error) {
          res.send({
            "code": 400,
            "failed": "error ocurred"
          })
        } else if (results.rowCount == 1) {
          sess = req.session;
          sess.email = email;
          done();
          res.redirect('/');
        } else {
          res.send({
            "code": 204,
            "success": "Email and password does not match"
          });
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
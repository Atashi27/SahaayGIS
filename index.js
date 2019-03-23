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

app.get('/login', function(req, res) {
  sess = req.session;
  if (sess.email) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname + "/public/pages/login.html"));
  }
})

app.get('/signup', function(req, res) {
  sess = req.session;
  if (sess.email) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname + "/public/pages/signup.html"));
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

app.get("/nearestbloodbank", function(req, res) {
  sess = req.session;
  if (sess.email) {
	  res.sendFile(path.join(__dirname + "/public/pages/nearestbloodbank.html"));
  } else {
      res.redirect('/');	
  }
});

app.get("/viewprofile", function(req, res) {
  sess = req.session;
  if (sess.email) {
    res.sendFile(path.join(__dirname + "/public/pages/viewprofile.html"));
  } else {
    res.redirect('/');
  }
});

app.post('/usersignup', function(req, res) {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("Connection error: " + err);
      res.status(400).send(err);
    }
    client.query('INSERT INTO user_details(name,email,password,contact_no,emergency_contact_no, blood_group,dob,gender,height,weight,allergies, address,pincode,created_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())', [req.body.name, req.body.email, req.body.password, req.body.contact_no, req.body.emergency_contact_no, req.body.blood_group, req.body.dob, req.body.gender, req.body.height, req.body.weight, req.body.allergies, req.body.address, req.body.pincode], function(err, result) {
      done();
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      // res.status(200).send(result);
      res.redirect('/login');
    });
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
      client.query('INSERT INTO service_feedback(user_id, initiative, ratings, liking, suggestions, recommend, submitted_on) VALUES((SELECT user_id from user_details where email=$1), $2, $3, $4, $5, $6, NOW())', [sess.email, req.body.initiative, req.body.ratings, req.body.liking, req.body.suggestions, req.body.recommend], function(err, result) {
        if (err) {
          console.log(err);
          res.status(400).send(err);
        }
        // res.status(200).send(result);
        res.redirect('/');
      });
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
      client.query('INSERT INTO hospital_feedback(user_id, hospital_name, cleanliness_rating, availability_rating, preparedness_rating, overall_rating, recommend, comments, submitted_on) VALUES((SELECT user_id from user_details where email=$1), $2, $3, $4, $5, $6, $7, $8, NOW())', [sess.email, req.body.hospital_name, req.body.cleanliness_rating, req.body.availability_rating, req.body.preparedness_rating, req.body.overall_rating, req.body.recommend, req.body.comments], function(err, result) {
        if (err) {
          console.log(err);
          res.status(400).send(err);
        }
        // res.status(200).send(result);
        res.redirect('/');
      });
    });
  });

app.post('/sub', function(req, res) {
  const accountSid = 'AC0b9cb8dfa9cb0760245f16d22f685d50';
  const authToken = '9405cc05c122a6e81159f9d96f302079';
  client = require('twilio')(accountSid, authToken);
  client.messages
    .create({
      body: 'Emergency!!' + sess.email,
      from: '+12012988944',
      to: '+917506108340'
    })
    .then(message => console.log(message.sid));
});

app.post('/gohospital', function(req, res) {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("Connection error: " + err);
      res.status(400).send(err);
    }
    client.query('INSERT INTO user_history(user_id, hospital_name, visited_on) VALUES((SELECT user_id from user_details where email=$1), $2, NOW())', [sess.email, req.body.hospital_name], function(err, result) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      // res.status(200).send(result);
      res.redirect('/');
    });
  });
});

app.post('/userlogin', function(req, res) {
  pool.connect(function(err, client, done) {
    client.query('SELECT email,password FROM user_details WHERE email = $1 AND password =$2', [req.body.email, req.body.password], function(error, results) {
      if (error) {
        res.send({
          "code": 400,
          "failed": "error ocurred"
        })
      } else if (results.rowCount == 1) {
        sess = req.session;
        sess.email = req.body.email;
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
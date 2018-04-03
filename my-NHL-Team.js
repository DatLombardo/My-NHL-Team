var jsonfile = require('jsonfile')
var express = require('express');
var app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
var uuid = require('uuid/v1');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var assert = require('assert');
var d3   = require('d3');

// database config
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/My-NHL-Team');
                 //,{useMongoClient: true});

// middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// configure view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// configure sessions
app.use(session({
  genid: function(request) {
    return uuid();
  },
  resave: false,
  saveUninitialized: false,
  //cookie: {secure: true},
  secret: "LombardoPatel"
}));

// database schema
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username:{type: String,
            unique: true,
            index: true},
  team: String,
  hashedPassword: String
}, {collection: 'users'});
var User = mongoose.model('users', userSchema);

var playerSchema = new Schema({
   Player_ID: Number,
   Last_Name: String,
   First_Name: String,
   Jersey_Num: Number,
   Pos: String,
   Team_ID: Number,
   Team_Abbr: String,
   Team_City: String,
   Team_Name: String,
   Games_Played: Number,
   Goals: Number,
   Assists: Number,
   Points: Number,
 }, {collection: 'players'});
var Player = mongoose.model('players', playerSchema);

var standingsSchema = new Schema({
   Conference_Name: String,
   Team_ID: Number,
   Team_Abbr: String,
   Team_City: String,
   Team_Name: String,
   Rank: Number,
   Games_Played: Number,
   Wins: Number,
   Losses: Number,
   Points: Number,
 }, {collection: 'standings'});
var Standings = mongoose.model('standings', standingsSchema);

var teamSchema = new Schema({
  City: String,
  Name: String,
  Colours: [String]
});

var Teams = mongoose.model('teams', teamSchema);

Player.count(function (err, count) {
    if (!err && count === 0) {
        populatePlayers();
    }
});

Standings.count(function (err, count) {
    if (!err && count === 0) {
        populateStandings();
    }
});

Teams.count(function (err, count) {
    if (!err && count === 0) {
        populateTeams();
    }
});

function populatePlayers(){
  var playersFile = 'data/NHLPlayers.json'
  jsonfile.readFile(playersFile, function(err, obj) {
    for (var elem of obj){
      var newEntry = new Player(elem);
      newEntry.save(function(error) {
        if (error) {
          console.log('Error adding player.');
        }
      });
    }
  })
}

function populateStandings(){
  var file = 'data/ConferenceStandings.json'
  jsonfile.readFile(file, function(err, obj) {
    for (var elem of obj){
      var newEntry = new Standings(elem);
      newEntry.save(function(error) {
        if (error) {
          console.log('Error adding standing element.');
        }
      });
    }
  })
}

function populateTeams(){
  var file = 'data/TeamColours.json'
  jsonfile.readFile(file, function(err, obj) {
    for (var elem of obj){
      var newEntry = new Teams(elem);
      newEntry.save(function(error) {
        if (error) {
          console.log('Error adding standing element.');
        }
      });
    }
  })
}

function userExists(toFind) {
  for (var i = 0; i < usernames.length; i++) {
    if (usernames[i] === toFind) {
      return true;
    }
  }
  return false;
}

app.post("/api/getTeamStanding", function(req, res) {
    var session = req.session;
    Standings.find({
      Team_Name: session.team
    }).then(function(result) {
      Standings.find({
        Conference_Name: result[0].Conference_Name
      }).then(function(result) {
        res.send(result);
      }).catch(function(error) {
        res.send(error);
      });
    }).catch(function(error) {
      res.send(error);
    });
});

app.post("/api/getTeamColour", function(req, res) {
    var session = req.session
    Teams.find({
      Name: session.team
    }).then(function(result) {
      res.send(result);
    }).catch(function(error) {
      res.send(error);
    });
});

app.post("/api/getTeams", function(req, res) {
    Teams.find({}).then(function(result) {
      res.send(result);
    }).catch(function(error) {
      res.send(error);
    });
});

app.post("/api/getPlayers", function(req, res) {
    var session = req.session;
    Player.find({
      Team_Name: session.team
    }).then(function(result) {
      res.send(result);
    }).catch(function(error) {
      res.send(error);
    });
});


app.get("/", function(req, res) {
  var session = req.session;
  if (session.username) {
    res.render('home', {title: session.team,
                        username: session.username,
                        team: session.team});
  } else {
    res.render('login', {title: 'Log-In Page'});
  }
});

app.get('/register', function(req, res){
  if (req.session.username)
    delete req.session.username;
    delete req.session.team;
  res.render('register', {title: 'Registration Page'});
});

app.post('/registrationProcess', function(req, res){
  var username = req.body.username;
  var password = req.body.pwd;
  var team = req.body.team;
  var hashedPassword = bcrypt.hashSync(password);

  if (username == null || password == null
    || username == "" || password == "") {
    res.render('register', {errorMessage: 'Invalid username or password.'});
    res.redirect('/register');
  }

  var newUser = new User({username: username,
                          team: team,
                          hashedPassword: hashedPassword});
  newUser.save(function(error) {
    if (error) {
      console.log('Unable to register: ' + error);
      res.render('register', {errorMessage: 'Unable to register user.'});
    } else {
       req.session.username = username;
       req.session.team = team;
       res.render('registrationSuccess', {username: username,
                                            team: team,
                                            title: 'Welcome aboard!'});
    }
  });
});

app.get('/login', function(req,res) {
  res.render('login', {title: 'Log-In Page',
                      errorMessage: ''});
});

app.post('/processLogin', function(req,res) {
  var username = req.body.username;
  var password = req.body.pwd;

  User.find({username: username}).then(function(results) {
    if (results.length == 0) {
      res.render('login', {title: 'Please Log In',
                          errorMessage: 'Login Incorrect'});
    } else {
      if (bcrypt.compareSync(password, results[0].hashedPassword)) {
        req.session.username = username;
        req.session.team = results[0].team;
        res.render('home', {username: username,
                                        team: req.session.team
                                        });
      }
    }
  });
});

app.get('/logout', function(req,res) {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(7878, function() {
  console.log("Listening on port 7878 for connections");
});

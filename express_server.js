// SET UP && CONFIGS
// =======================

const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const uuidv4 = require('uuid/v4');

// MIDDLEWARE
//===================

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const isUserloggedIn = (req, res, next) => {
  if (!req.cookies["user_id"] && req.path !== '/register' && req.path !== '/login'){
    let templateVars = {
      user: null,
      error: 'Please login or register to Tiny App to access this page!'
    };
    res.render('login', templateVars)
  } else {
    next();
  }
}

app.use(isUserloggedIn);

// GLOBAL VARIABLES
// ================

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// GLOBAL FUNCTIONS
// ======================

const generateRandomString = () => {
  return uuidv4().slice(6);
}

// returns the URLs where the userID is equal to the id of the currently logged in
// user.
const urlsForUser = (db, id) => {
  let urlsForUserID = {};
  for (let shortURL in db) {
    if (id === db[shortURL].userID) {
      urlsForUserID[shortURL] = db[shortURL].longURL;
    }
  }
  return urlsForUserID;
}

// Checks to see if a user with that email already exists
const existingUser = (email) => {
  let foundUser;
  for (let existingUserID in users) {
    if (users[existingUserID].email === email) {
      foundUser = users[existingUserID];
    }
  }
  return foundUser;
}





// USER AUTH Routes
// =======================

app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    error: false
  };
  res.render('login', templateVars);
});

// Login : Set a cookie using userID and redirect to /urls page
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = existingUser(email);

  //If a user with that e-mail cannot be found, return a response with a 403 status code.

  //If a user with that e-mail address is located, compare the password given in the form with
  //the existing user's password. If it does not match, return a response with a 403 status code.
  if (!foundUser || (foundUser && password !== foundUser.password)) {
    let templateVars = {
      user: null,
      error: "Your email or password was incorrect, please try again!"
    };
    res.statusCode = 403;
    res.render('login', templateVars)
  } else {
  // If both checks pass, set the user_id cookie with the matching user's random ID, then redirect
  // to /urls.
  res
    .cookie('user_id', foundUser.id)
    .redirect('/urls');
  }
});

// Logout : clear userID cookie and redirect to /urls page
app.post('/logout', (req, res) => {
  res
    .clearCookie('user_id')
    .redirect('/login');
});

// Render Register Page
app.get('/register', (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    error: false
  };
  res.render('registration', templateVars);
});

// What happens after a user fills the registration page
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = generateRandomString();
  const foundUser = existingUser(email);

  // if email/password are empty strings --
  // send back a response with the 400 error code
  if (email === "" || password === "") {
    let templateVars = {
      user: null,
      error: "Oops! Please enter an email and password to register!"
    };
    res.statusCode = 400;
    res.render('registration', templateVars)
  // if email already exist
  // send response with error message
  } else if (foundUser) {
    let templateVars = {
      user: null,
      error: "That email is already taken, try again!"
    };
      res.statusCode = 400;
      res.render('registration', templateVars)
  } else {
    let newUser = {
      id: userId,
      email: email,
      password: password
    };
  // add to global object
  users[userId] = newUser;
  // Once added, set user_id cookie containing the new random ID
  res.cookie('user_id', userId);
  //redirect to urls page
  res.redirect('/urls');
  }

});




// REQUEST routes for URLS
// ============================

// Delete an entry and redirected to "myURL" page
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Create a new entry
app.get('/urls/new', (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
    res.render('urls_new', templateVars);
});

// Index page showing all your added URL entries
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlsForUser(urlDatabase, (req.cookies["user_id"])),
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
});

// Redirect to url/shortURL through newly generated ID
app.post('/urls', (req, res) => {
  const randomizedURL = generateRandomString();
  urlDatabase[randomizedURL].longURL = req.body.longURL;
  res.redirect(`/urls/${randomizedURL}`);
});

// Page for new entry
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]]
  }
  res.render('urls_show', templateVars);
});

// Edit an entry and redirected to "myURL" page
app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

// Redirect to longURL by clicking on the given shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`http://${longURL}`);
});

// Basic set up to ensure routing is working
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});




// SERVER LISTEN 
// =====================

app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`)
});
// SET UP && CONFIGS
// =======================

const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// GLOBAL VARIABLES
// ================

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}


// USER AUTH Routes
// =======================

app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render('login', templateVars);
});

// Login : Set a cookie using userID and redirect to /urls page
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let foundUser;

  for (let existingUserID in users) {
    if (users[existingUserID].email === email) {
      foundUser = users[existingUserID];
    }
  }

  //If a user with that e-mail cannot be found, return a response with a 403 status code.

  //If a user with that e-mail address is located, compare the password given in the form with
  //the existing user's password. If it does not match, return a response with a 403 status code.
  if (!foundUser || (foundUser && password !== foundUser.password)) {
    res.statusCode = 403;
    res.end("Your email or password was incorrect, please try again!")
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
    .redirect('/urls');
});

// Render Register Page
app.get('/register', (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render('registration', templateVars);
});

// What happens after a user fills the registration page
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = generateRandomString();

  let foundUser;

  for (let existingUserID in users) {
    if (users[existingUserID].email === email) {
      foundUser = users[existingUserID];
    }
  }

  // if email/password are empty strings --
  // send back a response with the 400 error code
  if (email === "" || password === "") {
    res.statusCode = 400;
    res.end("Oops! Please enter an email and password to register!")
  // if email already exist
  // send response with error message
  } else if (foundUser) {
      res.statusCode = 400;
      res.end("That email is already taken, try again!")
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
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
});

// Redirect to url/shortURL through newly generated ID
app.post('/urls', (req, res) => {
  const randomizedURL = generateRandomString();
  urlDatabase[randomizedURL] = req.body.longURL;
  res.redirect(`/urls/${randomizedURL}`);
});

// Page for new entry
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  }
  res.render('urls_show', templateVars);
});

// Edit an entry and redirected to "myURL" page
app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

// Redirect to longURL by clicking on the given shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
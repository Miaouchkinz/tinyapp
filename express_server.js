// SET UP && CONFIGS
// =======================

const express = require('express');
const app = express();
const PORT = 8080; 
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const { urlsForUser, existingUser } = require('./helper');

//===================
// MIDDLEWARE
//===================

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['biscuit', 'chatton', 'dragon', 'power'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Middleware function to check if someone is logged in. If not, it should redirect them to the login page.
// Can still access /register, /login, and the u/:shortURL which leads to the respective longURL if not logged in.
const isUserloggedIn = (req, res, next) => {
  if (!req.session.user_id && req.path !== '/register' && req.path !== '/login' && !req.path.includes('/u/')) {
    let templateVars = {
      user: null,
      error: 'Please login or register to Tiny App to access this page!'
    };
    res.render('login', templateVars);
  } else {
    next();
  }
};

app.use(isUserloggedIn);


// ===================
// GLOBAL FUNCTIONS
// ===================

const generateRandomString = () => {
  return uuidv4().slice(0,6);
};

//===================
// GLOBAL VARIABLES
// ==================

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
    password: "purple-monkey-dinosaur",
    hashedPassword: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
    hashedPassword: bcrypt.hashSync("dishwasher-funk", 10)
  }
};


// ==================
// USER AUTH Routes
// ==================

// Render Login Page
app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    error: false
  };
  res.render('login', templateVars);
});

// Render Register Page
app.get('/register', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    error: false
  };
  res.render('registration', templateVars);
});

// Logout : clear userID cookie session and redirect to /login page
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Login : Set a cookie using userID and redirect to /urls page
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = existingUser(email, users);

  //If a user with that e-mail cannot be found, return a response with a 403 status code.
  //If a user with that e-mail address is located, compare the password given in the form with
  //the existing user's password. If it does not match, return a response with a 403 status code.
  if (!foundUser || (foundUser && !bcrypt.compareSync(password, foundUser.hashedPassword))) {
    let templateVars = {
      user: null,
      error: "Your email or password was incorrect, please try again!"
    };
    res.statusCode = 403;
    res.render('login', templateVars);
  } else {
  // If both checks pass, set the user_id cookie with the matching user's random ID, then redirect
  // to /urls.
    req.session.user_id = foundUser.id;
    res.redirect('/urls');
  }
});

// What happens after a user fills the registration forms.
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();
  const foundUser = existingUser(email, users);

  // if email/password are empty strings -- send back a response with the 400 error code.
  if (email === "" || password === "") {
    let templateVars = {
      user: null,
      error: "Oops! Please enter an email and password to register!"
    };
    res.statusCode = 400;
    res.render('registration', templateVars);
  // if email already exist, send response with error message
  } else if (foundUser) {
    let templateVars = {
      user: null,
      error: "That email is already taken, try again!"
    };
    res.statusCode = 400;
    res.render('registration', templateVars);
  } else {
    let newUser = {
      id: userId,
      email: email,
      password: password,
      hashedPassword: hashedPassword
    };
    // add new user to users database
    users[userId] = newUser;
    // Once added, set user_id cookie containing the new random ID
    req.session.user_id = userId;
    res.redirect('/urls');
  }

});



// ========================
// REQUEST routes for URLS
// ========================

// Render create a new entry page.
app.get('/urls/new', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  res.render('urls_new', templateVars);
});

// Page for specific shortURL, where you can edit the URL.
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    urls: urlsForUser(urlDatabase, (req.session.user_id)),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  // If the shortURL does not belong to the user, redirect them to the login page.
  if (!templateVars.urls[templateVars.shortURL]) {
    let templateVars = {
      user: null,
      error: 'Please login or register to Tiny App to access this page!'
    };
    res.render('login', templateVars);
  } else {
    res.render('urls_show', templateVars);
  }
});

// Redirect to longURL by clicking on the given shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`${longURL}`);
});

// Index page showing all your added URL entries
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlsForUser(urlDatabase, (req.session.user_id)),
    user: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

// Ensure user sees something when they go to the root route.
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Delete an entry and redirected to "myURL" page
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Edit an entry and redirected to "myURL" page
app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

// Create new shortURL and redirect to its edit page
app.post('/urls', (req, res) => {
  const randomizedURL = generateRandomString();
  urlDatabase[randomizedURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${randomizedURL}`);
});






// SERVER LISTEN
// =====================

app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`);
});
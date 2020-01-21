const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
// set the view engine to ejs
app.set('view engine', 'ejs');

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000).toString(16).substring(1);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// REQUEST routes for URLS
// ============================

// Delete an entry and redirected to "myURL" page
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Create a new entry
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// Index page showing all your added URL entries
app.get('/urls', (req, res) => {
  let templateVars = {urls: urlDatabase};
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
    longURL: urlDatabase[req.params.shortURL]
  }
  res.render('urls_show', templateVars);
});

// Edit an entry and redirected to "myURL" page
app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

// Redirect to longURLL by clicking on the given shortURL
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
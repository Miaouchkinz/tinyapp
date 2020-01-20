const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// set the view engine to ejs
app.set('view engine', 'ejs');

//use res.render to load up an ejs view file

// index page
app.get('/', (req, res) => {
  res.render('pages/index');
});

// about page
app.get('/about', (req, res) => {
  res.render('pages/about');
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`)
});
const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();


// Helper Functions
const {
  addNewURL,
  addNewUser,
  authenticateUser,
  checkEmailExists,
  updateURL,
  urlsForUser
} = require('./helpers');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: [
    '8f730fc4-47de-4sa1-a8cd-4f835325371'
  ],
  maxAge: 24 * 60 * 60 * 1000
}));

//=============== DATABASES ==================//
//======= url Database ===========//
const urlDatabase = {
  "cp24cp24": {
    longURL: "http://www.cp24.com",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "3t1ech"
  }
};
// =========== User Database ============//
const usersDB = {
  "t93w12": {
    id: "t93w12",
    email: "tw@gmail.com",
    password: bcrypt.hashSync("sports", 10)
  },
  "3t1ech": {
    id: "3t1ech",
    email: "corgis@corgis.com",
    password: bcrypt.hashSync("corgis", 10)
  }
};

app.get('/', (req, res) => {
  const userId = req.session.user_id;
  const loggedUser = usersDB[userId];
  if (!loggedUser) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

// ======= URLS index =========//
app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const loggedUser = usersDB[userId];
  const url = urlsForUser(userId, urlDatabase);
  if (!loggedUser) {
    res.send('Please login for further access! <a href = "http://localhost:8080/login">Click here to Login</a>');
  } else {
    const templateVars = {
      urls: url,
      currentUser: loggedUser
    };
    res.render('urls_index', templateVars);
  }
});

// ========= Submit new URL ============ //
app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  const loggedUser = usersDB[userId];
  if (!loggedUser) {
    res.redirect('/login');
  } else {
    let templateVars = {
      currentUser: loggedUser
    };
    res.render('urls_new', templateVars);
  }
});

// ===== Showing details of specifed shortURL  =========== //
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const loggedUser = usersDB[userId];
  if (!loggedUser) {
    res.send('Please login for further access!');
  } else if (userId !== urlDatabase[shortURL]['userID']) {
    res.send(`Cannot access!`);
  } else {
    let templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL,
      currentUser: loggedUser
    };
    res.render('urls_show', templateVars);
  }
});

// ======= Redirecting short URLs --> website =========//
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//========= Adding a new URL to the database =================//
app.post('/urls', (req, res) => {
  const longURL = req.body['longURL'];
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
  } else {
    const shortURL = addNewURL(longURL, userID, urlDatabase);
    res.redirect(`/urls/${shortURL}`);
  }
});

//======= Update/Edit the URL ============ //
app.post('/urls/:shortURL', (req, res) => {
  const editURL = req.body['editURL'];
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
  } else if (req.session.user_id === urlDatabase[shortURL]['userID']) {
    updateURL(shortURL, editURL, urlDatabase);
    res.redirect('/urls/');
  } else {
    res.send('URL doesnt belong to user!');
  }
});

// =========== Edit URL ===================//
app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL]['userID']) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send('Sorry, cannot Edit');
  }
});

// ============= Delete URL ====================//
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL]['userID']) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
  res.send('URL doesnt belong to user!');
});

//========== Rendering Login Form ==============//
app.get('/login', (req, res) => {
  const templateVars = {
    currentUser: null
  };
  res.render('user_login', templateVars);
});

// ========= Rendering Register Form =========//
app.get('/register', (req, res) => {
  const templateVars = {
    currentUser: null,
  };
  res.render('user_registration', templateVars);
});

// ======== Login ========== //
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = authenticateUser(email, password, usersDB);
  if (!user) {
    res.status(403).send(`Status Code: ${res.statusCode}. User is not registered!`);
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});


//====== Adding new user to database via the registeration form ====== //
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashPassword  = bcrypt.hashSync(password, 10);
  const user = checkEmailExists(email, usersDB);
  // if the user doesnt have an existing email in the db, and the email or password is not entereted then it will return an error
  if (user === false && email.length === 0 || password.length === 0) {
    res.status(400).send(`Status Code: ${res.statusCode}. Please enter an email and password`);
    // if the user isnt an existing email in the database, it will be added to the database.
  } else if (user === false) {
    const userId = addNewUser(email, hashPassword, usersDB);
    req.session.user_id = userId;
    res.redirect('/urls/');
  } else if (user === true) {
    res.status(400).send(`Status Code: ${res.statusCode}. Already registered!`);
  }
});

//======= Logout ========== //
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls/');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
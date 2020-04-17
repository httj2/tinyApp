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
}))

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
// ===========user Database ============//
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

//============== GET ====================//
app.get('/', (req, res) => {
  const userId = req.session.user_id;
  const loggedUser = usersDB[userId];
  if (!loggedUser) {
    res.redirect('/login');
  } else {
    res.redirect('/urls')
  }
});

// ======= Url Index =========//
app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const loggedUser = usersDB[userId];
  const url = urlsForUser(userId, urlDatabase);
  if (!loggedUser) {
    res.send('Please login for further access!');
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
  // check if user is logged in 
  const userId = req.session.user_id;
  const loggedUser = usersDB[userId];
  if (!loggedUser) {
    res.redirect('/login')
  } else {
    let templateVars = {
      currentUser: loggedUser
    };
    res.render('urls_new', templateVars);
  }
});

// ======== show specific URL =========== //
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const loggedUser = usersDB[userId];
  if (!loggedUser) {
    res.send('Please login for further access!')
  } else if (userId !== urlDatabase[shortURL]['userID']) {
    res.send(`Cannot access!`)
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

//========== Login Form ==============//
app.get('/login', (req, res) => {
  const templateVars = {
    currentUser: null
  };
    res.render('user_login', templateVars);
});

// ========= Register Route =========//
app.get('/register', (req, res) => {
  const templateVars = {
    currentUser: null,
  };
  res.render('user_registration', templateVars);
});


//========******* POST ***********===========// 

//========= New URL to DB =================//
app.post('/urls', (req, res) => {
  const longURL = req.body['longURL']; 
  const userID = req.session.user_id;
  const shortURL = addNewURL(longURL, userID, urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//======= Update/Edit the URL ============ //
app.post('/urls/:shortURL', (req, res) => {
  const editURL = req.body['editURL'];
  const shortURL= req.params.shortURL;
  updateURL(shortURL, editURL, urlDatabase);
  res.redirect('/urls/');
});

// ============= Delete URL ====================//
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL]['userID']) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } 
  res.re
});

// =========== Edit URL on index page ===================//
app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL= req.params.shortURL;
  if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send('Sorry, cannot Edit');
  }
});


// ======== Login ========== //
app.post('/login', (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  // Authenticate the user
  const user = authenticateUser(email, password, usersDB);
  if (!user) {
    res.status(403).send(`Status Code: ${res.statusCode}. User is not registered!`);
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

//======= Logout ========== //
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls/');
});

//====== Registration Form ====== //
app.post('/register', (req, res) => {
  const { email } = req.body;
  const password  = bcrypt.hashSync(req.body.password, 10);
  // check if the user is not alrady in the database
  const user = checkEmailExists(email, usersDB);
  // if user is not in the DB, add the user to the db 
  if (!user) {
    if (email.length === 0 && password.length === 0) {
      res.status(400).send(`Status Code: ${res.statusCode}. Please enter an email and password`);
    } 
    const userId = addNewUser(email, password, usersDB);
    req.session.user_id = userId;
    res.redirect('/urls/');
  } else {
    res.status(400).send(`Status Code: ${res.statusCode}. Already registered!`);
  };
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
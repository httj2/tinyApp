const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const app = express();
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

//  cookie session configure
app.use(cookieSession({
  name: 'session',
  keys: [
    '8f730fc4-47de-4sa1-a8cd-4f835325371'
  ],
  // Cookie Options (expires in 24 hours)
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//=============== DATABASES ==================//
//======= url Database ===========
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
// ===========user Database ============
const usersDB = {
  "t93w12": {
    id: "t93w12",
    email: "tw@gmail.com",
    password: "sports"
  },
  "3t1ech": {
    id: "3t1ech",
    email: "corgis@corgis.com",
    password: "chimken4ever"
  }
};



//============== GET ====================//

//========== Display Login Form ==============//
app.get("/login", (req, res)=> {
  const templateVars = {
    currentUser: null
  };
    res.render("user_login", templateVars)
});
// ========= Register Route =========//
app.get("/register", (req, res) => {
  const templateVars = {
    currentUser: null,
  };
  res.render("user_registration", templateVars)
 

});


// ======= Url Index =========//
app.get("/urls", (req, res) => {
  //using user_ID look up the user of the usersDB;
  const userId = req.session.user_id;
  const loggedUser = usersDB[userId];
  const url = urlsForUser(userId, urlDatabase);
  if (!loggedUser) {
    res.send('Please go to http://localhost:8080/login/ and login or register!')
  } else {
    const templateVars = {
      urls: url,
      currentUser: loggedUser,
    };
    res.render("urls_index", templateVars);
  }
});


// === Redirecting short URLs to long URLS ==============
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
  //status code: 302 --> temporarily to a new page
});


// ========= Submit new URL ============ //
app.get("/urls/new", (req, res) => {
  // check if user is logged in 
  const userId = req.session.user_id;
  const loggedUser = usersDB[userId];
  if (!loggedUser) {
    res.redirect('/login')
  } else {
    let templateVars = {
      currentUser: loggedUser
    };
    res.render("urls_new", templateVars);
  }  
});

// ======== show specific URL =========== //
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const loggedUser = usersDB[userId];
  let templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    currentUser: loggedUser
  };
  res.render("urls_show", templateVars);
});


//========******* POST ***********===========/ 

//========= New URL to DB =================//
app.post("/urls", (req, res) => {
  const longURL = req.body['longURL']; 
  const userID = req.session.user_id;
  const shortURL = addNewURL(longURL, userID, urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

// ============= Delete URL ====================
app.post('/urls/:shortURL/delete', (req, res) => {
  
  const shortURL= req.params.shortURL;
  if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send(`Sorry, cannot delete!`)
  }
});

// =========== Edit URL on index page =====================
app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL= req.params.shortURL;
  if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send(`Sorry, cannot Edit`)
  }
   
});
//======= Update/Edit the URL ============ 
app.post("/urls/:shortURL", (req, res) => {
  // get editted URL 
  const editURL = req.body['editURL'];
  //take the shortURL in params
  const shortURL= req.params.shortURL;
  // update the URL
  updateURL(shortURL, editURL, urlDatabase);
  res.redirect(`/urls/`);
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
    // res.cookie('user_id', user.id);
    req.session.user_id = user.id
    res.redirect('/urls')
  }
});
//======= logout ==========
app.post('/logout', (req, res) => {
  // res.cookie('user_id', null)
  req.session.user_id = null;
  res.redirect('/urls/');
});

//====== registration form ======
app.post('/register', (req, res) => {
  const { email } = req.body;
  const password  = bcrypt.hashSync(req.body.password, 10)
  // check if the user is not alrady in the database
  const user = checkEmailExists(email, usersDB);
  // if user is not in the DB, add the user to the db 
  if (!user) {
    if (email.length === 0 && password.length === 0) {
      res.status(400).send(`Status Code: ${res.statusCode}. Please enter an email and password`)
    } 
    const userId = addNewUser(email, password, usersDB);
    // setCookie with the userId
    // res.cookie('user_id', userId)
    req.session.user_id = userId;
    res.redirect('/urls/');
  } else {
    res.status(400).send(`Status Code: ${res.statusCode}. Already registered!`)
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// const URLsRouter = require("./routes/urls");

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// app.use("/", URLsRouter);
// app.use("/", userRouter);


//=============== DATABASES ==================//
//======= url Database ===========
const urlDatabase = {
  "cp24cp24": {
  longURL: "http://www.cp24.com",
  userID: "aJ48lW"
  },
  "9sm5xK": {
  longURL: "http://www.google.com",
  userID: "aJ48lW"
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
//================ HELPER FUNCTIONS ====================//
// ======= Add new URl ===========//
const addNewURL = (longURL,userID) => {
  const shortURL = Math.random().toString(36).substr(2,8);
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID
  }
  return shortURL;
};

const updateURL = (shortURL, longURL) => {
  urlDatabase[shortURL].longURL = longURL;
}
// ========= Add new user with newID  ============//
const addNewUser = (email, password) => {
  const userID = Math.random().toString(36).substr(2,8);
  const newUser = {
   id: userID,
   email: email,
   password: password
  };
  usersDB[userID] = newUser;
  return userID;
};


// ========== checkEmail ===========//
checkEmailExists = (loginEmail) => {
  for (let id in usersDB) {
    if (usersDB[id].email === loginEmail) {
      return true;
    }
  };
  return false;
};
// =======  Get user by email & password ======== ///
const getUserByEmail = function(email) {
  for (let id in usersDB) {
    if (usersDB[id].email === email) {
      return usersDB[id];
    }
  };
  return false
};


// AuthenticateUser if its in the UsersDB.
const authenticateUser = (email, password) => {
  const user = getUserByEmail(email);     //return user
  if (user && user.password === password) {
    return user;
  };
  return false;
};


// check password 
  const checkPassword = function(loginPassword) {
    for (let user in usersDB) {
      if (usersDB[user].password === loginPassword) {
        return true;
      }
    };
    return false;
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
  const userId = req.cookies['user_id'];
  const loggedUser = usersDB[userId];
  const templateVars = {
    urls: urlDatabase,
    currentUser: loggedUser,
  };
  res.render("urls_index", templateVars);
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
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
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
  const userId = req.cookies['user_id'];
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
  const userID = req.cookies['user_id'];
  const shortURL = addNewURL(longURL, userID);
  res.redirect(`/urls/${shortURL}`);
});

// ============= Delete URL ====================
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL= req.params.shortURL;
  delete urlDatabase[shortURL];
  // redirect
  res.redirect('/urls');
  
});

// =========== Edit URL on index page =====================
app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL= req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
  
});
//======= Update/Edit the URL ============ 
app.post("/urls/:shortURL", (req, res) => {
  // get editted URL 
  const editURL = req.body['editURL'];
  //take the shortURL in params
  const shortURL= req.params.shortURL;
  // update the URL
  updateURL(shortURL, editURL);
  res.redirect(`/urls/`);
});

// ======== Login ========== //
app.post('/login', (req, res) => {
  const { email } = req.body;
  const { password } = req.body;

  // Authenticate the user
  const user = authenticateUser(email, password, usersDB);
  if(user) {
    res.cookie('user_id', user.id);
    res.redirect('/urls')
  } else if (checkEmailExists(email) === true & (checkPassword(password) === false)){
    res.status(403).send(`Status Code: ${res.statusCode}. Password is incorrect`);
  } else {
    res.status(403).send(`Status Code: ${res.statusCode}. User is not registered!`);
  };
});
//======= logout ==========
app.post('/logout', (req, res) => {
  res.cookie('user_id', null)
  // res.clearCookie("user_id", user_id);
  res.redirect('/urls/');
});

//====== registration form ======
app.post('/register', (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  // check if the user is not alrady in the database
  const user = checkEmailExists(email);
  // if user is not in the DB, add the user to the db 
  if (!user) {
    if (email.length === 0 && password.length === 0) {
      res.status(400).send(`Status Code: ${res.statusCode}. Please enter an email and password`)
    } 
    const userId = addNewUser(email, password);
    // setCookie with the userId
    res.cookie('user_id', userId)
    res.redirect('/urls/')
  } else {
    res.status(400).send(`Status Code: ${res.statusCode}. Already registered!`)
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// module.exports = app;

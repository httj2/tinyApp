const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
// const URLsRouter = require("./routes/urls");

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// app.use("/", URLsRouter);
// app.use("/", userRouter);


//=============== DATABASES ==================//
//======= url Database ===========
const urlDatabase = {
  "cp24cp24": "http://www.cp24.com",
  "9sm5xK": "http://www.google.com"
};
// ===========user Database ============
const usersDB = { 
  "t93w12": {
    id: "t93w12", 
    email: "tw@gmail.com", 
    password: "sports-r-cool"
  },
 "3t1ech": {
    id: "3t1ech", 
    email: "thella@corigs.com", 
    password: "chimken-4ever"
  }
}
//================ HELPER FUNCTIONS ====================//
// ======= Add new URl ===========//
const addNewURL = longURL => {
      // generate an Id for the short URL
  const shortURL = Math.random().toString(36).substr(2,8);
  urlDatabase[shortURL] = longURL;
  return shortURL;
}

const updateURL = (shortURL, longURL) => {
  urlDatabase[shortURL] = longURL;
}
// ========= Add new user with newID  ============//
const addNewUser = (email, password) => {
  const userID = Math.random().toString(36).substr(2,8);
  // let newUser = userID;
  // user should include user's id, email and password
  const newUser= {
   id: userID, 
   email: email,
   password: password
 };
  // generate a new unique id for each user
 usersDB[userID] = newUser;
 return userID
};


// ========== checkEmail ===========//
checkEmailExists = (loginEmail) => {
  for (id in usersDB) {
    if (usersDB[id].email === loginEmail) {
      return true;
    }
  }
  return false;
}
// =======  Get user by email & password ======== ///
const getUser = function(loginEmail, loginPassword) {
  for (let user in usersDB) {
    if (usersDB[user].email === loginEmail && usersDB[user].password === loginPassword) {
      return user;
    }
  }
  return undefined
};

// Check email && password 
  const checkPassword = function(loginPassword) {
    for (let user in usersDB) {
      if (usersDB[user].password === loginPassword) {
        return true;
      }
    }
    return false
  };


//============== GET ====================//
app.get("/login", (req, res)=> {
  res.render("user_login")
})
// ========= register Page =========//
app.get("/register", (req, res) => {
  res.render("user_registration")
});

//========= New URL to DB =================//
app.post("/urls", (req, res) => {
  const longURL = req.body['longURL']; 
  const shortURL = addNewURL(longURL);
  res.redirect(`/urls/${shortURL}`);
});

// ======= Url Index =========//
app.get("/urls", (req, res) => {
  //using user_ID look up the user of the usersDB;
  const templateVars = { 
    urls: urlDatabase,
    userEmail: usersDB[req.cookies["user_id"]].email
  };
  console.log(templateVars)
  res.render("urls_index", templateVars);
});

// === Redirecting short URLs to long URLS ==============
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  //status code: 302 --> temporarily to a new page
});


// ========= Submit new URL ============ //
app.get("/urls/new", (req, res) => {
  
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[`${req.params.shortURL}`],
    userEmail: usersDB[req.cookies["user_id"]].email
  };
  res.render("urls_new", templateVars);
});

// ======== show specific URL =========== //
app.get("/urls/:shortURL", (req, res) => {
  
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[`${req.params.shortURL}`],
    userEmail: usersDB[req.cookies["user_id"]].email
  };
  res.render("urls_show", templateVars);
});


//========******* POST ***********===========/ 

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
  const email = req.body['email'];
  const { password } = req.body;
  if (email.length === 0 && password.length === 0) {
    res.status(400).send(`Status Code: ${res.statusCode}. Please enter a valid email address!`);
    // means email is not there
  } else if (checkEmailExists(email) === false) {
    res.status(403).send(`Status Code: ${res.statusCode}. You are not register, please go register!`)
  } else if (checkEmailExists(email) === true && checkPassword(password) === false) {
    res.status(403).send(`Status Code: ${res.statusCode}. Password is incorrect!`)
  } 
  const user_id = getUser(email, password)
  res.cookie('user_id', user_id);
  res.redirect('/urls/')
})
//======= logout ==========
app.post('/logout', (req, res) => {
  // req.cookie = null;
  const { user_id } = req.body;
  console.log(user_id);
  res.clearCookie("user_id", user_id);
  res.redirect('/urls/');
});

//====== registration form ======
app.post('/register', (req, res) => {
  const email = req.body['email'];
  const { password } = req.body;
  //If the e-mail or password are empty strings, send back a response with the 400 status code.
  if (email.length === 0 && password.length === 0) {
    res.status(400).send(`Status Code: ${res.statusCode}. Please enter a valid email address!`);
  } else if (checkEmailExists(email)) {
    res.status(400).send(`Status Code: ${res.statusCode}. Already registered!`)
  } else {
  const user_id = addNewUser(email, password);
  res.cookie('user_id', user_id)
  res.redirect('/urls/')
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// module.exports = app;

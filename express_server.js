const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
// const URLsRouter = require("./routes/urls");

app.set('view engine', 'ejs');
app.use(cookieParser());

// app.use("/", URLsRouter);
// app.use("/", userRouter);

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
    password: "sports-r-coolr"
  },
 "3t1ech": {
    id: "3t1ech", 
    email: "thella@corigs.com", 
    password: "chimken-4ever"
  }
}

// Helper function to create put the url into the shortURL
const addNewURL = longURL => {
      // generate an Id for the short URL
  const shortURL = Math.random().toString(36).substr(2,8);
  urlDatabase[shortURL] = longURL;
  return shortURL;
}

const updateURL = (shortURL, longURL) => {
  urlDatabase[shortURL] = longURL;
}
// ========= Helper FN to creat e a newuser ============
const addNewUser = content => {
  const userID = Math.random().toString(36).substr(2,8);
  console.log(userID);
  console.log(usersDB[userID]);
 const newUser = {
   id: userID
  //  email: usersDB[userID].email,
  //  password:  usersDB[userID].password,
 }
  usersDB[userID] = newUser;
 return userID
}

const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.get("/", (req, res) => {
  res.send("Hello!");
});

//
app.get("/register", (req, res) => {
  res.render("user_registration")
});

//========= New URL to DB =================
app.post("/urls", (req, res) => {
  // extract the info contained in the form
  const longURL = req.body['longURL']; 
  // console.log("CONTENT", longURL);
  // create a new url in the database
  const shortURL = addNewURL(longURL);
  // console.log(`shortURL in post: ${shortURL}`); 
  res.redirect(`/urls/${shortURL}`);
});

//
app.get("/urls", (req, res) => {
  // console.log(username)
  // console.log('Cookies: ', req.cookies)
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  // console.log(templateVars)
  res.render("urls_index", templateVars);
});

// ============= Redirecting short URLs to long URLS ==============
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  //status code: 302 --> temporarily to a new page
});


// ========= Submit new URL ================
app.get("/urls/new", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[`${req.params.shortURL}`],
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// ======== showing all urls ============
app.get("/urls/:shortURL", (req, res) => {
  
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[`${req.params.shortURL}`],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
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

// ===== Sign in ==========
app.post('/login', (req, res) => {
  const { username } = req.body;
  // console.log(`Username is: ${username}`);

  res.cookie("username", username);
  // res.redirect('/logout')
// //  }
  res.redirect('/urls/')
})
//======= logout ==========
app.post('/logout', (req, res) => {
  // req.cookie = null;
  const { username } = req.body;
  res.clearCookie("username", username)
  res.redirect('/urls/')
});

//====== registration form ======
app.post('/register'), (req, res) => {
  //extract the info form the form
  const email = req.body['email']
  console.log(`email: ${email}`);
  const userID = addNewUser(email);
  console.log(userID)
  // const { password } = req.body;
  // add new user to global usersDb
  // user should include user's id, email and password
  // generate a new unique id for each user
  // set a user_id cookie containing the user's newly generated ID
  // res.clearCookie("username", username)
  //Redirect the user to the /urls page.
  res.redirect('/urls/')
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// module.exports = app;

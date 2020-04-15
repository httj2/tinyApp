const express = require("express");
// const router = express.Router();

const urlDatabase = {
  "cp24cp24": "http://www.cp24.com",
  "9sm5xK": "http://www.google.com"
};

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

//========= New URL to DB =================
router.post("/urls", (req, res) => {
  // extract the info contained in the form
  const longURL = req.body['longURL']; 
  // console.log("CONTENT", longURL);
  // create a new url in the database
  const shortURL = addNewURL(longURL);
  // console.log(`shortURL in post: ${shortURL}`); 
  res.redirect(`/urls/${shortURL}`);
});

//
router.get("/urls", (req, res) => {
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
router.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  //status code: 302 --> temporarily to a new page
});


// ========= Submit new URL ================
router.get("/urls/new", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[`${req.params.shortURL}`],
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});


router.get("/urls/:shortURL", (req, res) => {
  
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[`${req.params.shortURL}`],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// ============= Delete URL ====================
router.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL= req.params.shortURL;
  delete urlDatabase[shortURL];
  // redirect
  res.redirect('/urls');
  
});

// =========== Edit URL on index page =====================
router.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL= req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
  
});
//======= Update/Edit the URL ============ 
router.post("/urls/:shortURL", (req, res) => {
  // get editted URL 
  const editURL = req.body['editURL'];
  //take the shortURL in params
  const shortURL= req.params.shortURL;
  // update the URL
  updateURL(shortURL, editURL);
  res.redirect(`/urls/`);
});

// ===== Sign in ==========
router.post('/login', (req, res) => {
  const { username } = req.body;
  // console.log(`Username is: ${username}`);

  res.cookie("username", username);
  // res.redirect('/logout')
// //  }
  // console.log(username)
  res.redirect('/urls/')
});
//======= logout ==========
router.post('/logout', (req, res) => {
  // req.cookie = null;
  const { username } = req.body;
  res.clearCookie("username", username)
  res.redirect('/urls/')
});














// module.exports = router;
const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
app.set('view engine', 'ejs');

const urlDatabase = {
  "cp24cp24": "http://www.cp24.com",
  "9sm5xK": "http://www.google.com"
};

// Helper function to create put the url into the shortURL
const addNewURL = longURL => {
      // generate an Id for the short URL
  const shortURL = Math.random().toString(36).substr(2,8);
      // create a new urll object
      console.log(shortURL)
  const newURL = {
    [shortURL]: longURL,
  };
  console.log(newURL)
      // Add it to urlDataBasecd
  urlDatabase[shortURL] = longURL;
      // return it // displays on the show page
  return shortURL;
}


const bodyParser = require("body-parser");


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.use(bodyParser.urlencoded({extended: true}));
app.get("/", (req, res) => {
  res.send("Hello!");
});

// create a new url and add to DB
app.post("/urls", (req, res) => {
  // extract the info contained in the form
  const longURL = req.body['longURL']; 
  // console.log("CONTENT", longURL);
  // create a new url in the database
  const shortURL = addNewURL(longURL);
  // console.log(`shortURL in post: ${shortURL}`); 
  res.redirect(`/urls/${shortURL}`);
});

//Redirecting Short URLs to the long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  //status code: 302 --> temporarily to a new page
});


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase};
  // let templateVars = { greeting: 'Welcome!!' };
  res.render("urls_index", templateVars);
});

// rendering submit page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[`${req.params.shortURL}`],
  };


  res.render("urls_show", templateVars);
});

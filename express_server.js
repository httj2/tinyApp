const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
app.set('view engine', 'ejs');

const urlDatabase = {
  "cp24cp24": "http://www.cp24.com",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase};
  // let templateVars = { greeting: 'Welcome!!' };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: (Object.keys(urlDatabase)[0]), longURL: urlDatabase.cp24cp24 };
  res.render("urls_show", templateVars);
});
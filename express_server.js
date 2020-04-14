const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
app.set('view engine', 'ejs');

const urlDatabase = {
  "cp24cp24": "http://www.cp24.com",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {

}
const bodyParser = require("body-parser");


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.use(bodyParser.urlencoded({extended: true}));
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  if (res.statusCode !== 200) {
    const msg = `Status Code ${res.statusCode} when fetching IP. Response: ${body}`;
    callback(Error(msg), null);
    return;
  }
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase};
  // let templateVars = { greeting: 'Welcome!!' };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: (Object.keys(urlDatabase)[0]), longURL: urlDatabase.cp24cp24 };
  res.render("urls_show", templateVars);
});

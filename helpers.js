const bcrypt = require('bcrypt');

// Add new url to urlDatabase. Every new URL will have a unique shortURL, the longURL and userID(in respect to the user who created the url) that will be added to the url database.
const addNewURL = (longURL, userID, database) => {
  const shortURL = Math.random().toString(36).substr(2,8);
  database[shortURL] = {
    longURL: longURL,
    userID: userID
  };
  return shortURL;
};

// Updates the URL when editted and will return that editted URL with the respecting shortURL.
const updateURL = (shortURL, longURL, database) => {
  database[shortURL].longURL = longURL;
};

// Adds a new user to the users datatabase. Every new user will have a unique ID, email, and password will be added to the database.
const addNewUser = (email, password, database) => {
  // create a unique userID
  const userID = Math.random().toString(36).substr(2,8);
  database[userID] = {
    id: userID,
    email: email,
    password: password
  };
  return userID;
};

// Checks if the email is in the Database;
// returns true if the email is in the database, otherwise it returns false.
const checkEmailExists = (email, database) => {
  for (let id in database) {
    if (database[id].email === email) {
      return true;
    }
  }
  return false;
};

// Gets the User by email
// returns the id that matches the email in database, otherwise it returns undefined
const getUserByEmail = (email, database) => {
  for (let id in database) {
    if (database[id].email === email) {
      return id;
    }
  }
  return undefined;
};


//Authenticates user by email and password
//Returns user object if authenticated otherwise returns false
const authenticateUser = (email, password, database) => {
  const id = getUserByEmail(email, database);
  const user = database[id];
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return false;
};

//Finds urls that corresponds to that specific User
//Returns any url that user created.
const urlsForUser = function(id, database) {
  const userURL = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userURL[shortURL] = database[shortURL].longURL;
    }
  }
  return userURL;
};


module.exports = {
  addNewURL,
  addNewUser,
  authenticateUser,
  checkEmailExists,
  getUserByEmail,
  updateURL,
  urlsForUser
};
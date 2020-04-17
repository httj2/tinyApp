// const express = require("express");
// const { usersDB } = require('');
const bcrypt = require('bcrypt');
// ======= Add new URl ===========//
const addNewURL = (longURL,userID, database) => {
  const shortURL = Math.random().toString(36).substr(2,8);
  database[shortURL] = {
    longURL: longURL,
    userID: userID
  }
  return shortURL;
};

const updateURL = (shortURL, longURL, database) => {
  database[shortURL].longURL = longURL;
}

// ========= Add new user with newID  ============//
const addNewUser = (email, password, database) => {
  const userID = Math.random().toString(36).substr(2,8);
  const newUser = {
   id: userID,
   email: email,
   password: password
  };
  database[userID] = newUser;
  return userID;
};
// ======== Check Email ====== //
checkEmailExists = (email, database) => {
  for (let id in database) {
    if (database[id].email === email) {
      return true;
    }
  };
  return false;
};
//// ====== Get user by email ===== //
const getUserByEmail = (email, database) => {
  for (let id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  };
  return false
};


// AuthenticateUser if its in the UsersDB.
const authenticateUser = (email, password, database) => {
  const user = getUserByEmail(email, database);     //return user
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  };
  return false;
};

// ======== Only display URLs for user's urls=====// 
const urlsForUser = function(id, database) { 
  // take in an id 
  const userURL = {};
  for (shortURL in database) { 
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
  updateURL,
  urlsForUser
}
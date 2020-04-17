const bcrypt = require('bcrypt');

const uniqueId = Math.random().toString(36).substr(2,8);

// ======= Add new URl ===========//
const addNewURL = (longURL, userID, database) => {
  const shortURL = uniqueId;
  database[shortURL] = {
    longURL: longURL,
    userID: userID
  }
  return shortURL;
};

const updateURL = (id, longURL, database) => {
  database[id].longURL = longURL;
}

// ========= Add new user with newID  ============//
const addNewUser = (email, password, database) => {
  const userID = uniqueId;
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
      return id;
    }
  };
  return undefined
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
  getUserByEmail,
  updateURL,
  urlsForUser
}
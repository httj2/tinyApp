// ======= Add new URl ===========//
const addNewURL = longURL => {
  const shortURL = Math.random().toString(36).substr(2,8);
  urlDatabase[shortURL] = longURL;
  return shortURL;
}
// ========updateURL ========//
const updateURL = (shortURL, longURL) => {
  urlDatabase[shortURL] = longURL;
}
// ========= Add new user with newID  ============//
const addNewUser = (email, password) => {
  const userID = Math.random().toString(36).substr(2,8);
  const newUser= {
   id: userID, 
   email: email,
   password: password
 };
 usersDB[userID] = newUser;
 return userID
};
// ========== checkEmail ===========//
checkEmailExists = (loginEmail) => {
  for (id in usersDB) {
    if (usersDB[id].email === loginEmail) {
      return true;
    }
  };
  return false;
};
// =======  Get user by email & password ======== ///
const getUser = function(loginEmail, loginPassword) {
  for (let user in usersDB) {
    if (usersDB[user].email === loginEmail && usersDB[user].password === loginPassword) {
      return user;
    }
  };
  return undefined
};

// Check email && password 
const checkPassword = function(loginPassword) {
   for (let user in usersDB) {
    if (usersDB[user].password === loginPassword) {
      return true;
    }
  };
  return false;
};

module.exports = {
  addNewURL,
  updateURL,
  addNewUser,
  checkEmailExists,
  getUser,
  checkPassword,
}
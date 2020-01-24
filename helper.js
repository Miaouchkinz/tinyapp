// GLOBAL FUNCTIONS
// ======================

// returns the URLs where the userID is equal to the id of the currently logged in
// user.
const urlsForUser = (db, id) => {
  let urlsForUserID = {};
  for (let shortURL in db) {
    if (id === db[shortURL].userID) {
      urlsForUserID[shortURL] = db[shortURL].longURL;
    }
  }
  return urlsForUserID;
};

// Checks to see if a user with that email already exists
const existingUser = (email, db) => {
  let foundUser;
  for (let existingUserID in db) {
    if (db[existingUserID].email === email) {
      foundUser = db[existingUserID];
    }
  }
  return foundUser;
};

module.exports = { urlsForUser, existingUser};
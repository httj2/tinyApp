const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput)
  });
  it('should return undefined if user email is not in database', () => {
    const user = getUserByEmail("george@george.com", testUsers);
    assert.isUndefined(user)
  });
  it('should return undefined if email is empty', () => {
    const user = getUserByEmail("", testUsers);
    assert.isUndefined(user)
  });
});
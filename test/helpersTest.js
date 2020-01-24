const { assert } = require('chai');
const { existingUser } = require('../helper.js');

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

describe('existingUser', function() {
  it('should return a user with valid email', function() {
    const user = existingUser("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
  it('should return undefined if email does not exist in database', function() {
    const user = existingUser("hello@domain.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});
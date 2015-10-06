import assert from 'assert';
let Client = require(__dirname + '/../client/restClient');

describe('Authentication', function(){
  let client;

  let testMngr = require('../testManager');

  before(async () => {
      await testMngr.start();
  });
  after(async () => {
      await testMngr.stop();
  });

  beforeEach(async () => {
    client = new Client();
  });

  describe('After Login', () => {
    beforeEach(async () => {
      let postParam = {
          username:"alice",
          password:"password",
          email:"alice@mail.com"
      };

      await client.login(postParam);
    });

    it('should logout', async () => {
      await client.post('v1/auth/logout');
      try {
        await client.get('v1/auth/session');
        assert(false);
      } catch(err){
        assert(err);
      }
    });
  });

  it('login without parameters should return bad request', async () => {
    try {
      await client.login();
      assert(false);
    } catch(err){
      assert(err);
      assert.equal(err.statusCode, 400);
      assert.equal(err.body, "Bad Request");
    }
  });

  it('logout without login should fail', async () => {
    try {
      await client.post('v1/auth/logout');
      assert(false);
    } catch(err){
      assert(err);
      assert.equal(err.statusCode, 401);
      assert.equal(err.body, "Unauthorized");
    }
  });

  it('session without login should fail', async () => {
    try {
      await client.get('v1/me');
      assert(false);
    } catch(err){
      assert(err);
      assert.equal(err.statusCode, 401);
      assert.equal(err.body, "Unauthorized");
    }
  });

  it('should not login with unknown username', async () => {
    let postParam = {
        username:"idonotexist",
        password:"password"
    };

    try {
      await client.login(postParam);
      assert(false);
    } catch(err){
      assert(err);
      assert.equal(err.statusCode, 401);
      assert.equal(err.body, "Unauthorized");
    }
  });

  it('should not login with empty password', async () => {
    let postParam = {
        username:"bob"
    };

    try {
      await client.login(postParam);
      assert(false);
    } catch(err){
      assert(err);
      assert.equal(err.statusCode, 400);
      assert.equal(err.body, "Bad Request");
    }
  });

  it('should not login with wrong password', async () => {
    let postParam = {
        username:"admin",
        password:"passwordaaaaaa"
    };

    try {
      await client.login(postParam);
      assert(false);
    } catch(err){
      assert(err);
      assert.equal(err.statusCode, 401);
      assert.equal(err.body, "Unauthorized");
    }
  });
  it('should login with params', async () => {
    let postParam = {
        username:"alice",
        password:"password",
        email:"alice@mail.com"
    };

    let user =  await client.login(postParam);
    assert(user);
    assert.equal(user.username, postParam.username);
    assert(!user.password);
  });
  it('should login admin with testManager', async () => {
    let clientAdmin = testMngr.client("admin");
    let user = await clientAdmin.login();
    assert(user);
    assert.equal(user.username, "admin");
  });
});

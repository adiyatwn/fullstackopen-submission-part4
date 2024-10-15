const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

describe('user test', async () => {
  beforeEach(async () => {
    await User.deleteMany({})

    let userObj = new User(helper.initialUsers[0])
    await userObj.save()

    userObj = new User(helper.initialUsers[1])
    await userObj.save()
  })

  test('user without username/password/name are not created', async () => {
    const invalidUser1 = {}
    const invalidUser2 = {
      username: "user2"
    }
    const invalidUser3 = {
      username: "user3",
      password: "user3"
    }

    const savedUser1 = await api.post('/api/users').send(invalidUser1).expect(400)
    const savedUser2 = await api.post('/api/users').send(invalidUser2).expect(400)
    const savedUser3 = await api.post('/api/users').send(invalidUser3).expect(400)
    const userAtEnd = await helper.usersInDb()

    assert.strictEqual(userAtEnd.length, helper.initialUsers.length)
    assert(savedUser1.body.error.includes("username, password and name is required"))
    assert(savedUser2.body.error.includes("username, password and name is required"))
    assert(savedUser3.body.error.includes("username, password and name is required"))
  })

  test('user with invalid username or password are not created', async () => {
    const invalidUser1 = {
      username: "ab",
      password: "user1",
      name: "user1"
    }
    const invalidUser2 = {
      username: "user2",
      password: "12",
      name: "user2"
    }

    const savedUser1 = await api.post('/api/users').send(invalidUser1).expect(400)
    const savedUser2 = await api.post('/api/users').send(invalidUser2).expect(400)

    const userAtEnd = await helper.usersInDb()

    assert.strictEqual(userAtEnd.length, helper.initialUsers.length)
    assert(savedUser1.body.error.includes("min. username is 3 characters long"))
    assert(savedUser2.body.error.includes("min. password is 3 characters long"))
  })

})

after(async () => {
  await mongoose.connection.close()
})

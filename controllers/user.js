const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')

userRouter.post('/', async (request, response, next) => {
  const { username, password, name } = request.body

  if (!username || !password || !name) {
    return response.status(400).json({ error: "username, password and name is required" })
  }

  if (username.length < 3) {
    return response.status(400).json({ error: "min. username is 3 characters long" })
  } else if (password.length < 3) {
    return response.status(400).json({ error: "min. password is 3 characters long" })
  }

  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    hashedPassword,
    name
  })

  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })

  response.json(users)
})

userRouter.delete('/deleteAll', async (request, response) => {
  await User.deleteMany({})
  response.status(204).end()
})

module.exports = userRouter

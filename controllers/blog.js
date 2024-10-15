const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

const randomId = async () => {
  const users = await User.find({}, { name: 1, username: 1 })
  const random = Math.floor(Math.random(users.length))

  return users[random]._id.toString()
}

blogRouter.get('/', async (request, response, next) => {
  try {
    await randomId()
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

blogRouter.post('/', async (request, response) => {
  const body = request.body

  const randomUser = await randomId()

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: randomUser
  })

  try {
    const savedBlog = await blog.save()
    // NOTE: update User's blogs
    await User.findByIdAndUpdate(randomUser, { $push: { blogs: savedBlog._id } });
    response.status(201).json(savedBlog)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

blogRouter.delete('/deleteAll', async (request, response) => {
  await Blog.deleteMany({})
  response.status(204).end()
})

blogRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id

  try {
    await Blog.findByIdAndDelete(id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

blogRouter.delete('/deleteAll', async (request, response) => {
  await Blog.deleteMany({})
  response.status(204).end()
})

blogRouter.put('/:id', async (request, response, next) => {
  const body = request.body
  const id = request.params.id

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true })
    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogRouter

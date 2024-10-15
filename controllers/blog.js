const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')


blogRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

blogRouter.post('/', middleware.userExtractor, async (request, response, next) => {
  const body = request.body

  try {
    const user = request.user

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id
    })

    try {
      const savedBlog = await blog.save()
      // NOTE: update User's blogs
      await User.findByIdAndUpdate(user._id, { $push: { blogs: savedBlog._id } });
      response.status(201).json(savedBlog)
    } catch (error) {
      response.status(400).json({ error: error.message })
    }
  } catch (error) {
    next(error)
  }
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
  const id = request.params.id

  try {
    const user = request.user
    const blog = await Blog.findById(id)

    if (blog.user.toString() === user._id.toString()) {
      await Blog.findByIdAndDelete(id)
      return response.status(204).end()
    } else {
      return response.status(401).json({ error: 'token invalid' })
    }
  } catch (error) {
    console.log(error)
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

const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObj = new Blog(initialBlogs[0])
  await blogObj.save()
  blogObj = new Blog(initialBlogs[1])
  await blogObj.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, 2)
})

test('unique identifier property of blog is named id', async () => {
  const response = await api.get('/api/blogs')
  const objKey = Object.keys(response.body[0])

  assert(!objKey.includes('_id') && objKey.includes('id'))
})

test('post a blog post', async () => {
  const newBlog = {
    title: "Test",
    author: "Blog post test",
    url: "https://test.com/",
    likes: 0,
  }

  await api.post('/api/blogs').send(newBlog).expect(201).expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const contents = response.body.map(b => b.title)

  assert.strictEqual(response.body.length, initialBlogs.length + 1)
  assert(contents.includes('Test'))
})

after(async () => {
  await mongoose.connection.close()
})

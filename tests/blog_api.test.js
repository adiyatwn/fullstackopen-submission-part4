const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObj = new Blog(helper.initialBlogs[0])
  await blogObj.save()

  blogObj = new Blog(helper.initialBlogs[1])
  await blogObj.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
  const blogsInDb = await helper.blogsInDb()

  assert.strictEqual(blogsInDb.length, 2)
})

test('unique identifier property of blog is named id', async () => {
  const blogsInDb = await helper.blogsInDb()
  const objKey = Object.keys(blogsInDb[0])

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

  const blogsInDb = await helper.blogsInDb()

  const contents = blogsInDb.map(b => b.title)

  assert.strictEqual(blogsInDb.length, helper.initialBlogs.length + 1)
  assert(contents.includes('Test'))
})

test('if the likes property is missing, default value is 0', async () => {
  const newBlog = {
    title: "missing likes",
    author: "Missing likes",
    url: "https://test.com/",
    //likes: 0,  //missing
  }

  await api.post('/api/blogs').send(newBlog).expect(201).expect('Content-Type', /application\/json/)

  const blogsInDb = await helper.blogsInDb()

  const likes = blogsInDb.map(b => b.likes)

  assert.strictEqual(blogsInDb.length, helper.initialBlogs.length + 1)
  assert(likes[likes.length - 1] === 0)
})

test('if title or url mising, respond with status code 400', async () => {
  const missingTitleBlog = {
    author: "test author",
    url: "https://test.com/",
    likes: 10
  }

  const missingUrlBlog = {
    title: "missing url",
    author: "test author",
    likes: 10
  }

  await api.post('/api/blogs').send(missingTitleBlog).expect(400)
  await api.post('/api/blogs').send(missingUrlBlog).expect(400)

  const blogsInDb = await helper.blogsInDb()
  assert.strictEqual(blogsInDb.length, helper.initialBlogs.length)
})

test('delete blog post', async () => {
  const blogBefore = await helper.blogsInDb()
  const firstPostId = blogBefore[0].id

  await api.delete(`/api/blogs/${firstPostId}`)

  const blogAfter = await helper.blogsInDb()
  const ids = blogAfter.map(b => b.id)

  assert.strictEqual(blogAfter.length, helper.initialBlogs.length - 1)
  assert(!ids.includes(firstPostId))
})

test('update an individual blog post', async () => {
  const newBlog = {
    title: 'Updated post',
    author: 'Updated author',
    url: 'https://example.com',
    likes: 15
  }

  const blogBefore = await helper.blogsInDb()
  const firstPostId = blogBefore[0].id

  await api.put(`/api/blogs/${firstPostId}`).send(newBlog)

  const blogAfter = await helper.blogsInDb()
  const titles = blogAfter.map(b => b.title)

  assert(titles.includes('Updated post'))
})

after(async () => {
  await mongoose.connection.close()
})

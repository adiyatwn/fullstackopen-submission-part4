const dummy = (blogs) => {
  // ...
  return 1
}

const totalLikes = (blogs) => {
  const likes = blogs.reduce((total, current) => {
    return total + current.likes
  }, 0)

  return likes
}

const favoriteBlog = (blogs) => {

  const favoriteBlog = blogs.reduce((favorite, next) => {
    if (favorite.likes > next.likes) {
      return favorite
    } else {
      return next
    }
  }, {})

  return favoriteBlog
}

const mostBlogs = (blogs) => {
  let authorList = []

  blogs.forEach(blog => {
    if (!authorList.some(a => a.author === blog.author)) {
      authorList.push({ author: blog.author, blogs: 1 })
    } else {
      const authorId = authorList.map(a => a.author).indexOf(blog.author)
      authorList[authorId].blogs += 1;
    }
  })

  let mostBlogs = authorList.reduce((mostBlog, next) => {
    if (mostBlog.blogs > next.blogs) {
      return mostBlog
    } else {
      return next
    }
  }, authorList[0])

  return mostBlogs
}

const mostLikes = (blogs) => {
  let authorList = []

  blogs.forEach(blog => {
    if (!authorList.some(a => a.author === blog.author)) {
      authorList.push({ author: blog.author, likes: blog.likes })
    } else {
      const authorId = authorList.map(a => a.author).indexOf(blog.author)
      authorList[authorId].likes += blog.likes;
    }
  })

  let mostLikes = authorList.reduce((mostLike, next) => {
    if (mostLike.likes > next.likes) {
      return mostLike
    } else {
      return next
    }
  }, authorList[0])

  return mostLikes
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}

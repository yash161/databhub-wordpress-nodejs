const express = require('express');
const router = express.Router();
const blogPosts = require('../data/blog-posts.json');
const seoData = require('../data/seo.json');

function getSeo(path) {
  return seoData[path] || { title: 'DataHub Blog', description: '', canonical: path };
}

// Blog listing
router.get('/news-blog', (req, res) => {
  const seo = getSeo('/news-blog');
  res.render('pages/blog/index', {
    title: seo.title,
    metaDescription: seo.description,
    canonicalUrl: '/news-blog',
    posts: blogPosts
  });
});

// Individual blog posts
blogPosts.forEach(post => {
  router.get('/' + post.slug, (req, res) => {
    const seo = getSeo('/' + post.slug);
    res.render('pages/blog/post', {
      title: seo.title,
      metaDescription: seo.description,
      canonicalUrl: '/' + post.slug,
      post: post
    });
  });
});

module.exports = router;

const prisma = require('../utils/prisma');
const catchAsync = require('../utils/catchAsync');

const site = 'https://v3classes.co.in';
const published = { isPublished: true };

function escape(text) {
  return text.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function page(title, description, path, content) {
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} | V3 Classes Khagaul, Patna</title>
<meta name="description" content="${escape(description)}">
<link rel="canonical" href="${site}${path}">
<style>
body{margin:2rem auto;padding:0 1rem;max-width:44rem;font:1.1rem/1.65 system-ui;color:#111827}
a{color:#1d4ed8} h1,h2{line-height:1.2} article p{overflow-wrap:anywhere}
</style></head><body>
<header><nav><a href="${site}/">V3 Classes</a> · <a href="${site}/articles">Articles</a></nav></header>
<main>${content}</main></body></html>`;
}

exports.list = catchAsync(async (req, res) => {
  const data = await prisma.article.findMany({ orderBy: { updatedAt: 'desc' } });
  res.json({ status: 'success', data });
});

exports.create = catchAsync(async (req, res) => {
  const data = await prisma.article.create({ data: req.body });
  res.status(201).json({ status: 'success', data });
});

exports.update = catchAsync(async (req, res) => {
  const data = await prisma.article.update({ where: { id: req.params.id }, data: req.body });
  res.json({ status: 'success', data });
});

exports.remove = catchAsync(async (req, res) => {
  await prisma.article.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

exports.index = catchAsync(async (req, res) => {
  const articles = await prisma.article.findMany({
    where: published,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, summary: true },
  });
  const entries = articles.map(({ id, title, summary }) =>
    `<article><h2><a href="${site}/articles/${encodeURIComponent(id)}">${escape(title)}</a></h2><p>${escape(summary)}</p></article>`
  ).join('');
  res.send(page('Articles', 'Articles from V3 Classes in Khagaul, Patna.', '/articles',
    `<h1>Articles</h1>${entries || '<p>No articles have been published yet.</p>'}`));
});

exports.show = catchAsync(async (req, res) => {
  const article = await prisma.article.findFirst({ where: { ...published, id: req.params.id } });
  if (!article) {
    return res.status(404).send(page('Article unavailable', 'This article is unavailable.', '/articles',
      '<h1>Article unavailable</h1>'));
  }

  const content = article.body.split(/\r?\n[ \t]*\r?\n/).map(paragraph =>
    `<p>${escape(paragraph).replace(/\r?\n/g, '<br>')}</p>`
  ).join('');
  res.send(page(article.title, article.summary, `/articles/${encodeURIComponent(article.id)}`,
    `<article><h1>${escape(article.title)}</h1><p>${escape(article.summary)}</p>${content}</article>`));
});

exports.sitemap = catchAsync(async (req, res) => {
  const articles = await prisma.article.findMany({
    where: published,
    select: { id: true, updatedAt: true },
  });
  const entries = articles.map(({ id, updatedAt }) =>
    `<url><loc>${site}/articles/${encodeURIComponent(id)}</loc><lastmod>${updatedAt.toISOString()}</lastmod></url>`
  ).join('');
  res.type('xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${site}/articles</loc></url>${entries}</urlset>`);
});

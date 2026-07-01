// simple express server to run frontend production build;
const express = require('express')
const path = require('path')
const app = express()
const distDir = path.join(__dirname, 'dist/pwa')

app.use(express.static(distDir))
app.get('/*', function (req, res) {
  res.sendFile(path.join(distDir, 'index.html'))
})
app.listen(4000)

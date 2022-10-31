var express = require('express')
var app = express()

app.get('/', function(req, res) {
	
	res.render('index', {title: 'Mi aplicación Node.js'})
})

module.exports = app;

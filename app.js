var express = require('express')
var app = express()

var mysql = require('mysql')
const jwt=require('jsonwebtoken')


var myConnection  = require('express-myconnection')

var config = require('./config')
var dbOptions = {
	host:	  config.database.host,
	user: 	  config.database.user,
	password: config.database.password,
	port: 	  config.database.port, 
	database: config.database.db
}

app.use(myConnection(mysql, dbOptions, 'pool'))

app.set('view engine', 'ejs')


var index = require('./routes/index')
var todo = require('./routes/todo')


var expressValidator = require('express-validator')
app.use(expressValidator())


var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

var methodOverride = require('method-override')

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}))


var flash = require('express-flash')
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser('keyboard cat'))
app.use(session({ 
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 60000 }
}))
app.use(flash())


app.use('/', index)
app.use('/tareas', todo)
app.get('/api',validateToken, (req,res)=>{
	res.json({
		user:[
			{
				id:1,
				username:'mauricio'
			},
			{
				id:2,
				username:'daniel'
			}
		]
	});
});
app.get('/login', (req,res)=>{
	res.send(
		`<html>
			<head>
				<title>Login</title>
			</head>
			<body>
				<form method="post" action="/auth">
					<label for="nombre">Nombre de Usuario:</label>
					<input type="text" name="username">
					<br>
					<label for="password">Contraseña:</label>
					<input type="password" name="password">
					<br>
					<button type="submit">Iniciar sesion</button>
				</form>
			</body>
		</html>`
	);
});
app.post('/auth', (req,res)=>{
	const {username,password}=req.body

	const user={username:username}
	const accessToken=generateAccessToken(user);
	res.header('authorixation',accessToken).json({
		message:'Usuario autenticado',
		token:accessToken
	})
});
function generateAccessToken(user){
	return jwt.sign(user,'secretkey',{expiresIn:'5m'})
}
function validateToken(req,res,next){
	const accessToken=req.headers['authorization'];
	if(!accessToken)res.send('Acceso denegado');
	jwt.verify(accessToken,'secretkey',(err,user)=>{
		if(err){
			res.send('Acceso denegado, token expirado o incorrecto');
		}else{
			next();
		}
	})
}
app.listen(3000, function(){
	console.log('Servidor ejecutándose en el puerto 3000: http://127.0.0.1:3000')
})

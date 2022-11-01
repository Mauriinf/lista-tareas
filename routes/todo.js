var express = require('express')
var app = express()

app.get('/', function(req, res, next) {
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM tareas ORDER BY id DESC',function(err, rows, fields) {
			if (err) {
				req.flash('error', err)
				res.render('todo/list', {
					title: 'Lista de Tareas', 
					data: ''
				})
			} else {
				res.render('todo/list', {
					title: 'Lista de Tareas', 
					data: rows
				})
			}
		})
	})
})

// Vista nuevo Todo
app.get('/add', function(req, res, next){	
	// render to views/todo/add.ejs
	res.render('todo/add', {
		title: 'Nueva Tarea',
		nombre: '',
		descripcion: '',
		estado: ''		
	})
})

// Agregar nuevo todo por metodo POST
app.post('/add', function(req, res, next){	
	req.assert('nombre', 'Nombre es requerido').notEmpty()          
	req.assert('descripcion', 'Descripcion es requerido').notEmpty()            
    req.assert('estado', 'seleccione un estado').notEmpty() 

    var errors = req.validationErrors()
    
    if( !errors ) {   //No se encontraron errores. ¡Validación aprobada!
		
		var todo = {
			nombre: req.sanitize('nombre').escape().trim(),
			descripcion: req.sanitize('descripcion').escape().trim(),
			estado: req.sanitize('estado').escape().trim()
		}
		
		req.getConnection(function(error, conn) {
			conn.query('INSERT INTO tareas SET ?', todo, function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					
					// render to views/todo/add.ejs
					res.render('todo/add', {
						title: 'Agregar Nueva Tarea',
						nombre: todo.nombre,
						descripcion: todo.descripcion,
						estado: todo.estado				
					})
				} else {				
					req.flash('success', 'Datos Agregados Correctamente!')
					
					// render to views/todo/add.ejs
					res.render('todo/add', {
						title: 'Agregar Nueva Tarea',
						nombre: '',
						descripcion: '',
						estado: ''					
					})
				}
			})
		})
	}
	else {   //Display errors to todo
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})				
		req.flash('error', error_msg)		
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('todo/add', { 
            title: 'Agregar Nuevo Tarea',
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            estado: req.body.estado
        })
    }
})

// Ver formulario editar Todo
app.get('/edit/(:id)', function(req, res, next){
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM tareas WHERE id = ?', [req.params.id], function(err, rows, fields) {
			if(err) throw err
			
			// Si todo no se encuentra
			if (rows.length <= 0) {
				req.flash('error', 'Tarea no encontrado con id = ' + req.params.id)
				res.redirect('/tareas')
			}
			else {
				// render to views/todo/edit.ejs 
				res.render('todo/edit', {
					title: 'Editar Tarea', 
					//data: rows[0],
					id: rows[0].id,
					nombre: rows[0].nombre,
					descripcion: rows[0].descripcion,
					estado: rows[0].estado					
				})
			}			
		})
	})
})

// Editar Todo Accion Post
app.put('/edit/(:id)', function(req, res, next) {
	req.assert('nombre', 'Nombre es requerido').notEmpty()           
	req.assert('descripcion', 'Descripcion es requerido').notEmpty()             
    req.assert('estado', 'Estado es requerido').notEmpty()  

    var errors = req.validationErrors()
    
    if( !errors ) {   //No se encontraron errores!
		
		var todo = {
			nombre: req.sanitize('nombre').escape().trim(),
			descripcion: req.sanitize('descripcion').escape().trim(),
			estado: req.sanitize('estado').escape().trim()
		}
		
		req.getConnection(function(error, conn) {
			conn.query('UPDATE tareas SET ? WHERE id = ' + req.params.id, todo, function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					
					// render to views/todo/add.ejs
					res.render('todo/edit', {
						title: 'Editar Tarea',
						id: req.params.id,
						nombre: req.body.nombre,
						descripcion: req.body.descripcion,
						estado: req.body.estado
					})
				} else {
					req.flash('success', 'Datos actualizados con éxito!')
					
					// render to views/todo/add.ejs
					res.render('todo/edit', {
						title: 'Editar Tarea',
						id: req.params.id,
						nombre: req.body.nombre,
						descripcion: req.body.descripcion,
						estado: req.body.estado
					})
				}
			})
		})
	}
	else {   //Mostrar errores
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)
		
		
        res.render('todo/edit', { 
            title: 'Editar Tarea',            
			id: req.params.id, 
			nombre: req.body.nombre,
			descripcion: req.body.descripcion,
			estado: req.body.estado
        })
    }
})

// ELIMINAR TODO
app.delete('/delete/(:id)', function(req, res, next) {
	var todo = { id: req.params.id }
	
	req.getConnection(function(error, conn) {
		conn.query('DELETE FROM tareas WHERE id = ' + req.params.id, todo, function(err, result) {
			//if(err) throw err
			if (err) {
				req.flash('error', err)
				// redireccionar a la pagina lista de tareas
				res.redirect('/tareas')
			} else {
				req.flash('success', 'Tarea eliminada correctamente! id = ' + req.params.id)
				
				res.redirect('/tareas')
			}
		})
	})
})

module.exports = app

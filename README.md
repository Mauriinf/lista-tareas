Node.js, Express y MySQL: Agregar, Editar, Eliminar
========

**Creating database and table**

```
create database todo;

use todo;

CREATE TABLE todo (
id int(11) NOT NULL auto_increment,
nombre varchar(100) NOT NULL,
descripcion varchar(255) NOT NULL,
estado varchar(10) NOT NULL,
PRIMARY KEY (id)
);
```

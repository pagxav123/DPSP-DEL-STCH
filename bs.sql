-- tabla para crear cuenta 
CREATE TABLE cuenta(
	Nombre varchar(30),
    Apellidos varchar(30),
    Usuario_cuenta varchar(30),
    Correo varchar(50),
    Contraseña varchar(30),
    primary key(Usuario_cuenta)
);

-- tabla de usuarios 
CREATE TABLE usuarios(
    Usuario_usuarios varchar(30),
    Contraseña varchar(30),
    primary key(Usuario_usuarios),
    FOREIGN KEY (Usuario_cuenta) REFERENCES cuenta(Usuario_cuenta)
);

INSERT INTO usuarios VALUES
('Juan','1234'),
('Maria','1324'),
('Jose','1342'),
('Lucia','4321');

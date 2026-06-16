//importamos el modulo myql2 , pero en modo promesas para poder hacer peticiones asincronas a la BBDD

import mysql2 from "mysql2/promise" //gracias a promise podremos usar async/await para tirarle sentencia SQL  a la BBDD

//importamos la informacion de la conexion a la BBDD que provee environments
import environments from "../config/environments.js"

const {database} = environments;//gracias al destructuring, extraemos solo el objeto de la conexion a la BBDD

//creamos la conexion a la BBDDD (realmente creamos un conjunto o pool de conexiones abiertas a la BBDD)

const connection = mysql2.createPool({
    host: database.host,
    database:database.name,
    user:database.user,
    password:database.password
});
/*
-QUE HISIMOS ACA ?

"SELECT * FROM products" -> createConnection , cada vez que tiremos una sentencia SQL crea un conexion y destruira esa conexion por cada consulta

con el createPool : la conexion a la BBDD nunca se cierra y podemos tirarle un monton de sentencias sin que se tenga que abrir una conexion y luego cerrarla por cada consulta

createPool() es una funcion que crea un grupo (pool) de conexiones a la BBDD
    -crea un gestor de conexiones automatico
    -se conecta a la BBDD usando los parametros  host, database,user,etc
    -le pasamos la configuracion desde el objeto databasa
    -por defecto, abre hasta 10 conexiones simultaneas
    -permite usar await conecction.query() para ejecutar SQL

*/

export default connection //exportamos esta conexion a a BBDD para poder tirare sentencias en otro modulo



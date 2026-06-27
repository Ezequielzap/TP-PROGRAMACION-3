//Importa módulos que vamos a usar.
import express from "express"
import environments from "./src/api/config/environments.js";//Trae la configuración del .env.
import connection from "./src/api/database/db.js";//Trae la conexión a MySQL.
import cors from "cors";//Permite que el frontend y backend se comuniquen aunque estén en distintos puertos.

//config
const app = express();//Crea la aplicación Express.
const PORT = environments.port;//puerto : 3000



//MIDDLEWARES

//middlewares funciones que se ejecutan durante el ciclo de solicitud y respuesta de una aplicación
app.use(cors())//mecanismo de seguridad

app.use(express.json()); // middleware para parsear el JSON de las peticiones POST y PUT
//Convierte automáticamente JSON en objetos JS.

//middleware de ruta (se usara en algunos endopoints)

const validateId = (req, res, next) => {
    //Obtiene el valor que viene en la URL.

    const id = Number(req.params.id);

    //si no es entero o es inferior a 0
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "El ID debe ser un entero positivo"
        })
    }
    req.id = id;
    next();
}

//Middleware para validar los campos de un formulario
const categoriasValidas = ["Pelota", "Botin"];
const validarProduct = (req, res, next) => {
    const { name, image, price, category } = req.body;//recogemos los datos del body

    const errores = [];//creamos un array vacio de errores

    //verificamos los datos de entrada
    if (!name || !image || !category || !price) {
        errores.push("Faltan campos por completar");
    }

    if (typeof name !== "string" || name.trim().length < 2) {
        errores.push("El Nombre debe tener almenos 2 caracteres")
    }
    //el precio lo parseamos previamente luego en el cliente
    if (typeof price !== "number" || price <= 0) {
        errores.push("El precio debe ser un numero mayor a 0")
    }

    //no validamos imagenes pq usaremos multer

    if (!categoriasValidas.includes(category)) {
        errores.push("Categoria Invalida")
    }

    if (errores.length > 0) {
        return res.status(400).json({
            message: "Datos Invalidos",
            listaErrores : errores
        })
    }
    next();//sin el next no da paso al siguiente midllware o procesar la respuesta
}



//ENDPOINTS

app.get("/", (req, res) => {
    res.send("hola mundo desde Express")
})

//GET all product
app.get("/api/products", async (req, res) => {

    try {
        // Optimizacion 1: evitamos traer columnas innecesarias en la consulta SQL (mas eficiente en memoria y red)
        const sql = "SELECT id, nombre, precio, img FROM products";

        const [rows] = await connection.query(sql);// En rows guardamos los resultados de nuestra sentencia SQL

        //rows = info de las filas
        //fields = info de los campos

        // Optimizacion 2: Respuesta 404 si la BBDD no devuelve productos
        if (rows.length === 0) {
            return res.status(404).json({
                message: "No se encontraron productos"
            })
        }
        res.status(200).json({

            ///////////////////
            // Optimizacion 3: Opcional, podemos devolver la cantidad de productos
            total: rows.length,//metada data util para el frond
            payload: rows
        });
    } catch (error) {
        console.log("Error obteniendo productos: ", error.message);

        // Optimizacion 4: Si fallo la conexion a la BBDD, tardo demasiado, la tabla no existe o hay error de sintaxis
        res.status(500).json({
            message: "Error interno del servidor al obtener productos"
        })
    }

});


//GET all user
app.get("/api/users", async (req, res) => {
    const [rows] = await connection.query("SELECT * FROM users")

    res.status(200).json({
        payload: rows
    })
})


// GET product by id
//nuestra aplicacion eschucharar un peticion get/post/delete/put a la URL("") con un callBack asincrono con un req y una res
app.get("/api/products/:id", validateId, async (req, res) => {

    try {

        // El ? en la consulta es un "placeholder", es una medida de seguridad en consultas SQL para prevenir inyecciones SQL
        // console.log(rows);
        const sql = "SELECT id,nombre,precio,img FROM products where id = ?"

        const [rows] = await connection.query(sql, [req.id]);

        // Optimizacion 2: Respuesta 404 si la BBDD no devuelve productos con ese id
        if (rows.length === 0) {
            return res.status(404).json({
                message: `No se encontraron productos con ID ${req.id}`
            })
        }


        res.status(200).json({
            payload: rows
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "error interno del Servidor al obtener productos"
        })
    }
});



// POST product
//nuestra aplicacion eschucharar un peticion get/post/delete/put a la URL("") con un callBack asincrono con un req y una res
app.post("/api/products", validarProduct, async (req, res) => {

    // Gracias al middleware app.use(express.json()) -> Recibimos un objeto JS ya parseado
    try {
        // (Destructirin) Extraemos los valores que vienen en el CUERPO (body) de la peticion http (HTTP Request)
        const { name, image, category, price } = req.body;

        //optimizacion 3: sanitizamos los strings antes de insertarlos , para normalizar los datos
        const cleanName = name.trim();



        const sql = "INSERT INTO products (nombre, img, precio, categoria) VALUES (?, ?, ?, ?)";
        // Los placeholders "?" nos permiten realizar consultas SQL mas seguras (evitan inyeccion SQL)
        const [rows] = await connection.query(sql, [cleanName, image, price, category]);

        //la respuesta es un estado 200(ok) con un JSON
        res.status(200).json({
            message: `Producto creado con exito con id ${rows.insertId}`,
            productId: rows.insertId//devolvemos info util como el nuevo id creado
        });


    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: "error interno del servidor al crear productos"
        })
    }
});


// DELETE product
//nuestra aplicacion eschucharar un peticion get/post/delete/put a la URL("") con un callBack asincrono con un req y una res
app.delete("/api/products/:id", validateId, async (req, res) => {

    try {

        //validamos en id en el middleware
        //const id = req.params.id;

        //query SQL
        const sql = "DELETE FROM products WHERE id = ?";
        //establesco la coneccion 
        await connection.query(sql, [req.id]);

        res.status(200).json({
            message: `Producto con id ${req.id} eliminado correctamente`
        });


    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "error interno del servidor al eliminar productos"
        })
    }
})




//PUT products
//nuestra aplicacion eschucharar un peticion put a la URL("/api products") donde hara un  callBack asincrono con un req y una res
app.put("/api/products" ,validarProduct,async (req, res) => {

    try {
        //aplicamos destructuring por que req.body es un objeto, parseada por el middelmar express.json
        const { id, name, image, price, category } = req.body;

        let sql = `UPDATE products SET nombre = ?, img = ?, precio = ?, categoria = ? WHERE id = ?`;

        const [result] = await connection.query(sql, [name, image, price, category, id]);

        //optimizacion : verificamos si realmente se actualizo algo
        if(result.affectedRows === 0){
            return res.status(404).json({
                message : `No se Actualizo el producto`
            })
        }

        //devolvemos un respuesta con cod de estado 200 con un json
        return res.status(200).json({
            message: "Producto actualizado correctamente"
        });

    } catch (error) {
        console.log(error)
        
        res.status(500).json({
            message: "error interno del servidor al crear producto"
        })
    }

});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})

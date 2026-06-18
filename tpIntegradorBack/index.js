//Importa módulos que vamos a usar.
import express from "express"
import environments from "./src/api/config/environments.js";//Trae la configuración del .env.
import connection from "./src/api/database/db.js";//Trae la conexión a MySQL.
import cors from "cors";//Permite que el frontend y backend se comuniquen aunque estén en distintos puertos.

//config
const app = express();//Crea la aplicación Express.
const PORT = environments.port;//puerto : 3000

//middlewares funciones que se ejecutan durante el ciclo de solicitud y respuesta de una aplicación
app.use(cors())//mecanismo de seguridad

app.use(express.json()); // middleware para parsear el JSON de las peticiones POST y PUT
//Convierte automáticamente JSON en objetos JS.

//Endpoints

app.get("/", (req, res) => {
    res.send("hola mundo desde Express")
})

//GET all product
app.get("/api/products", async (req, res) => {
    //con el destructuring separamos resultados(rows) y la metadata (field)
    const [rows, fields] = await connection.query("SELECT * FROM products")
    //rows = info de las filas
    //fields = info de los campos

    res.status(200).json({
        payload: rows
    })
})

//GET all user
app.get("/api/users", async (req, res) => {
    const [rows] = await connection.query("SELECT * FROM users")

    res.status(200).json({
        payload: rows
    })
})


// GET product by id
//nuestra aplicacion eschucharar un peticion get/post/delete/put a la URL("") con un callBack asincrono con un req y una res
app.get("/api/products/:id", async (req, res) => {
    //Obtiene el valor que viene en la URL.
    const id = req.params.id;

    // El ? en la consulta es un "placeholder", es una medida de seguridad en consultas SQL para prevenir inyecciones SQL
    const [rows] = await connection.query("SELECT * FROM products where products.id = ?", [id]);
    // console.log(rows);

    res.status(200).json({
        payload: rows
    })

});


// POST product
//nuestra aplicacion eschucharar un peticion get/post/delete/put a la URL("") con un callBack asincrono con un req y una res
app.post("/api/products", async (req, res) => {

    // Gracias al middleware app.use(express.json()) -> Recibimos un objeto JS ya parseado
    console.log(req.body);

    // (Destructirin) Extraemos los valores que vienen en el CUERPO (body) de la peticion http (HTTP Request)
    const { name, image, category, price } = req.body;

    // Los placeholders "?" nos permiten realizar consultas SQL mas seguras (evitan inyeccion SQL)
    const sql = "INSERT INTO products (nombre, img, precio, categoria) VALUES (?, ?, ?, ?)";

    await connection.query(sql, [name, image, price, category]);
    //la respuesta es un estado 200(ok) con un JSON
    res.status(200).json({
        message: "Producto creado con exito"
    });
});


// DELETE product
//nuestra aplicacion eschucharar un peticion get/post/delete/put a la URL("") con un callBack asincrono con un req y una res
app.delete("/api/products/:id", async (req, res) => {
    //obtenemos el id
    const id = req.params.id;
    //query SQL
    const sql = "DELETE FROM products WHERE id = ?";

    //establesco la coneccion 
    await connection.query(sql, [id]);

    res.status(200).json({
        message: `Producto con id ${id} eliminado correctamente`
    });
})

//PUT products
//nuestra aplicacion eschucharar un peticion get/post/delete/put a la URL("") con un callBack asincrono con un req y una res
app.put("/api/products", async (req, res) => {
    try {
        //aplicamos destructuring
        const { id, name, image, price, category } = req.body;
        let sql = `UPDATE products SET nombre = ?, img = ?, precio = ?, categoria = ? WHERE id = ?`;

        await connection.query(sql, [name, image, price, category, id]);

        return res.status(200).json({
            message: "Producto actualizado correctamente"
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "error interno del servidor"
        })
    }

});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})

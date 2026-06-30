//Importa módulos que vamos a usar.
import express from "express"
import environments from "./src/api/config/environments.js";//Trae la configuración del .env.
import cors from "cors";//Permite que el frontend y backend se comuniquen aunque estén en distintos puertos.
import { loggerURL } from "./src/api/middlewares/middlewares.js";
import { productRoutes } from "./src/api/routes/index.js";
import { _dirname, join } from "./src/api/utils/index.js"

//config
const app = express();//Crea la aplicación Express.
const PORT = environments.port;//puerto : 3000
app.set("view engine", "ejs");//configuracion EJS como motor de plantilla
app.set("views", join(_dirname, "src/views"))


//MIDDLEWARES

//middlewares funciones que se ejecutan durante el ciclo de solicitud y respuesta de una aplicación
app.use(cors())//mecanismo de seguridad

app.use(loggerURL);

app.use(express.json()); // middleware para parsear el JSON de las peticiones POST y PUT
//Convierte automáticamente JSON en objetos JS.

//middleware para servir archivos estaticos 
app.use(express.static(join(_dirname, "src/public")))//estoy diciendole a la app la ruta de donde va a servir archivos estaticos




//ENDPOINTS
//todas la llamadas a "/api/products" las redirige a productRoutes (es un controlador)
app.use("/api/products", productRoutes);


app.get("/", (req, res) => {
    res.send("hola mundo desde Express")
});


app.get("/dashboard", (req, res) => {
    res.render("index")
})

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})

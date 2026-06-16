//importamos el modulo dotenv para leer y exporta las variables de entorno

import dotenv from "dotenv";

//leemos las variables de entorno del archivo .env

dotenv.config();//el valor de estas variables ya es accesible desde process.env.NOMBRE_VARIABLE

//exporta estos valores como Objetos , pero de forma anonima
export default {
    port: process.env.PORT,
    database: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    }
}

/*==================================
        CONTROLADORES DE PRODUCTOS  
===================================*/

import connection from "../database/db.js";
import productModels from "../models/product.models.js";

//GET ALL PRODUCTS
export const getAllProducts = async (req, res) => {

    try {

        const [rows] = await productModels.selectAllProducts();// En rows guardamos los resultados de nuestra sentencia SQL

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

}

//GET  PRODUCT BY ID
export const getProductById = async (req, res) => {

    try {

        const [rows] = await productModels.selectProductById(req.id);

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
}


//CREATE PRODUCT (POST)

export const createProduct = async (req, res) => {

    // Gracias al middleware router.use(express.json()) -> Recibimos un objeto JS ya parseado
    try {
        // (Destructirin) Extraemos los valores que vienen en el CUERPO (body) de la peticion http (HTTP Request)
        const { name, image, category, price } = req.body;

        //optimizacion 3: sanitizamos los strings antes de insertarlos , para normalizar los datos
        const cleanName = name.trim();

        const [rows] = await productModels.insertProduct(cleanName, image, price, category);

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
}

//MODIFY PRODUCT (PUT)
export const modifyProduct = async (req, res) => {

    try {
        //aplicamos destructuring por que req.body es un objeto, parseada por el middelmar express.json
        const { id, name, image, price, category } = req.body;

                //el primer valor del await es pending , que se completa con aceptado y rechazado (va al catch)
        const [result] = await productModels.updateProduct(name, image, price, category, id);

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

}

//REMOVE PRODUCT (DELETE)
export const removeProduct = async (req, res) => {

    try {

        //validamos en id en el middleware
        //const id = req.params.id;

        await productModels.deleteProduct(req.id)

        res.status(200).json({
            message: `Producto con id ${req.id} eliminado correctamente`
        });


    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "error interno del servidor al eliminar productos"
        })
    }
}



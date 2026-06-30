/*==============================
        MIDDLEWARES
==============================*/

//middleware logger para poder ver en consola toda la activida de nuestro servidor
    const loggerURL = (req,res,next)=>{
        let fecha = new Date();
        console.log(`[${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}] ${req.method} ${req.url}`)
        next();//next me permite pasar al siguiente middleware o dar paso a la response (res)
    }

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


export {
    loggerURL,
    validateId,
    validarProduct
}
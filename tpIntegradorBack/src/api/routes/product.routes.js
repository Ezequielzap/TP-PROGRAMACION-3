/*==============================
        RUTAS DE PRODUCTO
==============================*/

import { Router } from "express";
import { validateId,validarProduct } from "../middlewares/middlewares.js";
import { createProduct, getAllProducts, getProductById, modifyProduct, removeProduct } from "../controllers/product.controllers.js";
const router = Router();

//GET all product
router.get("/", getAllProducts);


// GET product by id

//el router recibe una peticion get con esta URL ("/:id") llama al middleware (validateID)
router.get("/:id", validateId, getProductById );


// POST product
router.post("/", validarProduct,createProduct );


//PUT products
router.put("/" ,validarProduct,modifyProduct);

// DELETE product
router.delete("/:id", validateId, removeProduct);



export default router;
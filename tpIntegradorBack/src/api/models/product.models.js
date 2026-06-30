/*==================================
        MODELOS DE PRODUCTOS  
===================================*/

import connection from "../database/db.js";

//seleccionar a todos los productos
const selectAllProducts = () => {
    // Optimizacion 1: evitamos traer columnas innecesarias en la consulta SQL (mas eficiente en memoria y red)
    const sql = "SELECT id, nombre, precio, img FROM products";

    return connection.query(sql);// En rows guardamos los resultados de nuestra sentencia SQL
}

//seleccionar productos por id
const selectProductById = (id) => {
    // El ? en la consulta es un "placeholder", es una medida de seguridad en consultas SQL para prevenir inyecciones SQL
    // console.log(rows);
    const sql = "SELECT id,nombre,precio,img FROM products where id = ?"

    return connection.query(sql, [id]);
}

//Crear un nuevo producto 
const insertProduct = (cleanName, image, price, category) => {
    const sql = "INSERT INTO products (nombre, img, precio, categoria) VALUES (?, ?, ?, ?)";
    // Los placeholders "?" nos permiten realizar consultas SQL mas seguras (evitan inyeccion SQL)

    return connection.query(sql, [cleanName, image, price, category]);
}

//modificar un producto 
const updateProduct = (name, image, price, category, id) => {
    let sql = `UPDATE products SET nombre = ?, img = ?, precio = ?, categoria = ? WHERE id = ?`;

    return connection.query(sql, [name, image, price, category, id]);
}

//Eliminar producto 
const deleteProduct = (id) => {
    //query SQL
    const sql = "DELETE FROM products WHERE id = ?";
    //establesco la coneccion 
    return connection.query(sql, [id]);
}


export default {
    selectAllProducts,
    selectProductById,
    insertProduct,
    updateProduct,
    deleteProduct
}
//Logica para trabajar con archivos y rutas de proyecto

//importacion de modulos para trabajar con rutas 
import { fileURLToPath } from "url";
import { dirname, join } from "path";

//obtener el nombre del archivo actual
const _filename = fileURLToPath(import.meta.url);

//vamos a hacer que eld dirname apunte a la raiz de nuestro servidor
const _dirname = join(dirname(_filename), "../../../")

export {
    _dirname,
    join
}

/*

QUE PASA ACA ?

fileURLToPath : convierte una URL de archivo (file://) a un ruta de sistema de archivo

-dirname: devuelve el directorio padre de una ruta

-join : une segmectos de ruta
*/
const API_URL = "http://localhost:3000/api/products";

let todosLosProductos = [];
let productosFiltrados = [];
let carrito = [];

document.addEventListener("DOMContentLoaded", () => {
    inicializarAplicacion();
});

function inicializarAplicacion() {
    configurarNombreUsuario();
    cargarCarritoDesdeLocalStorage();
    cargarProductosDesdeServidor();
    configurarBotonesEstaticos();
}


// Muestra el nombre del usuario en el header o maneja el formulario de login

function configurarNombreUsuario() {
    let nombreIngresado = localStorage.getItem("clienteNombre");
    
    const pantallaLogin = document.getElementById("pantalla-login");
    const contenidoTienda = document.getElementById("contenido-tienda");
    const contenedorNombre = document.getElementById("nombreUsuarioHeader");

    //si ya esta logueado ocultamos el login directamente y entramos

    if (nombreIngresado) {
        if (pantallaLogin) pantallaLogin.style.display = "none";
        if (contenidoTienda) contenidoTienda.style.display = "block";
        if (contenedorNombre) contenedorNombre.innerText = nombreIngresado;
    } else {

        // si no esta logueado escuchamos cuando use el formulario del HTML

        const formulario = document.getElementById("formulario-login");
        if (formulario) {
            formulario.addEventListener("submit", (evento) => {
                evento.preventDefault(); // Evita que la página se recargue
                
                const inputNombre = document.getElementById("input-login-nombre");
                let nombre = inputNombre.value.trim();

                if (nombre === "") {
                    nombre = "Invitado";
                }

                // Guardamos en LocalStorage
                
                localStorage.setItem("clienteNombre", nombre);

                // Actualizamos el header

                if (contenedorNombre) contenedorNombre.innerText = nombre;

                // CAMBIO DE PANTALLAS (Transición visual)

                if (pantallaLogin) pantallaLogin.style.display = "none";
                if (contenidoTienda) contenidoTienda.style.display = "block";
            });
        }
    }
}


//Trae los productos del backend evaluando la respuesta HTTP

async function cargarProductosDesdeServidor() {
    try {
        const respuesta = await fetch(API_URL);

        // Verificamos si el servidor respondió correctamente (status 200)

        if (respuesta.ok === false) {
            throw new Error(`Error en el servidor: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        
        // Asignamos el payload

        todosLosProductos = datos.payload; 
        productosFiltrados = todosLosProductos;
        
        renderizarCatalogo();
    } catch (error) {
        console.error("Hubo un problema al cargar los productos:", error.message);
        mostrarMensajeError("No pudimos conectar con el servidor. Inténtalo más tarde.");
    }
}


//Filtramos el catálogo por la categoría exacta de la base de datos

function filtrarPorCategoria(categoriaSeleccionada) {
    if (categoriaSeleccionada === 'Todos') {
        productosFiltrados = todosLosProductos;
    } else {
        productosFiltrados = todosLosProductos.filter(producto => producto.categoria === categoriaSeleccionada);
    }
    renderizarCatalogo();
}

//Dibuja las tarjetas de productos en el HTML

function renderizarCatalogo() {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;
    
    contenedor.innerHTML = "";

    if (productosFiltrados.length === 0) {
        contenedor.innerHTML = `<p class="mensaje-vacio">No hay productos disponibles en esta categoría.</p>`;
        return;
    }

    productosFiltrados.forEach(producto => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjeta-producto");
        
        tarjeta.innerHTML = `
            <img src="${producto.img}" alt="${producto.nombre}" class="producto-imagen">
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio}</p>
            <button class="btn-agregar" data-id="${producto.id}">Añadir al Carrito</button>
        `;
        contenedor.appendChild(tarjeta);
    });

    //escuchamos los clicks de los botones recién creados

    contenedor.querySelectorAll(".btn-agregar").forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

//APARTADO CARRITO


//Intenta recuperar el carrito guardado del LocalStorage al iniciar la app

function cargarCarritoDesdeLocalStorage() {
    const datosGuardados = localStorage.getItem("carrito");
    
    if (datosGuardados) {
        carrito = JSON.parse(datosGuardados);
    } else {
        carrito = [];
    }
    
    dibujarCarrito(); 
}


// Actualiza el LocalStorage con el estado actual del carrito y lo vuelve a renderizar

function guardarYActualizarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    dibujarCarrito();
}


// Agrega un producto al carrito incrementando su cantidad o creándolo si no existía

function agregarAlCarrito(evento) {
    const idProducto = parseInt(evento.target.getAttribute("data-id"));
    const productoExistente = carrito.find(item => item.id === idProducto);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        const productoOriginal = todosLosProductos.find(producto => producto.id === idProducto);
        if (productoOriginal) {

            // Creamos el nuevo item del carrito manteniendo las propiedades de la bd

            carrito.push({ ...productoOriginal, cantidad: 1 });
        }
    }
    guardarYActualizarCarrito();
}


// Renderiza visualmente la lista de compras del carrito y calcula el total acumulado

function dibujarCarrito() {
    const contenedor = document.getElementById("lista-carrito");
    const contenedorTotal = document.getElementById("total-precio");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    let acumuladorTotal = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="carrito-vacio-contenedor">
                <p class="carrito-vacio-texto">El carrito está vacío.</p>
            </div>
        `;
        if (contenedorTotal) contenedorTotal.innerText = "Total: $0";
        return;
    }

    carrito.forEach(item => {
        acumuladorTotal += item.precio * item.cantidad;

        const contenedorItem = document.createElement("div");
        contenedorItem.classList.add("tarjeta-producto-carrito");
        contenedorItem.innerHTML = `
            <div class="info-item-carrito">
                <h4>${item.nombre}</h4>
                <p>Precio unitario: $${item.precio}</p>
            </div>
            <div class="controles-cantidad-carrito">
                <button class="btn-restar" data-id="${item.id}">-</button>
                <span class="cantidad-item">${item.cantidad}</span>
                <button class="btn-sumar" data-id="${item.id}">+</button>
                <button class="btn-eliminar-item" data-id="${item.id}">Eliminar</button>
            </div>
        `;
        contenedor.appendChild(contenedorItem);
    });

    if (contenedorTotal) contenedorTotal.innerText = `Total: $${acumuladorTotal}`;


    // Listeners del carrito

    contenedor.querySelectorAll(".btn-sumar").forEach(b => b.addEventListener("click", (e) => alterarCantidad(e, 1)));
    contenedor.querySelectorAll(".btn-restar").forEach(b => b.addEventListener("click", (e) => alterarCantidad(e, -1)));
    contenedor.querySelectorAll(".btn-eliminar-item").forEach(b => b.addEventListener("click", eliminarItem));
}


// Suma o resta unidades de un producto específico en el carrito

function alterarCantidad(evento, cambio) {
    const idProducto = parseInt(evento.target.getAttribute("data-id"));
    const item = carrito.find(producto => producto.id === idProducto);
    
    if (item) {
        item.cantidad += cambio;
        if (item.cantidad <= 0) {
            carrito = carrito.filter(producto => producto.id !== idProducto);
        }
        guardarYActualizarCarrito();
    }
}


// Quita por completo un producto del carrito sin importar su cantidad

function eliminarItem(evento) {
    const idProducto = parseInt(evento.target.getAttribute("data-id"));
    carrito = carrito.filter(producto => producto.id !== idProducto);
    guardarYActualizarCarrito();
}


// Vincula los eventos iniciales a los elementos fijos que existen en el HTML

function configurarBotonesEstaticos() {
    // Evento para finalizar la compra (ya lo tenías)
    const btnFinalizar = document.querySelector(".btn-finalizar");
    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", procesarCompra);
    }

    // NUEVO: Evento para cerrar sesión

    const btnCerrar = document.getElementById("btn-cerrar-sesion");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
            // Borramos el nombre del usuario de la memoria

            localStorage.removeItem("clienteNombre");

            // Recargamos la página para que el código vuelva a evaluar y muestre el Login
            
            location.reload();
        });
    }
}


// Verifica que haya elementos en el carrito, confirma la orden y limpia los datos

function procesarCompra() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío, añade productos primero.");
        return;
    }
    alert("¡Compra procesada con éxito en Futbol Heritage!");
    carrito = [];
    localStorage.removeItem("carrito");
}

// Muestra un aviso en el contenedor del catálogo si la llamada de la API falla

function mostrarMensajeError(mensaje) {
    const contenedor = document.getElementById("contenedor-productos");
    if (contenedor) {
        contenedor.innerHTML = `<p class="error-conexion">${mensaje}</p>`;
    }
}
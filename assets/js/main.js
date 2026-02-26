console.log("Inventario conectado correctamente!");

const IVA = 0.19;

// Datos para cargar la app con los productos (SKU's) y sus características (nombre, categoría, precio NETO y stock)
const inventario = [
    { id: crypto.randomUUID(), nombre: "iphone 15 pro", categoria: "iphone", precio: 1199990, stock: 5 },
    { id: crypto.randomUUID(), nombre: "macbook air m2", categoria: "mac", precio: 1099990, stock: 3 },
    { id: crypto.randomUUID(), nombre: "ipad air", categoria: "ipad", precio: 799990, stock: 4 },
    { id: crypto.randomUUID(), nombre: "airpods pro 2", categoria: "audio", precio: 279990, stock: 0 },
    { id: crypto.randomUUID(), nombre: "apple watch series 9", categoria: "wearables", precio: 429990, stock: 2 },
];

// Contenido del DOM
const inventoryTbody = document.querySelector("#inventoryTbody");
const emptyMsg = document.querySelector("#emptyMsg");

const formTitle = document.querySelector("#formTitle");
const productForm = document.querySelector("#productForm");
const nameInput = document.querySelector("#nameInput");
const categoryInput = document.querySelector("#categoryInput");
const priceInput = document.querySelector("#priceInput");
const stockInput = document.querySelector("#stockInput");
const submitBtn = document.querySelector("#submitBtn");
const clearBtn = document.querySelector("#clearBtn");

const searchInput = document.querySelector("#searchInput");
const btnClearSearch = document.querySelector("#btnClearSearch");

const subTotalOut = document.querySelector("#subTotalOut");
const ivaOut = document.querySelector("#ivaOut");
const totalOut = document.querySelector("#totalOut");


let editID = null;
let currentFilter = "";


// Normalización y formateo
function toTitleCase(texto) {
    return texto
        .trim()
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
}

function formatCLP(valor) {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
    }).format(valor);
}

function normalize(texto) {
    return texto.trim().toLowerCase();
}


// CRUD de la app  
function addProduct(nombre, categoria, precio, stock) {
    const producto = {
        id: crypto.randomUUID(),
        nombre: toTitleCase(nombre),
        categoria: toTitleCase(categoria),
        precio: Math.round(Number(precio)),
        stock: parseInt(stock, 10),
    };
    inventario.push(producto);
}

function deleteProduct(id) {
    const index = findIndexByIdWhile(id);
    if (index !== -1) inventario.splice(index, 1);
}

function updateProduct(id, nombre, categoria, precio, stock) {
    const index = findIndexByIdWhile(id);
    if (index === -1) return;

    inventario[index].nombre = toTitleCase(nombre);
    inventario[index].categoria = toTitleCase(categoria);

    inventario[index]["precio"] = Math.round(Number(precio));
    inventario[index]["stock"] = parseInt(stock, 10);
}

function findProducts(query) {
    const q = normalize(query);
    if (!q) return inventario;

    const resultados = [];
    for (let i = 0; i < inventario.length; i++) {
        const p = inventario[i];
        const text = (p.nombre + " " + p.categoria).toLowerCase();
        if (text.includes(q)) resultados.push(p);
    }
    return resultados;
}


// Ciclo While par el inventario
function findIndexByIdWhile(id) {
    let i = 0;
    while (i < inventario.length) {
        if (inventario[i].id === id) return i;
        i++;
    }
    return -1;
}


// Funcion para los cálculos de las cajitas superiores (totales) 
function calcSubTotal() {
    let subtotal = 0;
    for (let i = 0; i < inventario.length; i++) {
        subtotal += inventario[i].precio * inventario[i].stock;
    }
    return subtotal;
}

// Para calcular el IVA 
function calcIVA(subtotal) {
  return Math.round(subtotal * IVA);
}

// Suma el subotal + IVA
function calcTotal(subtotal, iva) {
    return subtotal + iva;
}

// Updatea los valores en el DOM
function updateTotals() {
    const subtotal = calcSubTotal();
    const iva = calcIVA(subtotal);
    const total = calcTotal(subtotal, iva);

    subTotalOut.textContent = formatCLP(subtotal);
    ivaOut.textContent = formatCLP(iva);
    totalOut.textContent = formatCLP(total);
}


// Función para el renderzado del DOM (tablita con los datos del inventario)
function createRowHTML(producto) {
    let stockClass = "";
    let stockText = "";

    if (producto.stock === 0) {
        stockClass = "badge text-bg-danger";
        stockText = "Agotado";
    } else if (producto.stock <= 2) {
        stockClass = "badge text-bg-warning";
        stockText = "Últimas unidades";
    } else {
        stockClass = "badge text-bg-success";
        stockText = "Disponible";
    }

    return `
        <tr>
        <td>
            <p class="fw-semibold">${producto.nombre}</p>
            <p class="text-muted small">ID: ${producto.id.slice(0, 8)}</p>
        </td>
        <td>${producto.categoria}</td>
        <td class="text-end">${formatCLP(producto.precio)}</td>
        <td class="text-end">
            <div>${producto.stock}</div>
            <span class="${stockClass}">${stockText}</span>
        </td>
        <td class="text-end">
            <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-primary" data-action="edit" data-id="${producto.id}">Editar</button>
            <button class="btn btn-outline-danger" data-action="delete" data-id="${producto.id}">Eliminar</button>
            </div>
        </td>
        </tr>
    `;
}

function renderInventory() {
    const data = findProducts(currentFilter);

    inventoryTbody.innerHTML = "";

    if (data.length === 0) {
        emptyMsg.classList.remove("d-none");
    } else {
        emptyMsg.classList.add("d-none");
    }

    let html = "";
    for (let i = 0; i < data.length; i++) {
        html += createRowHTML(data[i]);
    }

    inventoryTbody.innerHTML = html;
    updateTotals();
}


// Funciones para cargar datos en el form 
function loadFormForEdit(id) {
    const index = findIndexByIdWhile(id);
    if (index === -1) return;

    const p = inventario[index];
    nameInput.value = p.nombre;
    categoryInput.value = p.categoria;
    priceInput.value = p.precio;
    stockInput.value = p.stock;

    editID = id;
    formTitle.textContent = `Editando: ${p.nombre}`;
    submitBtn.textContent = "Actualizar";
    }

    function clearForm() {
    productForm.reset();
    editID = null;
    formTitle.textContent = "Agregar Producto";
    submitBtn.textContent = "Guardar";
}


// Validaciones precios, stock y otros campos del form
// Se permite registrar 0 para precio y stock para la "reserva" de los skus, además se valida que los num no sean negativos.

function validateInputs(nombre, categoria, precio, stock) {
    if (!nombre || !categoria || precio === "" || stock === "") {
        alert("Completa todos los campos.");
        return false;
    } else if (Number(precio) < 0 || Number(stock) < 0) {
        alert("Precio y stock no pueden ser negativos.");
        return false;
    } else if (!Number.isInteger(Number(stock))) {
        alert("El stock debe ser un número entero.");
        return false;
    }
    return true;
}


// Listeners para los botones de editar y eliminar dentro de la tabla 
inventoryTbody.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "edit") {
        loadFormForEdit(id);
    } else if (action === "delete") {
        const ok = confirm("¿Seguro que quieres eliminar este producto?");
        if (ok) {
        deleteProduct(id);
        renderInventory();
        clearForm();
        }
    }
});

// Listener para el submit del form
productForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nombre = nameInput.value;
    const categoria = categoryInput.value;
    const precio = priceInput.value;
    const stock = stockInput.value;

    if (!validateInputs(nombre, categoria, precio, stock)) return;

    if (editID) {
        updateProduct(editID, nombre, categoria, precio, stock);
        alert("Producto actualizado");
    } else {
        addProduct(nombre, categoria, precio, stock);
        alert("Producto agregado");
    }

    renderInventory();
    clearForm();
});

clearBtn.addEventListener("click", () => {
    clearForm();
});

// Buscar SKU's en el inventario (arreglo)
searchInput.addEventListener("input", () => {
    currentFilter = searchInput.value;
    renderInventory();
});

// Boton para limpiar la búsqueda
btnClearSearch.addEventListener("click", () => {
    searchInput.value = "";
    currentFilter = "";
    renderInventory();
    });


renderInventory();
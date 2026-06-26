// ==========================================================================
// BOUTIQUE3D - ADMINISTRATIVE CONTROL ROOM CORE LOGIC (ADMIN)
// ==========================================================================

// --- Default Base Products ---
const DEFAULT_PRODUCTS = [
    {
        id: "prod-3d-steam-engine",
        title: "Motor Bicilíndrico a Vapor",
        category: "archivos",
        description: "Planos técnicos y archivos STL listos para impresión 3D FDM. Un motor a vapor funcional a escala con juntas y pistones móviles.",
        price: 15.00,
        image: "assets/images/archivo_3d_blueprint.png",
        specs: {
            "Formato": "STL / STEP (Partes separadas)",
            "Tamaño Ensamblado": "18cm x 12cm x 15cm",
            "Nº Componentes": "22 piezas individuales",
            "Filamento Sugerido": "PLA Cobre / Bronce",
            "Dificultad": "Media-Alta"
        },
        downloadFile: "motor_vapor_dieselpunk_3d.stl"
    },
    {
        id: "prod-3d-clockwork",
        title: "Escape de Áncora Relojería",
        category: "archivos",
        description: "Modelo didáctico modular de un mecanismo de escape de reloj antiguo. Espectacular para demostraciones de física e impresión 3D.",
        price: 12.50,
        image: "assets/images/archivo_3d_blueprint.png",
        specs: {
            "Formato": "STL / 3MF (Optimizado)",
            "Nº Componentes": "9 piezas",
            "Tolerancia Recomendada": "0.2 mm",
            "Relleno Recomendado": "20% Giroide",
            "Extras": "Requiere un resorte o contrapeso"
        },
        downloadFile: "mecanismo_escape_ancora_3d.stl"
    },
    {
        id: "prod-mate-caldera",
        title: "Mate de Madera 'Caldera'",
        category: "mates",
        description: "Mate de madera de algarrobo macizo torneado a mano. Blindado con flejes de cobre remachados, pernos decorativos de latón y un mini engranaje incrustado.",
        price: 45.00,
        image: "assets/images/mate_dieselpunk.png",
        specs: {
            "Madera": "Algarrobo curado",
            "Metales": "Cobre electrolítico y Bronce",
            "Bombilla": "Alpaca premium con resorte",
            "Mantenimiento": "Curar con aceite mineral",
            "Fabricación": "100% Artesanal (A pedido)"
        }
    },
    {
        id: "prod-mate-piston",
        title: "Mate Térmico 'Pistón'",
        category: "mates",
        description: "Mate de acero inoxidable de doble pared térmica, con funda externa de resina reforzada pintada a mano con acabados metálicos que imitan un pistón de motor radial.",
        price: 38.00,
        image: "assets/images/mate_dieselpunk.png",
        specs: {
            "Núcleo": "Acero Inoxidable 304 térmico",
            "Carcasa": "Resina de ingeniería texturizada",
            "Estilo": "Pintura metalizada patinada",
            "Limpieza": "Fácil lavado, no requiere curado",
            "Alto / Diámetro": "95mm / 80mm"
        }
    },
    {
        id: "prod-cartel-neon",
        title: "Cartel Neón 'Glow Filament'",
        category: "carteles",
        description: "Cartel luminoso retro hecho a mano. Tubos de neón flexible de color naranja incandescente montados sobre una placa de hierro con pátina de óxido real.",
        price: 85.00,
        image: "assets/images/cartel_luminoso.png",
        specs: {
            "Iluminación": "Neón Flex LED 12V",
            "Soporte": "Placa de hierro oxidado curado",
            "Alimentación": "Adaptador de pared 220V a 12V (incluido)",
            "Montaje": "Cadena metálica para colgar",
            "Dimensiones": "38cm x 22cm x 4cm"
        }
    },
    {
        id: "prod-maceta-turbina",
        title: "Maceta Industrial 'Turbina'",
        category: "macetas",
        description: "Maceta cilíndrica modelada en 3D basada en un compresor de turbina de avión de los años 40. Impresa con filamento compuesto de bronce y oxidada químicamente.",
        price: 22.00,
        image: "assets/images/maceta_turbina.png",
        specs: {
            "Material": "PLA Bronce cargado (80% metal)",
            "Acabado": "Pátina verde de oxidación real",
            "Drenaje": "Canales helicoidales internos",
            "Resistencia": "Apta para interiores y exteriores",
            "Altura": "11.5 cm"
        }
    }
];

// --- Global Administrative State ---
let products = [];
let orders = [];
let visits = 0;
let tempSpecs = {}; // Key-value object for specifications currently added to the form
let isEditing = false;
let editProductId = null;

// --- DOM Navigation & Panels ---
const tabs = document.querySelectorAll(".console-pill");
const panels = document.querySelectorAll(".admin-panel");

// --- DOM Elements ---
const statRevenue = document.getElementById("stat-revenue");
const statOrdersCount = document.getElementById("stat-orders-count");
const statVisitsCount = document.getElementById("stat-visits-count");
const statConversion = document.getElementById("stat-conversion");

const topProductsTbody = document.getElementById("top-products-tbody");
const productsTbody = document.getElementById("products-tbody");
const ordersTbody = document.getElementById("orders-tbody");

// Form Fields
const productForm = document.getElementById("product-form");
const formActionTitle = document.getElementById("form-action-title");
const formProductId = document.getElementById("form-product-id");
const pTitle = document.getElementById("p-title");
const pCategory = document.getElementById("p-category");
const pPrice = document.getElementById("p-price");
const pDesc = document.getElementById("p-desc");
const pImage = document.getElementById("p-image");
const pImageCustom = document.getElementById("p-image-custom");
const pDownload = document.getElementById("p-download");
const downloadFileGroup = document.getElementById("download-file-group");
const pPayLink = document.getElementById("p-paylink");
const pIsFree = document.getElementById("p-is-free");

// Specs generator inputs
const specKeyInput = document.getElementById("spec-key");
const specValInput = document.getElementById("spec-val");
const btnAddSpec = document.getElementById("btn-add-spec");
const specsListContainer = document.getElementById("specs-list-container");

// Backup & Form action buttons
const btnSubmitForm = document.getElementById("btn-submit-form");
const btnCancelEdit = document.getElementById("btn-cancel-edit");
const btnExportDb = document.getElementById("btn-export-db");
const importDbFile = document.getElementById("import-db-file");
const btnResetDb = document.getElementById("btn-reset-db");
const btnClearOrders = document.getElementById("btn-clear-orders");

// --- Custom Toast Notification Engine ---
const toastStyle = document.createElement("style");
toastStyle.textContent = `
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
}
.toast-notification {
    background: #121418;
    color: #f5f6f8;
    border: 2px solid var(--color-iron-dark);
    padding: 14px 22px;
    border-radius: 4px;
    font-family: var(--font-display);
    font-size: 0.95rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 300px;
    transform: translateX(120%);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    opacity: 0;
    pointer-events: auto;
}
.toast-notification.active {
    transform: translateX(0);
    opacity: 1;
}
.toast-success {
    border-color: var(--color-neon-green) !important;
    box-shadow: 0 0 10px var(--color-neon-green-glow) !important;
}
.toast-success::before {
    content: "⚙️";
    font-size: 1.1rem;
}
.toast-danger {
    border-color: var(--color-neon-orange) !important;
    box-shadow: 0 0 10px var(--color-neon-orange-glow) !important;
}
.toast-danger::before {
    content: "⚠️";
    font-size: 1.1rem;
}
.toast-info {
    border-color: var(--color-neon-cyan) !important;
    box-shadow: 0 0 10px var(--color-neon-cyan-glow) !important;
}
.toast-info::before {
    content: "🔧";
    font-size: 1.1rem;
}
`;
document.head.appendChild(toastStyle);

const toastContainer = document.createElement("div");
toastContainer.className = "toast-container";
document.body.appendChild(toastContainer);

function showToast(message, type = 'success') {
    const toast = document.createElement("div");
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = " " + message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add("active");
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove("active");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// --- Initializing Admin Panel ---
function init() {
    const isAuthorized = sessionStorage.getItem("admin_authorized") === "true";
    const overlay = document.getElementById("admin-login-overlay");
    const header = document.getElementById("admin-header");
    const container = document.querySelector(".admin-container");

    if (isAuthorized) {
        if (overlay) overlay.style.display = "none";
        if (header) header.style.display = "";
        if (container) container.style.display = "";
        
        loadDatabase();
        setupNavigation();
        renderStats();
        renderProductsTable();
        renderOrdersTable();
        setupFormEventListeners();
        setupBackupListeners();
    } else {
        if (overlay) overlay.style.display = "flex";
        if (header) header.style.display = "none";
        if (container) container.style.display = "none";
        
        setupLoginListeners();
    }
}

function setupLoginListeners() {
    const overlay = document.getElementById("admin-login-overlay");
    const header = document.getElementById("admin-header");
    const container = document.querySelector(".admin-container");
    const passwordInput = document.getElementById("admin-password-input");
    const submitBtn = document.getElementById("btn-login-submit");
    const errorMsg = document.getElementById("login-error-msg");

    function attemptLogin() {
        const password = passwordInput.value;
        if (password === "masita_sakura3") {
            sessionStorage.setItem("admin_authorized", "true");
            
            overlay.style.display = "none";
            header.style.display = "";
            container.style.display = "";
            
            loadDatabase();
            setupNavigation();
            renderStats();
            renderProductsTable();
            renderOrdersTable();
            setupFormEventListeners();
            setupBackupListeners();
            
            showToast("Acceso autorizado. Caldera presurizada.", "success");
        } else {
            errorMsg.style.display = "block";
            passwordInput.value = "";
            passwordInput.focus();
            
            const card = document.querySelector(".login-card");
            card.classList.add("shake-animation");
            setTimeout(() => {
                card.classList.remove("shake-animation");
            }, 500);
        }
    }

    submitBtn.addEventListener("click", attemptLogin);
    passwordInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            attemptLogin();
        }
    });
}

// --- Load / Reload Data from localStorage ---
function loadDatabase() {
    // Products
    const storedProducts = localStorage.getItem("diesel_products");
    if (storedProducts) {
        try { products = JSON.parse(storedProducts); } catch (e) { products = [...DEFAULT_PRODUCTS]; }
    } else {
        products = [...DEFAULT_PRODUCTS];
        localStorage.setItem("diesel_products", JSON.stringify(products));
    }

    // Orders
    const storedOrders = localStorage.getItem("diesel_orders");
    if (storedOrders) {
        try { orders = JSON.parse(storedOrders); } catch (e) { orders = []; }
    } else {
        orders = [];
    }

    // Visits
    visits = parseInt(localStorage.getItem("diesel_visits") || "0");
}

function saveProductsDatabase() {
    localStorage.setItem("diesel_products", JSON.stringify(products));
}

// --- Navigation Controller ---
function setupNavigation() {
    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            const targetTab = e.currentTarget.getAttribute("data-tab");
            
            // Switch tabs styling
            tabs.forEach(t => {
                t.classList.remove("active");
                t.querySelector(".indicator-led").className = "indicator-led status-off";
            });
            e.currentTarget.classList.add("active");
            e.currentTarget.querySelector(".indicator-led").className = "indicator-led status-green";

            // Switch panel display
            panels.forEach(p => p.classList.remove("active"));
            document.getElementById(targetTab).classList.add("active");
            
            // Re-render target logs/stats to stay fresh
            loadDatabase();
            if (targetTab === "tab-stats") {
                renderStats();
            } else if (targetTab === "tab-products") {
                renderProductsTable();
            } else if (targetTab === "tab-orders") {
                renderOrdersTable();
            }
        });
    });
}

// ==========================================================================
// TAB 1: METRICS AND STATISTICS CALCULATORS
// ==========================================================================
function renderStats() {
    // 1. Calculations
    let totalRevenue = 0;
    const ordersCount = orders.length;
    
    orders.forEach(o => {
        totalRevenue += o.total;
    });

    const conversionRate = visits > 0 ? ((ordersCount / visits) * 100).toFixed(1) : "0";

    // 2. Set DOM
    statRevenue.textContent = `$${totalRevenue.toFixed(2)}`;
    statOrdersCount.textContent = ordersCount;
    statVisitsCount.textContent = visits;
    statConversion.textContent = `${conversionRate}%`;

    // 3. Top-selling product list calculation
    const salesMap = {}; // productID -> { title, category, quantity, revenue }
    
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!salesMap[item.id]) {
                salesMap[item.id] = {
                    title: item.title,
                    category: item.category,
                    quantity: 0,
                    revenue: 0
                };
            }
            salesMap[item.id].quantity += item.quantity;
            salesMap[item.id].revenue += item.price * item.quantity;
        });
    });

    const sortedProducts = Object.values(salesMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    
    topProductsTbody.innerHTML = "";
    if (sortedProducts.length === 0) {
        topProductsTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--color-text-muted);">Sin transacciones registradas.</td></tr>`;
        return;
    }

    sortedProducts.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${item.title}</strong></td>
            <td><span class="product-badge ${item.category}-badge" style="position:static; padding:2px 8px; font-size:0.75rem;">${item.category}</span></td>
            <td>${item.quantity} unidades</td>
            <td style="color: var(--color-neon-green); font-family: var(--font-display);">$${item.revenue.toFixed(2)}</td>
        `;
        topProductsTbody.appendChild(row);
    });
}

// ==========================================================================
// TAB 2: PRODUCT CATALOG MANAGEMENT (CRUD)
// ==========================================================================
function renderProductsTable() {
    productsTbody.innerHTML = "";
    
    products.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${p.image}" alt="${p.title}" class="admin-table-thumb"></td>
            <td><strong>${p.title}</strong></td>
            <td><span class="product-badge ${p.category}-badge" style="position:static; padding:2px 8px; font-size:0.75rem;">${p.category}</span></td>
            <td style="color: var(--color-brass); font-family: var(--font-display);">$${p.price.toFixed(2)}</td>
            <td>
                <div style="display:flex; gap: 8px;">
                    <button class="btn-action" onclick="editProduct('${p.id}')">EDITAR</button>
                    <button class="btn-action btn-action-danger" onclick="deleteProduct('${p.id}')">ELIMINAR</button>
                </div>
            </td>
        `;
        productsTbody.appendChild(row);
    });
}

// Delete Product
function deleteProduct(id) {
    if (confirm("¿Estás seguro de que deseas retirar esta pieza del catálogo?")) {
        products = products.filter(p => p.id !== id);
        saveProductsDatabase();
        renderProductsTable();
    }
}
window.deleteProduct = deleteProduct; // Bind to window for inline onclicks

// Prefill form for editing
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    isEditing = true;
    editProductId = id;
    formActionTitle.textContent = "Editar Pieza Registrada";
    btnSubmitForm.textContent = "Guardar Modificación";
    btnCancelEdit.classList.remove("hidden");

    // Populate Fields
    formProductId.value = product.id;
    pTitle.value = product.title;
    pCategory.value = product.category;
    pDesc.value = product.description;
    
    const isFree = product.isFree || product.price === 0;
    pIsFree.checked = isFree;
    if (isFree) {
        pPrice.value = "0";
        pPrice.disabled = true;
        pPayLink.value = "";
        pPayLink.disabled = true;
    } else {
        pPrice.value = product.price;
        pPrice.disabled = false;
        pPayLink.value = product.paymentLink || "";
        pPayLink.disabled = false;
    }
    
    // Toggle image selectors
    if (product.image.startsWith("assets/images/")) {
        pImage.value = product.image;
        pImageCustom.classList.add("hidden");
        pImageCustom.value = "";
    } else {
        pImage.value = "custom";
        pImageCustom.classList.remove("hidden");
        pImageCustom.value = product.image;
    }

    // Toggle download file group
    if (product.category === "archivos") {
        downloadFileGroup.classList.remove("hidden");
        pDownload.value = product.downloadFile || "";
    } else {
        downloadFileGroup.classList.add("hidden");
        pDownload.value = "";
    }

    // Load specs
    tempSpecs = { ...product.specs };
    renderSpecsBadges();

    // Scroll to form (for UX on mobile)
    document.querySelector(".form-plate").scrollIntoView({ behavior: "smooth" });
}
window.editProduct = editProduct;

// Add new specification key-value pair to item
function addSpec() {
    const key = specKeyInput.value.trim();
    const val = specValInput.value.trim();

    if (!key || !val) {
        showToast("Introduce ambos parámetros de la especificación técnica.", "danger");
        return;
    }

    tempSpecs[key] = val;
    specKeyInput.value = "";
    specValInput.value = "";
    renderSpecsBadges();
}

function removeSpec(key) {
    delete tempSpecs[key];
    renderSpecsBadges();
}
window.removeSpec = removeSpec;

function renderSpecsBadges() {
    specsListContainer.innerHTML = "";
    for (const [key, val] of Object.entries(tempSpecs)) {
        const badge = document.createElement("li");
        badge.className = "spec-badge";
        badge.innerHTML = `
            <span><strong>${key}:</strong> ${val}</span>
            <button type="button" class="btn-remove-spec" onclick="removeSpec('${key}')">x</button>
        `;
        specsListContainer.appendChild(badge);
    }
}

// Cancel Editing action
function cancelEdit() {
    isEditing = false;
    editProductId = null;
    formActionTitle.textContent = "Cargar Nueva Pieza";
    btnSubmitForm.textContent = "Presurizar al Catálogo";
    btnCancelEdit.classList.add("hidden");
    
    productForm.reset();
    tempSpecs = {};
    renderSpecsBadges();
    pImageCustom.classList.add("hidden");
    pPayLink.value = "";
    pIsFree.checked = false;
    pPrice.disabled = false;
    pPayLink.disabled = false;
    downloadFileGroup.classList.remove("hidden"); // default archivos show
}

// Setup Form listeners
function setupFormEventListeners() {
    // Checkbox isFree change listener
    pIsFree.addEventListener("change", (e) => {
        if (e.target.checked) {
            pPrice.value = "0";
            pPrice.disabled = true;
            pPayLink.value = "";
            pPayLink.disabled = true;
        } else {
            pPrice.disabled = false;
            pPayLink.disabled = false;
        }
    });

    // Show custom image URL input if selected
    pImage.addEventListener("change", (e) => {
        if (e.target.value === "custom") {
            pImageCustom.classList.remove("hidden");
        } else {
            pImageCustom.classList.add("hidden");
        }
    });

    // Show/hide download file input based on category
    pCategory.addEventListener("change", (e) => {
        if (e.target.value === "archivos") {
            downloadFileGroup.classList.remove("hidden");
        } else {
            downloadFileGroup.classList.add("hidden");
        }
    });

    // Add specification button listener
    btnAddSpec.addEventListener("click", addSpec);

    // Cancel edit listener
    btnCancelEdit.addEventListener("click", cancelEdit);

    // Form submit listener (Insert/Update)
    productForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = pTitle.value.trim();
        const isFree = pIsFree.checked;
        const price = isFree ? 0 : parseFloat(pPrice.value);
        const desc = pDesc.value.trim();
        const category = pCategory.value;
        const paymentLink = isFree ? "" : pPayLink.value.trim();
        
        let image = pImage.value;
        if (image === "custom") {
            image = pImageCustom.value.trim();
        }

        if (!title || isNaN(price) || !desc || !image) {
            showToast("Por favor completa los campos obligatorios.", "danger");
            return;
        }

        let downloadFile = "";
        if (category === "archivos") {
            downloadFile = pDownload.value.trim() || "modelo_3d.stl";
        }

        if (isEditing) {
            // Update
            const index = products.findIndex(p => p.id === editProductId);
            if (index !== -1) {
                products[index] = {
                    id: editProductId,
                    title,
                    category,
                    price,
                    description: desc,
                    image,
                    specs: { ...tempSpecs },
                    paymentLink,
                    isFree,
                    ...(category === "archivos" ? { downloadFile } : {})
                };
            }
            showToast("Especificaciones de la pieza actualizadas con éxito.", "success");
        } else {
            // Create
            const newId = `prod-${category}-${Date.now()}`;
            const newProduct = {
                id: newId,
                title,
                category,
                price,
                description: desc,
                image,
                specs: { ...tempSpecs },
                paymentLink,
                isFree,
                ...(category === "archivos" ? { downloadFile } : {})
            };
            products.push(newProduct);
            showToast("Nueva pieza agregada al catálogo e inventario.", "success");
        }

        saveProductsDatabase();
        cancelEdit();
        renderProductsTable();
    });
}

// ==========================================================================
// TAB 3: ORDER HISTORY (BITÁCORA)
// ==========================================================================
function renderOrdersTable() {
    ordersTbody.innerHTML = "";
    
    if (orders.length === 0) {
        ordersTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted);">Ninguna transacción registrada en el caldero.</td></tr>`;
        return;
    }

    orders.forEach(order => {
        const orderDate = new Date(order.date);
        
        let itemsBadgeHtml = "";
        order.items.forEach(item => {
            itemsBadgeHtml += `<span class="order-item-tag">${item.quantity}x ${item.title}</span><br>`;
        });

        // WhatsApp buyer link
        const buyerText = encodeURIComponent(`Hola, te contacto desde la administración de Boutique3D sobre la orden ${order.id}.`);
        const waLink = `https://wa.me/5493816253809?text=${buyerText}`; // dummy contact phone

        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="font-family: var(--font-display);"><strong>${order.id}</strong></td>
            <td>${orderDate.toLocaleDateString()} ${orderDate.toLocaleTimeString()}</td>
            <td class="order-item-list">${itemsBadgeHtml}</td>
            <td style="color: var(--color-neon-green); font-family: var(--font-display); font-weight: bold;">$${order.total.toFixed(2)}</td>
            <td>
                <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
            </td>
            <td>
                <div style="display:flex; gap: 8px;">
                    ${order.status === "Pendiente" ? `
                        <button class="btn-action" onclick="toggleOrderStatus('${order.id}')">DESPACHAR</button>
                    ` : ''}
                    <a href="${waLink}" target="_blank" class="btn-action" style="text-decoration:none; display:inline-block; text-align:center;">WHATSAPP</a>
                </div>
            </td>
        `;
        ordersTbody.appendChild(row);
    });
}

function toggleOrderStatus(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    order.status = "Completado";
    localStorage.setItem("diesel_orders", JSON.stringify(orders));
    renderOrdersTable();
}
window.toggleOrderStatus = toggleOrderStatus;

function clearOrders() {
    if (confirm("¿Estás seguro de que deseas reiniciar la bitácora de pedidos? Las estadísticas se borrarán.")) {
        orders = [];
        localStorage.setItem("diesel_orders", JSON.stringify(orders));
        renderOrdersTable();
    }
}

// ==========================================================================
// SYSTEM UTILITIES (BACKUPS / FACTORY RESET)
// ==========================================================================
function setupBackupListeners() {
    // Export Database to local JSON
    btnExportDb.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 4));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `boutique3d_inventario_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    // Import Database from local JSON file
    importDbFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const importedProducts = JSON.parse(evt.target.result);
                
                // Validate structure simply by checking if it's an array and holds items with ids
                if (Array.isArray(importedProducts) && importedProducts.every(p => p.id && p.title && p.price)) {
                    products = importedProducts;
                    saveProductsDatabase();
                    renderProductsTable();
                    showToast("Inventario cargado y sincronizado con éxito.", "success");
                } else {
                    showToast("Error: El archivo JSON cargado no posee el formato de inventario correcto.", "danger");
                }
            } catch (err) {
                showToast("Error al leer el archivo JSON: formato inválido.", "danger");
            }
        };
        reader.readAsText(file);
    });

    // Reset Factory Database (Clear all caches)
    btnResetDb.addEventListener("click", () => {
        if (confirm("¡ATENCIÓN! Se restablecerán todos los productos originales de fábrica y se eliminarán visitas, estadísticas y compras del navegador. ¿Deseas continuar?")) {
            localStorage.removeItem("diesel_products");
            localStorage.removeItem("diesel_orders");
            localStorage.removeItem("diesel_visits");
            localStorage.removeItem("diesel_cart");
            
            // Reload and refresh dashboard
            loadDatabase();
            cancelEdit();
            renderStats();
            renderProductsTable();
            renderOrdersTable();
            
            showToast("Caldera restablecida a los valores originales de fábrica.", "info");
        }
    });

    // Clear Orders
    btnClearOrders.addEventListener("click", clearOrders);
}

// Boot Admin Console
document.addEventListener("DOMContentLoaded", init);

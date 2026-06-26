// ==========================================================================
// BOUTIQUE3D - STORE CORE LOGIC
// ==========================================================================

// --- Web Audio Synthesizer (Retro Sounds) ---
const AudioController = {
    enabled: true,
    ctx: null,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.enabled;
    },

    playClick() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.06);
    },

    playSteam() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        if (ctx.state === 'suspended') ctx.resume();

        const bufferSize = ctx.sampleRate * 1.5; // 1.5s
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 1.2;
        filter.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 1.2);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 1.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
    },

    playGear() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(85, ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.12);
    }
};

// --- Product Database ---
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

let PRODUCTS = [];

function loadProducts() {
    const stored = localStorage.getItem("diesel_products");
    if (stored) {
        try {
            PRODUCTS = JSON.parse(stored);
        } catch (e) {
            PRODUCTS = [...DEFAULT_PRODUCTS];
        }
    } else {
        PRODUCTS = [...DEFAULT_PRODUCTS];
        localStorage.setItem("diesel_products", JSON.stringify(PRODUCTS));
    }
}

// --- Application State ---
let cart = [];
let currentCategory = "all";
let searchQuery = "";

// --- DOM Elements ---
const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const filterPills = document.querySelectorAll(".pill");
const navButtons = document.querySelectorAll(".nav-btn");
const cartBtn = document.getElementById("cart-btn");
const cartOverlay = document.getElementById("cart-overlay");
const cartDrawer = document.getElementById("cart-drawer");
const closeCartBtn = document.getElementById("close-cart-btn");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartTotalValue = document.getElementById("cart-total-value");
const cartCountBadge = document.getElementById("cart-count");
const checkoutBtn = document.getElementById("checkout-btn");
const soundToggle = document.getElementById("sound-toggle");
const detailsDialog = document.getElementById("product-details-dialog");
const detailsContent = document.getElementById("product-details-content");
const invoiceDialog = document.getElementById("invoice-dialog");
const invoicePaper = document.getElementById("invoice-paper");
const invoiceWhatsappBtn = document.getElementById("invoice-whatsapp-btn");
const invoiceCloseBtn = document.getElementById("invoice-close-btn");

// --- Initialize App ---
function init() {
    // Increment visitor count
    const visits = parseInt(localStorage.getItem("diesel_visits") || "0") + 1;
    localStorage.setItem("diesel_visits", visits);

    loadProducts();
    loadCartFromStorage();
    renderProducts();
    updateCartUI();
    setupEventListeners();
    animateGauge();
}

// --- Local Storage Management ---
function saveCartToStorage() {
    localStorage.setItem("diesel_cart", JSON.stringify(cart));
}

function loadCartFromStorage() {
    const stored = localStorage.getItem("diesel_cart");
    if (stored) {
        try {
            cart = JSON.parse(stored);
        } catch (e) {
            cart = [];
        }
    }
}

// --- Render Catalog ---
function renderProducts() {
    productGrid.innerHTML = "";
    
    const filtered = PRODUCTS.filter(p => {
        const matchesCategory = currentCategory === "all" || p.category === currentCategory;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        productGrid.innerHTML = `
            <div class="loading-spinner">
                <p>No se encontraron piezas o engranajes con ese nombre.</p>
            </div>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement("article");
        card.className = `product-card ${p.category}-tag`;
        card.id = `card-${p.id}`;
        
        const isFree = p.isFree || p.price === 0;
        const isDigital = p.category === "archivos";
        
        card.innerHTML = `
            <span class="product-badge ${p.category}-badge">${p.category === 'archivos' ? 'Archivo 3D' : p.category}</span>
            <button class="btn-details" data-id="${p.id}" title="Ver especificaciones" aria-label="Ver detalles de ${p.title}">
                <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M11,9H13V7H11V9M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M11,17H13V11H11V17Z" />
                </svg>
            </button>
            <div class="product-img-wrapper">
                <img src="${p.image}" alt="${p.title}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${p.title}</h3>
                <p class="product-desc">${p.description}</p>
                <div class="product-footer-row">
                    ${isFree ? `<span class="product-price free-price">GRATIS</span>` : `<span class="product-price">$${p.price.toFixed(2)}</span>`}
                    <div class="action-btn-group">
                        ${isFree && isDigital ? `
                            <button class="btn-buy btn-direct-download" data-file="${p.downloadFile || 'modelo_3d.stl'}">DESCARGAR</button>
                        ` : `
                            ${p.paymentLink ? `<a href="${p.paymentLink}" target="_blank" class="btn-buy btn-pay-now" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">PAGAR</a>` : ''}
                            <button class="btn-buy" data-id="${p.id}">CARGAR</button>
                        `}
                    </div>
                </div>
            </div>
            <div class="product-card-bottom-rivets"></div>
        `;

        // Sound on hover of card
        card.addEventListener('mouseenter', () => AudioController.playGear());

        productGrid.appendChild(card);
    });

    // Attach listeners to newly created buttons
    productGrid.querySelectorAll(".btn-buy").forEach(b => {
        b.addEventListener("click", (e) => {
            if (e.currentTarget.classList.contains("btn-direct-download")) {
                const filename = e.currentTarget.getAttribute("data-file");
                simulateDownload(filename);
            } else {
                const id = e.currentTarget.getAttribute("data-id");
                addToCart(id);
            }
        });
    });

    productGrid.querySelectorAll(".btn-details").forEach(b => {
        b.addEventListener("click", (e) => {
            const id = e.currentTarget.getAttribute("data-id");
            openDetails(id);
        });
    });
}

// --- Cart Actions ---
function addToCart(id) {
    AudioController.playClick();
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCartToStorage();
    updateCartUI();
    
    // Quick visual pulse to cart icon
    cartBtn.classList.add("pulse");
    setTimeout(() => cartBtn.classList.remove("pulse"), 300);
}

function updateCartQty(id, delta) {
    AudioController.playClick();
    const item = cart.find(item => item.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== id);
    }

    saveCartToStorage();
    updateCartUI();
}

function removeFromCart(id) {
    AudioController.playClick();
    cart = cart.filter(item => item.id !== id);
    saveCartToStorage();
    updateCartUI();
}

function updateCartUI() {
    cartItemsContainer.innerHTML = "";
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-message">El contenedor de carga está vacío. Cargue combustible y piezas.</p>`;
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;

            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="btn-remove-item" data-id="${item.id}" aria-label="Remover del carrito">
                        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                    </button>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        // Add event listeners to remove buttons
        cartItemsContainer.querySelectorAll(".btn-remove-item").forEach(b => {
            b.addEventListener("click", (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                removeFromCart(id);
            });
        });
    }

    cartTotalValue.textContent = `$${total.toFixed(2)}`;
    cartCountBadge.textContent = count;
}

// Ensure function is available globally for inline onclick
window.updateCartQty = updateCartQty;

// --- Modal Details ---
function openDetails(id) {
    AudioController.playClick();
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    let specsHtml = "";
    for (const [key, val] of Object.entries(product.specs)) {
        specsHtml += `<li><strong>${key.toUpperCase()}:</strong> <span>${val}</span></li>`;
    }

    const isFree = product.isFree || product.price === 0;
    const isDigital = product.category === "archivos";

    detailsContent.innerHTML = `
        <div class="dialog-header">
            <h2>${product.title}</h2>
            <button class="close-btn" id="close-dialog-btn" aria-label="Cerrar ventana de detalles">
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
            </button>
        </div>
        <div class="dialog-body">
            <div class="dialog-img-wrapper">
                <img src="${product.image}" alt="${product.title}" class="dialog-img">
            </div>
            <div class="dialog-info">
                <div>
                    <p class="dialog-desc">${product.description}</p>
                    <ul class="specs-list">
                        ${specsHtml}
                    </ul>
                </div>
                <div class="dialog-footer">
                    ${isFree ? `<span class="dialog-price free-price">GRATIS</span>` : `<span class="dialog-price">$${product.price.toFixed(2)}</span>`}
                    <div style="display:flex; gap:10px;">
                        ${isFree && isDigital ? `
                            <button class="btn-buy btn-direct-download-details" data-file="${product.downloadFile || 'modelo_3d.stl'}">DESCARGAR AHORA</button>
                        ` : `
                            ${product.paymentLink ? `<a href="${product.paymentLink}" target="_blank" class="btn-buy btn-pay-now" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">PAGAR AHORA</a>` : ''}
                            <button class="btn-buy" id="dialog-buy-btn" data-id="${product.id}">AÑADIR A CARGA</button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;

    detailsDialog.showModal();

    // Event listeners inside details modal
    document.getElementById("close-dialog-btn").addEventListener("click", () => {
        AudioController.playClick();
        detailsDialog.close();
    });

    const downloadBtnDetails = detailsContent.querySelector(".btn-direct-download-details");
    if (downloadBtnDetails) {
        downloadBtnDetails.addEventListener("click", (e) => {
            const filename = e.currentTarget.getAttribute("data-file");
            simulateDownload(filename);
            detailsDialog.close();
        });
    }

    const buyBtnDetails = document.getElementById("dialog-buy-btn");
    if (buyBtnDetails) {
        buyBtnDetails.addEventListener("click", (e) => {
            const pid = e.currentTarget.getAttribute("data-id");
            addToCart(pid);
            detailsDialog.close();
        });
    }
}

// --- Checkout & Invoice Simulation ---
function runCheckout() {
    AudioController.playSteam();
    closeCart();
    
    // Generate Invoice Data
    const date = new Date();
    const invoiceId = `F-${date.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    let subtotal = 0;
    let itemsHtml = "";
    let containsDownloads = false;
    let downloadsHtml = "";
    let containsPaymentLinks = false;
    let paymentLinksHtml = "";
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHtml += `
${item.title.substring(0, 20).padEnd(20)} ${item.quantity.toString().padStart(3)} $${itemTotal.toFixed(2).padStart(8)}
`;
        
        if (item.paymentLink) {
            containsPaymentLinks = true;
            paymentLinksHtml += `
<div class="download-link-item" style="margin-bottom: 8px;">
    <span>[Pago] ${item.title.substring(0, 18)}</span>
    <a href="${item.paymentLink}" target="_blank" class="download-file-btn" style="text-decoration:none; display:inline-block; font-size:0.7rem; padding:2px 6px;">PAGAR</a>
</div>`;
        }
        
        if (item.category === "archivos") {
            containsDownloads = true;
            downloadsHtml += `
<div class="download-link-item">
    <span>[Archivo] ${item.downloadFile}</span>
    <button class="download-file-btn" onclick="simulateDownload('${item.downloadFile}')">DESCARGAR</button>
</div>`;
        }
    });
    
    const surcharge = subtotal * 0.05; // 5% simulated pressurized packaging surcharge
    const grandTotal = subtotal + surcharge;
    
    const paperContent = `
<div class="invoice-header">
    <h3>BOUTIQUE3D</h3>
    <p>EST. 2026 // DIESELPUNK FACTORY</p>
    <p>--- RECIBO DE OPERACIÓN ---</p>
</div>
<div class="invoice-meta">
    <p><strong>Nº CONTROL:</strong> ${invoiceId}</p>
    <p><strong>FECHA:</strong> ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
    <p><strong>ESTADO:</strong> COMPRA SIMULADA APROBADA</p>
</div>
<div class="invoice-divider"></div>
<pre style="font-family: inherit; margin: 0; white-space: pre-wrap;">
DETALLE              CANT    VALOR
----------------------------------${itemsHtml}----------------------------------
SUBTOTAL:               $${subtotal.toFixed(2).padStart(8)}
AJUSTE PRESIÓN (5%):    $${surcharge.toFixed(2).padStart(8)}
==================================
TOTAL FACTURADO:        $${grandTotal.toFixed(2).padStart(8)}
</pre>
<div class="invoice-divider"></div>
<p style="font-size: 0.75rem; text-align: center; margin-top: 10px;">
    Gracias por alimentar la caldera del taller digital.
</p>
${containsPaymentLinks ? `
<div class="invoice-divider"></div>
<div class="download-links-container" style="border-color: #ff5500; margin-bottom: 10px;">
    <h4 style="margin-bottom: 8px; font-size: 0.8rem; font-weight: bold; color: #ff5500;">LINKS DE PAGO DIRECTO:</h4>
    ${paymentLinksHtml}
    <div style="background: rgba(255, 85, 0, 0.08); border: 1px dashed #ff5500; padding: 8px; margin-top: 10px; font-size: 0.72rem; text-align: center; line-height: 1.3; color: var(--color-text-dark);">
        <strong>📢 ACCIÓN REQUERIDA:</strong><br>
        Una vez efectuado el pago, presiona el botón verde de abajo para enviarnos tu comprobante por WhatsApp y despachar tus piezas.
    </div>
</div>
` : ''}
${containsDownloads ? `
<div class="invoice-divider"></div>
<div class="download-links-container">
    <h4 style="margin-bottom: 8px; font-size: 0.8rem; font-weight: bold;">ARCHIVOS LISTOS PARA DESCARGA:</h4>
    ${downloadsHtml}
</div>
` : ''}
`;
    
    // Reset Paper and print
    invoicePaper.innerHTML = "";
    invoiceDialog.showModal();
    
    // Typewriter effect simulation for the receipt lines
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = paperContent;
    
    // Print everything
    invoicePaper.innerHTML = paperContent;

    // Save order in localStorage for the Admin bitacora/stats
    const orderRecord = {
        id: invoiceId,
        date: date.toISOString(),
        items: cart.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            category: item.category
        })),
        subtotal: subtotal,
        surcharge: surcharge,
        total: grandTotal,
        status: "Pendiente"
    };
    
    const existingOrders = JSON.parse(localStorage.getItem("diesel_orders") || "[]");
    existingOrders.unshift(orderRecord);
    localStorage.setItem("diesel_orders", JSON.stringify(existingOrders));

    // Configure WhatsApp redirect
    setupWhatsAppBtn(invoiceId, grandTotal, containsPaymentLinks);

    // Empty cart state now that purchase is made
    cart = [];
    saveCartToStorage();
    updateCartUI();
}

function setupWhatsAppBtn(invoiceId, total, hasPaymentLinks) {
    // Generate text for WhatsApp
    let waText = `🛠️ *Boutique3D* 🛠️\n`;
    waText += `*Orden de Compra:* ${invoiceId}\n`;
    waText += `------------------------------------\n`;
    
    cart.forEach(item => {
        waText += `• ${item.quantity}x _${item.title}_ ($${(item.price * item.quantity).toFixed(2)})\n`;
    });
    
    waText += `------------------------------------\n`;
    waText += `*Total:* $${(total).toFixed(2)}\n\n`;
    
    if (hasPaymentLinks) {
        waText += `¡Hola! Ya realicé el pago de mi pedido mediante el link de pago directo. Aquí adjunto el comprobante del ticket para despachar el envío de mis piezas.`;
    } else {
        waText += `¡Hola! Me gustaría coordinar el pago de mi pedido y ultimar detalles (personalizaciones/envío).`;
    }
    
    const encodedText = encodeURIComponent(waText);
    // Dummy whatsapp phone number
    const phoneNumber = "5493816253809"; 
    
    invoiceWhatsappBtn.onclick = () => {
        AudioController.playClick();
        window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
    };
}

// Function to simulate file download
function simulateDownload(filename) {
    AudioController.playClick();
    
    // Create temporary link to trigger text download
    const blobContent = `--- BOUTIQUE3D ---\nArchivo 3D: ${filename}\n\nEste es un archivo simulado para verificar la descarga de tu modelo 3D.\nEn producción, este archivo contendría el mesh STL final.`;
    const blob = new Blob([blobContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.stl', '.txt'); // download as txt for simple simulation in browser
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
window.simulateDownload = simulateDownload;

// --- Modal Close ---
function closeCart() {
    cartOverlay.classList.remove("active");
    cartOverlay.setAttribute("aria-hidden", "true");
}

function openCart() {
    AudioController.playClick();
    cartOverlay.classList.add("active");
    cartOverlay.setAttribute("aria-hidden", "false");
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Search Input
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderProducts();
    });

    // Category pills filter
    filterPills.forEach(pill => {
        pill.addEventListener("click", (e) => {
            AudioController.playClick();
            
            filterPills.forEach(p => p.classList.remove("active"));
            e.currentTarget.classList.add("active");
            
            currentCategory = e.currentTarget.getAttribute("data-filter");
            
            // Sync header buttons
            syncNavButtons(currentCategory);
            renderProducts();
        });
    });

    // Nav Header links filter
    navButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            AudioController.playClick();
            
            navButtons.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");
            
            currentCategory = e.currentTarget.getAttribute("data-category");
            
            // Sync grid pills
            syncGridPills(currentCategory);
            renderProducts();
        });
    });

    // Cart visibility
    cartBtn.addEventListener("click", openCart);
    closeCartBtn.addEventListener("click", () => {
        AudioController.playClick();
        closeCart();
    });
    cartOverlay.addEventListener("click", (e) => {
        if (e.target === cartOverlay) {
            AudioController.playClick();
            closeCart();
        }
    });

    // Checkout button
    checkoutBtn.addEventListener("click", runCheckout);

    // Invoice actions
    invoiceCloseBtn.addEventListener("click", () => {
        AudioController.playClick();
        invoiceDialog.close();
    });

    // Sound toggle button
    soundToggle.addEventListener("click", () => {
        const isSoundOn = AudioController.toggle();
        soundToggle.classList.toggle("muted", !isSoundOn);
        
        const textSpan = soundToggle.querySelector(".sound-status");
        textSpan.textContent = isSoundOn ? "SONIDO: SÍ" : "SONIDO: NO";
        
        const iconOn = soundToggle.querySelector(".icon-sound-on");
        const iconOff = soundToggle.querySelector(".icon-sound-off");
        
        if (isSoundOn) {
            iconOn.classList.remove("hidden");
            iconOff.classList.add("hidden");
            AudioController.playClick();
        } else {
            iconOn.classList.add("hidden");
            iconOff.classList.remove("hidden");
        }
    });
}

function syncNavButtons(category) {
    navButtons.forEach(btn => {
        if (btn.getAttribute("data-category") === category) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

function syncGridPills(category) {
    filterPills.forEach(pill => {
        if (pill.getAttribute("data-filter") === category) {
            pill.classList.add("active");
        } else {
            pill.classList.remove("active");
        }
    });
}

// --- Decorative PSI Jitter Animation ---
function animateGauge() {
    const psiVal = document.getElementById("gauge-psi");
    const needle = document.getElementById("gauge-needle");
    
    setInterval(() => {
        // Subtle variations around 108-115 PSI
        const currentPsi = Math.floor(108 + Math.random() * 8);
        psiVal.textContent = currentPsi;
        
        // Slightly rotate the needle
        const deg = 35 + (currentPsi - 108) * 2;
        needle.style.transform = `rotate(${deg}deg)`;
    }, 1500);
}

// Boot the application on page load
document.addEventListener("DOMContentLoaded", init);

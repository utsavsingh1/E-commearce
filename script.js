// --- State Management ---
let cart = [];
let allProducts = [];

// --- DOM Elements ---
const productGrid = document.getElementById('product-grid');
const cartToggleBtn = document.getElementById('cart-toggle');
const closeCartBtn = document.getElementById('close-cart');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountElements = [document.getElementById('cart-count'), document.getElementById('cart-header-count')];
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

// Payment Modal
const paymentOverlay = document.getElementById('payment-overlay');
const closePaymentBtn = document.getElementById('close-payment');
const paymentAmountEl = document.getElementById('payment-amount');
const paymentForm = document.getElementById('payment-form');
const paymentBody = document.querySelector('.payment-body');
const paymentSuccess = document.getElementById('payment-success');
const continueShoppingBtn = document.getElementById('continue-shopping');
const paySubmitBtn = document.getElementById('pay-submit-btn');

// Auth DOM
const userSectionBtn = document.getElementById('user-section-btn');
const authOverlay = document.getElementById('auth-overlay');
const closeAuthBtn = document.getElementById('close-auth');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const switchRegisterBtn = document.getElementById('switch-register');
const switchLoginBtn = document.getElementById('switch-login');
const logoutBtn = document.getElementById('logout-btn');
const adminPanelBtn = document.getElementById('admin-panel-btn');

// Admin Modal
const adminOverlay = document.getElementById('admin-overlay');
const closeAdminBtn = document.getElementById('close-admin');
const addProductForm = document.getElementById('add-product-form');


// --- Initialization ---
async function init() {
    await loadProducts();
    setupEventListeners();
    updateCartUI();
    updateAuthUI();
}

// --- Data & Render Functions ---
async function loadProducts() {
    allProducts = await db.getProducts();
    renderProducts(allProducts);
}

function renderProducts(productsToRender) {
    if (productsToRender.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No products found.</p>';
        return;
    }

    productGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card">
            <div class="product-image">
                <span class="product-category">${product.category}</span>
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">₹${Number(product.price).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    <button class="add-to-cart" data-id="${product.id}" onclick="addToCart(${product.id}, this)">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    ${db.getCurrentUser()?.role === 'Admin' ? `<button class="delete-btn" onclick="deleteProduct(${product.id})" style="color:red; margin-left:10px;"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// --- Auth & Admin Logic ---
function updateAuthUI() {
    const user = db.getCurrentUser();
    
    if (user) {
        userSectionBtn.innerHTML = `<i class="fa-solid fa-user"></i> <span style="font-size: 0.9rem;">${user.username}</span>`;
        logoutBtn.style.display = 'block';
        if (user.role === 'Admin') {
            adminPanelBtn.style.display = 'block';
        } else {
            adminPanelBtn.style.display = 'none';
        }
    } else {
        userSectionBtn.innerHTML = `<i class="fa-solid fa-user"></i>`;
        logoutBtn.style.display = 'none';
        adminPanelBtn.style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;
    try {
        await db.login(username, password);
        authOverlay.classList.remove('active');
        loginForm.reset();
        updateAuthUI();
        loadProducts(); // Re-render to show admin controls if applicable
    } catch (err) {
        alert(err.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = registerForm.username.value;
    const password = registerForm.password.value;
    try {
        await db.register(username, password);
        alert('Registration successful! You can now log in.');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } catch (err) {
        alert(err.message);
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    const newProduct = {
        name: addProductForm.name.value,
        price: parseFloat(addProductForm.price.value),
        description: addProductForm.description.value,
        image: addProductForm.image.value || "https://images.unsplash.com/photo-1550009158-9ebf6d173e97?auto=format&fit=crop&q=80&w=600",
        category: addProductForm.category.value
    };
    try {
        await db.addProduct(newProduct);
        adminOverlay.classList.remove('active');
        addProductForm.reset();
        await loadProducts();
        alert("Product added successfully!");
    } catch(err) {
        alert(err.message);
    }
}

window.deleteProduct = async function(id) {
    if(confirm("Are you sure you want to delete this product?")) {
        try {
            await db.deleteProduct(id);
            await loadProducts();
        } catch(err) {
            alert(err.message);
        }
    }
};

// --- Cart Logic ---
window.addToCart = function(productId, btnElement) {
    const product = allProducts.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    btnElement.innerHTML = '<i class="fa-solid fa-check"></i>';
    btnElement.classList.add('added');
    setTimeout(() => {
        btnElement.innerHTML = '<i class="fa-solid fa-plus"></i>';
        btnElement.classList.remove('added');
    }, 1500);

    updateCartUI();
    document.querySelector('.cart-btn').style.transform = 'scale(1.2)';
    setTimeout(() => { document.querySelector('.cart-btn').style.transform = ''; }, 200);
}

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

window.updateQuantity = function(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        updateCartUI();
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(el => {
        if(el.id === 'cart-header-count') el.textContent = `(${totalItems})`;
        else el.textContent = totalItems;
    });

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty. Start shopping!</div>';
        checkoutBtn.disabled = true;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">₹${Number(item.price).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div class="cart-item-controls">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const formattedSubtotal = `₹${subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    cartSubtotalEl.textContent = formattedSubtotal;
    cartTotalEl.textContent = formattedSubtotal;
    paymentAmountEl.textContent = formattedSubtotal;
}


// --- Event Listeners ---
function setupEventListeners() {
    // Nav Toggles
    cartToggleBtn.addEventListener('click', () => {
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    userSectionBtn.addEventListener('click', () => {
        if(!db.getCurrentUser()) {
            authOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
    
    logoutBtn.addEventListener('click', () => {
        db.logout();
        updateAuthUI();
        loadProducts(); // Re-render to hide admin controls
        alert('Logged out successfully');
    });

    adminPanelBtn.addEventListener('click', () => {
        adminOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Closers
    closeCartBtn.addEventListener('click', closeOverlays);
    closePaymentBtn.addEventListener('click', resetAndClosePayment);
    closeAuthBtn.addEventListener('click', closeOverlays);
    closeAdminBtn.addEventListener('click', closeOverlays);

    function closeOverlays() {
        cartOverlay.classList.remove('active');
        authOverlay.classList.remove('active');
        adminOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Checkout Flow
    checkoutBtn.addEventListener('click', () => {
        if(!db.getCurrentUser()) {
            alert("Please log in to place an order.");
            cartOverlay.classList.remove('active');
            authOverlay.classList.add('active');
            return;
        }
        cartOverlay.classList.remove('active');
        setTimeout(() => { paymentOverlay.classList.add('active'); }, 300);
    });

    // Payment Form
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnText = paySubmitBtn.querySelector('.btn-text');
        const spinner = paySubmitBtn.querySelector('.btn-spinner');
        
        btnText.style.display = 'none';
        spinner.style.display = 'inline-block';
        paySubmitBtn.disabled = true;

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        await db.createOrder(cart, subtotal);

        // Success State
        paymentBody.style.display = 'none';
        paymentSuccess.style.display = 'block';
        
        cart = [];
        updateCartUI();
        
        btnText.style.display = 'inline-block';
        spinner.style.display = 'none';
        paySubmitBtn.disabled = false;
        paymentForm.reset();
    });

    continueShoppingBtn.addEventListener('click', resetAndClosePayment);

    // Filter Buttons logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.textContent;
            let filtered = allProducts;
            if (category !== 'All') {
                filtered = allProducts.filter(p => p.category === category);
            }
            
            productGrid.style.opacity = '0';
            setTimeout(() => {
                renderProducts(filtered);
                productGrid.style.opacity = '1';
            }, 300);
        });
    });

    // Auth Forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    switchRegisterBtn.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
    
    switchLoginBtn.addEventListener('click', () => {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Admin Forms
    addProductForm.addEventListener('submit', handleAddProduct);
}

function resetAndClosePayment() {
    paymentOverlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        paymentBody.style.display = 'block';
        paymentSuccess.style.display = 'none';
    }, 400); 
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);

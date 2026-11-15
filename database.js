/**
 * Mock Database Implementation using localStorage
 */

class MockDatabase {
    constructor() {
        this.init();
    }

    init() {
        // Changed keys to _v2 to force reset with new Rupee prices and extended catalog
        if (!localStorage.getItem('users_v2')) {
            const adminHash = btoa('admin123'); // Simple mock hash
            localStorage.setItem('users_v2', JSON.stringify([
                { id: 1, username: 'admin', passwordHash: adminHash, role: 'Admin' }
            ]));
        }
        
        if (!localStorage.getItem('products_v2')) {
            const initialProducts = [
                // Smartphones
                { id: 1, name: "Quantum X Pro Smartphone 5G", price: 74999.00, image: "https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&q=80&w=600", description: "Latest 5G smartphone with an edge-to-edge OLED display.", category: "Smartphones" },
                { id: 2, name: "Nexus M2 Ultra", price: 112000.00, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600", description: "Flagship performance capturing pro-grade cinematic video.", category: "Smartphones" },
                { id: 3, name: "EcoPhone Lite", price: 18500.00, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600", description: "Budget-friendly smartphone with excellent battery life.", category: "Smartphones" },
                
                // Audio
                { id: 4, name: "AeroBeats Noise Cancelling Headphones", price: 21999.00, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600", description: "Immersive sound experience with industry-leading ANC.", category: "Audio" },
                { id: 5, name: "SonicBuds True Wireless Earbuds", price: 8499.00, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600", description: "Crystal clear audio in a compact, wireless design.", category: "Audio" },
                { id: 6, name: "BassMaster Bluetooth Speaker", price: 4999.00, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600", description: "Portable party speaker with 24-hour playback.", category: "Audio" },
                
                // Televisions
                { id: 7, name: "Lumina 4K Smart TV - 55\"", price: 58999.00, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600", description: "Experience ultra-high definition with built-in streaming apps.", category: "Televisions" },
                { id: 8, name: "NovaVision 8K OLED TV - 65\"", price: 145000.00, image: "https://images.unsplash.com/photo-1601366533287-5eeae763529b?auto=format&fit=crop&q=80&w=600", description: "The ultimate home theater experience with pure blacks.", category: "Televisions" },
                
                // Laptops & Computers
                { id: 9, name: "NovaBook Air 14\"", price: 92500.00, image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=600", description: "Ultrathin, lightweight laptop for extreme productivity.", category: "Laptops" },
                { id: 10, name: "Predator X Gaming Laptop", price: 135999.00, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600", description: "High-refresh rate display with dedicated RTX graphics.", category: "Laptops" },
                
                // Wearables
                { id: 11, name: "PulseFit Smartwatch V2", price: 15499.00, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=600", description: "Advanced health monitoring and GPS tracking.", category: "Wearables" },
                { id: 12, name: "ActivBand Fitness Tracker", price: 3499.00, image: "https://images.unsplash.com/photo-1557438159-51eecce89612?auto=format&fit=crop&q=80&w=600", description: "Step counter, heart rate monitor, and sleep tracking.", category: "Wearables" },
                
                // Cameras
                { id: 13, name: "Optix Pro DSLR Camera", price: 89999.00, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600", description: "Capture stunning moments with 45MP resolution.", category: "Cameras" },
                
                // Accessories
                { id: 14, name: "AeroCharge Wireless Pad", price: 2999.00, image: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&q=80&w=600", description: "Fast multi-device wireless charger with sleek glass design.", category: "Accessories" },
                { id: 15, name: "Titanium PowerBank 20000mAh", price: 2499.00, image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&q=80&w=600", description: "High-capacity power bank capable of charging laptops.", category: "Accessories" }
            ];
            localStorage.setItem('products_v2', JSON.stringify(initialProducts));
        }

        if (!localStorage.getItem('orders_v2')) {
            localStorage.setItem('orders_v2', JSON.stringify([]));
        }
    }

    // --- Users & Auth ---
    async login(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users_v2'));
                const user = users.find(u => u.username === username);
                if (user && user.passwordHash === btoa(password)) {
                    const token = btoa(JSON.stringify({ id: user.id, username: user.username, role: user.role }));
                    localStorage.setItem('authToken_v2', token);
                    resolve({ user: { id: user.id, username: user.username, role: user.role }, token });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 300);
        });
    }

    async register(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users_v2'));
                if (users.find(u => u.username === username)) {
                    reject(new Error('Username already exists'));
                } else {
                    const newUser = {
                        id: Date.now(),
                        username,
                        passwordHash: btoa(password),
                        role: 'User'
                    };
                    users.push(newUser);
                    localStorage.setItem('users_v2', JSON.stringify(users));
                    resolve({ message: 'User registered successfully' });
                }
            }, 300);
        });
    }

    getCurrentUser() {
        const token = localStorage.getItem('authToken_v2');
        if (token) {
            try {
                return JSON.parse(atob(token));
            } catch(e) {
                return null;
            }
        }
        return null;
    }

    logout() {
        localStorage.removeItem('authToken_v2');
    }

    // --- Products ---
    async getProducts() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(JSON.parse(localStorage.getItem('products_v2')));
            }, 200);
        });
    }

    async addProduct(productData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.getCurrentUser();
                if (!user || user.role !== 'Admin') {
                    reject(new Error('Unauthorized. Admin access required.'));
                    return;
                }
                const products = JSON.parse(localStorage.getItem('products_v2'));
                const newProduct = {
                    id: Date.now(),
                    ...productData
                };
                products.push(newProduct);
                localStorage.setItem('products_v2', JSON.stringify(products));
                resolve(newProduct);
            }, 300);
        });
    }

    async deleteProduct(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.getCurrentUser();
                if (!user || user.role !== 'Admin') {
                    reject(new Error('Unauthorized. Admin access required.'));
                    return;
                }
                let products = JSON.parse(localStorage.getItem('products_v2'));
                products = products.filter(p => p.id !== id);
                localStorage.setItem('products_v2', JSON.stringify(products));
                resolve();
            }, 300);
        });
    }

    // --- Orders ---
    async createOrder(cartItems, totalAmount) {
         return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.getCurrentUser();
                const orders = JSON.parse(localStorage.getItem('orders_v2'));
                const newOrder = {
                    id: Date.now(),
                    userId: user ? user.id : 'Guest',
                    items: cartItems,
                    totalAmount,
                    status: 'Processing',
                    date: new Date().toISOString()
                };
                orders.push(newOrder);
                localStorage.setItem('orders_v2', JSON.stringify(orders));
                resolve(newOrder);
            }, 500);
        });
    }
}

const db = new MockDatabase();

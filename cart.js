// Import notification function from operation.js (or define it here if needed)
function showNotification(message, type = 'success') {
    const existing = document.getElementById('notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        font-size: 14px;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    if (!document.getElementById('notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Function to update cart count in navbar
function updateCartCount(count) {
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        cartCountElement.textContent = String(count);
    }
    localStorage.setItem("cartCount", String(count));
}

// Global function to load cart (can be called from other pages)
window.loadCart = async function loadCart() {
    console.log('loadCart called');
    const userJson = localStorage.getItem('user');
    const emptyEl = document.getElementById('empty-cart');
    const listEl = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('cart-total-display');
    const summaryEl = document.getElementById('order-summary');

    if (!userJson) {
        console.log('No user found in localStorage');
        if (emptyEl) emptyEl.style.display = 'block';
        if (listEl) listEl.innerHTML = '';
        if (summaryEl) summaryEl.style.display = 'none';
        return;
    }

    const user = JSON.parse(userJson);

    try {
        const response = await fetch(`http://localhost:3000/cart?email=${encodeURIComponent(user.email)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to load cart (${response.status})`);
        }

        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];

        if (items.length === 0) {
            if (emptyEl) emptyEl.style.display = 'block';
            if (listEl) {
                listEl.innerHTML = '';
                listEl.style.display = 'none';
            }
            if (summaryEl) summaryEl.style.display = 'none';
            updateCartCount(0);
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';
        if (listEl) listEl.style.display = 'block';
        if (summaryEl) summaryEl.style.display = 'block';

        const html = items.map((item) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 1;

            return `
            <div class="cart-item" data-item-id="${item.id}">
                <img src="${item.img || ''}" alt="${item.name || 'Product'}" onerror="this.src='./images/banners/orginal/empty-cart.png'" />
                <div class="item-details">
                    <h3>${item.name || 'Unnamed Product'}</h3>
                    <p>Size: ${item.size || 'Standard'}</p>
                    <div class="item-price">₹${price}</div>
                </div>
                <div class="item-actions">
                    <div class="quantity-controls" data-id="${item.id}">
                        <button class="qty-btn qty-decrease">-</button>
                        <span class="qty-display">${qty}</span>
                        <button class="qty-btn qty-increase">+</button>
                    </div>
                    <button class="remove-btn" data-id="${item.id}">Remove</button>
                </div>
            </div>`;
        }).join('');

        if (listEl) listEl.innerHTML = html;

        const grandTotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);

        if (subtotalEl) subtotalEl.textContent = `₹${grandTotal}`;
        if (totalEl) totalEl.textContent = `₹${grandTotal}`;

        // Update cart count cache
        const totalCount = items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
        updateCartCount(totalCount);

    } catch (err) {
        console.error('Load cart error:', err);
        showNotification('Failed to load cart: ' + err.message, 'error');
        if (emptyEl) emptyEl.style.display = 'block';
        if (listEl) listEl.style.display = 'none';
        if (summaryEl) summaryEl.style.display = 'none';
        updateCartCount(0);
    }
}

// Event delegation for qty controls
document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('cart-items');
    if (listEl) {
        listEl.addEventListener('click', async (evt) => {
            const target = evt.target;

            // Handle remove button click
            if (target.classList.contains('remove-btn')) {
                const id = target.getAttribute('data-id');
                if (!id) return;
                await handleCartAction(id, 'remove', target);
                return;
            }

            // Handle quantity buttons
            const control = target.closest('.quantity-controls');
            if (!control) return;

            const id = control.getAttribute('data-id');
            if (!id) return;

            const isInc = target.classList.contains('qty-increase');
            const isDec = target.classList.contains('qty-decrease');

            if (isInc || isDec) {
                await handleCartAction(id, isInc ? 'increase' : 'decrease', target);
            }
        });
    }

    // Load cart when page loads
    loadCart();
});

async function handleCartAction(id, action, targetElement) {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
        showNotification('Please login to update cart', 'error');
        return;
    }

    // Disable button to prevent double clicks
    targetElement.disabled = true;
    const originalText = targetElement.textContent;
    if (action !== 'remove') targetElement.textContent = '...';

    try {
        const email = JSON.parse(userJson).email;
        let url = 'http://localhost:3000/cart/update';
        let body = { email, id: String(id) };

        if (action === 'remove') {
            url = 'http://localhost:3000/cart/remove';
        } else {
            body.delta = action === 'increase' ? 1 : -1;
        }

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok) {
            showNotification(data.message || 'Failed to update cart', 'error');
        } else {
            if (action === 'remove') showNotification('Item removed', 'success');
            await loadCart();
        }
    } catch (e) {
        console.error('Cart action error', e);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        targetElement.disabled = false;
        if (action !== 'remove') targetElement.textContent = originalText;
    }
}


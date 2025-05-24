// Add this at the very top of your cart-script.js file
const API_BASE_URL = 'https://metro-auto-parts-api.onrender.com'; // Your backend API base URL

// --- Shopping Cart State (Persisted with localStorage) ---
// Initialize shoppingCart by trying to load it from localStorage
let shoppingCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

// Function to save the shopping cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
}

// --- Functions to Manage Cart Display ---

// Function to update the display of the shopping cart on cart.html
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');

    if (!cartItemsContainer || !cartTotalElement) {
        console.error("Cart display elements not found. Make sure you are on cart.html.");
        return;
    }

    cartItemsContainer.innerHTML = ''; // Clear previous items

    let total = 0;

    if (shoppingCart.length === 0) {
        cartItemsContainer.innerHTML = '<li>Your cart is empty.</li>';
    } else {
        shoppingCart.forEach(item => {
            const itemPrice = item.price * item.quantity;
            total += itemPrice;

            const listItem = document.createElement('li');
            listItem.classList.add('cart-item');
            listItem.innerHTML = `
                <span>${item.name} - $${item.price.toFixed(2)} x </span>
                <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', this.value)">
                <span> = $${itemPrice.toFixed(2)}</span>
                <button class="secondary" onclick="removeFromCart('${item.id}')">Remove</button>
            `;
            cartItemsContainer.appendChild(listItem);
        });
    }

    cartTotalElement.textContent = total.toFixed(2);
}

// Function to update item quantity in the cart
function updateQuantity(partId, newQuantity) {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity <= 0) {
        alert('Quantity must be a positive number.');
        updateCartDisplay(); // Revert to previous valid display
        return;
    }

    const itemIndex = shoppingCart.findIndex(item => item.id === partId);
    if (itemIndex > -1) {
        shoppingCart[itemIndex].quantity = quantity;
        saveCartToLocalStorage();
        updateCartDisplay();
    }
}

// Function to remove an item from the cart
function removeFromCart(partId) {
    shoppingCart = shoppingCart.filter(item => item.id !== partId);
    saveCartToLocalStorage();
    updateCartDisplay();
}

// Function for checkout (placeholder for now)
function checkout() {
    if (shoppingCart.length === 0) {
        alert('Your cart is empty. Add some items before checking out.');
        return;
    }
    alert('Proceeding to checkout! (This is a placeholder action)');
    // In a real application, you would send this cart data to your backend for order processing.
    // shoppingCart = []; // Clear cart after successful checkout
    // saveCartToLocalStorage();
    // updateCartDisplay();
}

// --- Initialize the Cart Page ---
document.addEventListener('DOMContentLoaded', () => {
    // Only run cart display functions if on cart.html
    if (document.getElementById('cartItems') && document.getElementById('cartTotal')) {
        updateCartDisplay();

        // Attach event listener for the Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', checkout);
        }
    }
});
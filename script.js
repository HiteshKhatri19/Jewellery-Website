// --- UTILITY FUNCTIONS ---

// Function to update the cart count display across all pages
function updateCartCount(cartData) {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        // Recalculate total items
        const totalItems = (cartData || JSON.parse(localStorage.getItem('jewelleryCart')) || []).reduce((sum, item) => sum + item.quantity, 0);
        countElement.textContent = totalItems;
    }
}


// Function to clear all items from the cart (used after checkout or 'Empty Cart' button)
function clearCart() {
    // 1. Remove the 'jewelleryCart' key from localStorage
    localStorage.removeItem('jewelleryCart');

    // 2. Update the header count to reflect zero items
    updateCartCount();

    // 3. (If on the cart page) Re-render the cart display to show the empty message
    if (document.querySelector('.cart-page-container')) {
        renderCart();
    }
    
    alert('Your cart has been successfully emptied.');
}


// --- HOMEPAGE/PRODUCT LISTING PAGE LOGIC ---

// Function for quick Add to Cart from the Homepage/Product Listing
function addToCartQuick(productId, productName, price) {
    // Note: We use a default quantity of 1 and assume no size/options were selected.

    let cart = JSON.parse(localStorage.getItem('jewelleryCart')) || [];
    
    // Create a unique ID for the item (since no size is selected)
    const uniqueId = productId + '-default'; 
    
    // Check if item already exists
    const existingItem = cart.find(item => item.id === uniqueId);

    if (existingItem) {
        existingItem.quantity += 1; // Increment quantity if it exists
    } else {
        // Add new item if it doesn't exist
        cart.push({ 
            id: uniqueId, 
            name: productName, 
            price: price, 
            quantity: 1, 
            size: 'N/A (Quick Add)' 
        });
    }

    // Save the updated cart
    localStorage.setItem('jewelleryCart', JSON.stringify(cart));

    // Provide feedback and update cart count
    alert(`${productName} added to cart!`);
    updateCartCount(cart);
}


// --- PRODUCT DETAIL PAGE (PDP) LOGIC (Requires a PDP HTML file) ---

// Function to handle quantity change
function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    let currentQuantity = parseInt(quantityInput.value);
    
    // Ensure quantity doesn't go below 1
    let newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
        quantityInput.value = newQuantity;
    }
}

// Function to handle image change (placeholder for PDP)
function changeImage(thumbId) {
    const mainImg = document.getElementById('main-product-img');
    // Placeholder logic for changing main image based on thumbnail click
    // if (thumbId === 'img1') { mainImg.src = 'placeholder-ring-thumb1.jpg'; }
}

// CORE E-COMMERCE LOGIC: Add to Cart from PDP
// We check if the form exists before adding the listener to avoid errors on other pages
const form = document.getElementById('add-to-cart-form');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Stop the form from reloading the page

        const btn = document.getElementById('add-to-cart-btn');
        const productId = btn.getAttribute('data-id');
        const productName = btn.getAttribute('data-name');
        const price = parseFloat(btn.getAttribute('data-price'));
        const quantity = parseInt(document.getElementById('quantity').value);
        const size = document.getElementById('ring-size').value;

        if (!size) {
            alert('Please select a size before adding to cart.');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('jewelleryCart')) || [];
        const uniqueId = productId + '-' + size; 

        // Check for duplicates (if item with same ID and size exists, update quantity)
        const existingItem = cart.find(item => item.id === uniqueId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            // Add new item 
            cart.push({
                id: uniqueId, 
                name: productName,
                price: price,
                quantity: quantity,
                size: size
            });
        }
        
        localStorage.setItem('jewelleryCart', JSON.stringify(cart));
        alert(`${quantity}x ${productName} (Size ${size}) added to cart!`);
        updateCartCount(cart);
    });
}


// --- CART PAGE LOGIC (Requires a cart.html file) ---

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('jewelleryCart')) || [];
    const tbody = document.getElementById('cart-table-body');
    const emptyMsg = document.getElementById('empty-cart-message');
    
    if (!tbody) return; // Exit if not on the cart page

    // Clear previous rows
    tbody.innerHTML = '';
    
    let subtotal = 0;

    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    } else {
        if (emptyMsg) emptyMsg.style.display = 'none';
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.size}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${itemTotal.toFixed(2)}</td>
            <td>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">X</button>
            </td>
        `;
    });

    // Update totals
    const subtotalElement = document.getElementById('cart-subtotal');
    const grandTotalElement = document.getElementById('cart-grand-total');

    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (grandTotalElement) grandTotalElement.textContent = `$${subtotal.toFixed(2)}`;
    
    // Update the header cart count again
    updateCartCount(cart);
}


function removeFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem('jewelleryCart')) || [];
    
    // Filter the cart to keep items whose ID does NOT match the itemId
    cart = cart.filter(item => item.id !== itemId);
    
    // Save the updated cart
    localStorage.setItem('jewelleryCart', JSON.stringify(cart));
    
    // Re-render the cart table and update the header count
    renderCart();
    updateCartCount(cart);
}


// --- INITIALIZATION ---

// Initialize the count when the page loads
updateCartCount();

// Check if we are on the cart page and render the cart when the page loads
if (document.querySelector('.cart-page-container')) {
    renderCart();
}
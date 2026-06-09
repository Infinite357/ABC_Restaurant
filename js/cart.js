const cartDiv = document.getElementById("cart");
const subtotalElement = document.getElementById("subtotal");
const caloriesElement = document.getElementById("calories");

function loadCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function displayCart() {
    const cart = loadCart();

    cartDiv.innerHTML = "";

    let subtotal = 0;
    let calories = 0;

    if (cart.length === 0) {
        cartDiv.innerHTML = "<p>Your cart is empty.</p>";
        subtotalElement.textContent = "Subtotal: $0.00";
        caloriesElement.textContent = "Calories: 0";
        return;
    }

    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];

        subtotal += item.price * item.quantity;
        calories += item.calories * item.quantity;

        cartDiv.innerHTML += `
    <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-img">

        <h3>${item.name}</h3>
        <p>Quantity: ${item.quantity}</p>
        <p>Price: $${item.price.toFixed(2)}</p>
        <p>Calories: ${item.calories}</p>

        <button class="submit-button" onclick="removeOneItem(${i})">
            Remove One
        </button>

        <button class="submit-button" onclick="removeItem(${i})">
            Remove Item
        </button>
    </div>
`;

    }

    subtotalElement.textContent = "Subtotal: $" + subtotal.toFixed(2);
    caloriesElement.textContent = "Calories: " + calories;
}

function removeOneItem(index) {
    const cart = loadCart();

    cart[index].quantity--;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart(cart);
    displayCart();
}

function removeItem(index) {
    const cart = loadCart();

    cart.splice(index, 1);

    saveCart(cart);
    displayCart();
}

function clearCart() {
    localStorage.removeItem("cart");
    displayCart();
}

displayCart();
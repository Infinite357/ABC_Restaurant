// Get references to cart page elements
const cartDiv = document.getElementById("cart");
const subtotalElement = document.getElementById("subtotal");
const caloriesElement = document.getElementById("calories");
const taxElement = document.getElementById("tax");
const totalElement = document.getElementById("total");

// Loads the cart from localStorage
// If there is no cart yet, return an empty array
function loadCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

// Saves the updated cart back into localStorage
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Displays cart items, subtotal, calories, tax, and total
function displayCart() {
    const cart = loadCart();

    // Clear the cart display before rebuilding it
    cartDiv.innerHTML = "";

    let subtotal = 0;
    let calories = 0;
    let tax = 0;
    let total = 0;

    // If the cart is empty, show empty cart message and reset totals
    if (cart.length === 0) {
        cartDiv.innerHTML = "<p>Your cart is empty.</p>";
        subtotalElement.textContent = " $0.00";
        caloriesElement.textContent = "0 kcal";
        taxElement.textContent = "$0.00";
        totalElement.textContent = "$0.00";
        return;
    }

    // Loop through each cart item and display it
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];

        // Add each item's price and calories to the running totals
        subtotal += item.price * item.quantity;
        calories += item.calories * item.quantity;

        // Calculate tax and final total
        tax = subtotal * 0.0887;
        total = subtotal + tax;

        // Add this item to the cart page
        cartDiv.innerHTML += `
        <div class="cart-item">
            <table style="width:100%;">
                <tr>
                    <td align="left" style="width:220px;">
                        <img src="${item.image}" alt="${item.name}" class="cart-img">
                    </td>

                    <td align="left" style="width:500px;">
                        <h3>${item.name}</h3>
                    </td>

                    <td align="left" style="width:220px;">
                        <p>Quantity: ${item.quantity}</p>
                        <p>Price: $${item.price.toFixed(2)}</p>
                        <p>Calories: ${item.calories}</p>
                    </td>

                    <td align="right">
                        <button class="submit-button" onclick="removeOneItem(${i})">
                            - Remove One
                        </button>

                        <button class="submit-button" onclick="removeItem(${i})">
                            - Remove Item
                        </button>
                    </td>
                </tr>
            </table>
        </div> 
        `;
    }

    // Display final totals on the cart page
    subtotalElement.textContent = "$" + subtotal.toFixed(2);
    caloriesElement.textContent = calories + " kcal";
    taxElement.textContent = "$" + tax.toFixed(2);
    totalElement.textContent = "$" + total.toFixed(2);
}

// Removes one quantity of an item from the cart
function removeOneItem(index) {
    const cart = loadCart();

    cart[index].quantity--;

    // If quantity reaches zero, remove the item completely
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart(cart);
    displayCart();
}

// Removes an item completely from the cart
function removeItem(index) {
    const cart = loadCart();

    cart.splice(index, 1);

    saveCart(cart);
    displayCart();
}

// Clears the entire cart
function clearCart() {
    localStorage.removeItem("cart");
    displayCart();
}

// Prevents users from checking out with an empty cart
function canPay() {
    const cart = JSON.parse(localStorage.getItem("cart"));

    if (cart === null || cart.length === 0) {
        const cartMessage = document.getElementById("cartMessage");

        console.log("Cart is Empty, Cannot Checkout.");

        cartMessage.textContent = "Cart is Empty, Cannot Proceed to Checkout!!";

        setTimeout(function() {
            cartMessage.textContent = "";
        }, 2000);

        return false;
    } else {
        return true;
    }
}

// Display the cart as soon as cart.js loads
displayCart();
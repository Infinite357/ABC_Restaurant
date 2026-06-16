const cartDiv = document.getElementById("cart");
const subtotalElement = document.getElementById("subtotal");
const caloriesElement = document.getElementById("calories");
const taxElement = document.getElementById("tax");
const totalElement = document.getElementById("total");

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
    let tax = 0;
    let total = 0;

    if (cart.length === 0) {
        cartDiv.innerHTML = "<p>Your cart is empty.</p>";
        subtotalElement.textContent = " $0.00";
        caloriesElement.textContent = "0 kcal";
        taxElement.textContent = "$0.00";
        totalElement.textContent = "$0.00";
        return;
    }

    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];

        subtotal += item.price * item.quantity;
        calories += item.calories * item.quantity;
        tax = subtotal * 0.0887;
        total = subtotal + (subtotal * 0.0887);

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

    subtotalElement.textContent = "$" + subtotal.toFixed(2);
    caloriesElement.textContent = calories + " kcal";
    taxElement.textContent = "$" + tax.toFixed(2);
    totalElement.textContent = "$" + total.toFixed(2);

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

function canPay()
    {
      const cart = JSON.parse(localStorage.getItem("cart"));
      if (cart === null || cart.length === 0)
      {
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

displayCart();
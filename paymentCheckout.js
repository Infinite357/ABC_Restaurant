document.addEventListener("DOMContentLoaded", function () {

    // Create payment page content
    const paymentSection = document.createElement("div");
    paymentSection.className = "section";

    paymentSection.innerHTML = `
        <h2>Checkout / Payment</h2>

        <p id="pickupEstimate">Estimated Pickup Time: Calculating...</p>

        <form id="paymentForm">
            <input id="customerName" type="text" placeholder="Customer Name" required>
            <br><br>

            <input id="customerPhone" type="tel" placeholder="Phone Number" required>
            <br><br>

            <input id="cardNumber" type="text" placeholder="Credit Card Number" required>
            <p>Card Type: <span id="cardTypeText">Unknown</span></p>

            <input id="expiration" type="text" placeholder="MM/YY" maxlength="5" required>
            <br><br>

            <input id="cvv" type="text" placeholder="CVV" maxlength="3" required>
            <br><br>

            <button type="submit">Place Order</button>
        </form>

        <p id="orderMessage"></p>
    `;

    document.body.appendChild(paymentSection);

    const cardNumberInput = document.getElementById("cardNumber");
    const cardTypeText = document.getElementById("cardTypeText");
    const pickupEstimate = document.getElementById("pickupEstimate");
    const orderMessage = document.getElementById("orderMessage");
    const paymentForm = document.getElementById("paymentForm");

    function detectCardType(cardNumber) {
        const number = cardNumber.replace(/\D/g, "");

        if (/^4/.test(number)) return "Visa";
        if (/^(5[1-5]|2[2-7])/.test(number)) return "Mastercard";
        if (/^3[47]/.test(number)) return "American Express";
        if (/^6(?:011|5)/.test(number)) return "Discover";

        return "Unknown";
    }

    function calculatePickupTime() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        let totalItems = 0;

        cart.forEach(function (item) {
            totalItems += item.quantity || 1;
        });

        let prepMinutes;

        if (totalItems <= 3) {
            prepMinutes = 15;
        } else if (totalItems <= 6) {
            prepMinutes = 25;
        } else if (totalItems <= 10) {
            prepMinutes = 35;
        } else {
            prepMinutes = 50;
        }

        const pickupTime = new Date();
        pickupTime.setMinutes(pickupTime.getMinutes() + prepMinutes);

        return {
            prepMinutes: prepMinutes,
            pickupTime: pickupTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        };
    }

    function validatePaymentInfo() {
        const cardNumber = cardNumberInput.value.replace(/\D/g, "");
        const expiration = document.getElementById("expiration").value.trim();
        const cvv = document.getElementById("cvv").value.trim();
        const cardType = detectCardType(cardNumber);

        if (cardType === "Unknown") {
            return "Enter a valid Visa, Mastercard, American Express, or Discover card.";
        }

        if (cardType === "American Express" && cardNumber.length !== 15) {
            return "American Express cards must have 15 digits.";
        }

        if (cardType !== "American Express" && cardNumber.length !== 16) {
            return "Card number must have 16 digits.";
        }

        if (!/^\d{2}\/\d{2}$/.test(expiration)) {
            return "Expiration date must be in MM/YY format.";
        }

        const parts = expiration.split("/");
        const month = parseInt(parts[0]);
        const year = parseInt("20" + parts[1]);

        if (month < 1 || month > 12) {
            return "Expiration month must be between 01 and 12.";
        }

        const today = new Date();
        const expirationDate = new Date(year, month);

        if (expirationDate <= today) {
            return "Credit card has expired.";
        }

        if (!/^\d{3}$/.test(cvv)) {
            return "CVV must be exactly 3 digits.";
        }

        return "";
    }

    const estimate = calculatePickupTime();

    pickupEstimate.textContent =
        "Estimated Pickup Time: " +
        estimate.pickupTime +
        " (" +
        estimate.prepMinutes +
        " minutes)";

    cardNumberInput.addEventListener("input", function () {
        cardTypeText.textContent = detectCardType(cardNumberInput.value);
    });

    document.getElementById("expiration").addEventListener("input", function (event) {
        let value = event.target.value.replace(/\D/g, "").substring(0, 4);

        if (value.length > 2) {
            value = value.substring(0, 2) + "/" + value.substring(2);
        }

        event.target.value = value;
    });

    paymentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const error = validatePaymentInfo();

        if (error) {
            orderMessage.textContent = error;
            orderMessage.style.color = "red";
            return;
        }

        const finalEstimate = calculatePickupTime();

        const order = {
            customerName: document.getElementById("customerName").value,
            customerPhone: document.getElementById("customerPhone").value,
            cardType: cardTypeText.textContent,
            pickupTime: finalEstimate.pickupTime,
            prepMinutes: finalEstimate.prepMinutes,
            orderDate: new Date().toLocaleString()
        };

        const orders = JSON.parse(localStorage.getItem("orders")) || [];
        orders.push(order);

        localStorage.setItem("orders", JSON.stringify(orders));

        orderMessage.textContent =
            "Order placed successfully! Estimated pickup time: " +
            finalEstimate.pickupTime;

        orderMessage.style.color = "lightgreen";

        paymentForm.reset();
        cardTypeText.textContent = "Unknown";
    });

});

// Wait until the HTML page has fully loaded before running this script
document.addEventListener("DOMContentLoaded", function () {

    // Create a new section on the payment page for checkout information
    const paymentSection = document.createElement("div");
    paymentSection.className = "section";

    // Add pickup estimate and order message placeholders to the page
    paymentSection.innerHTML = `
        <h2>Checkout / Payment</h2>

        <p id="pickupEstimate">Estimated Pickup Time: Calculating...</p>

        <p id="orderMessage"></p>
    `;

    // Add the new payment section to the page
    document.body.appendChild(paymentSection);

    // Get references to important payment page elements
    const cardNumberInput = document.getElementById("cardNumber");
    const cardTypeText = document.getElementById("cardTypeText");
    const pickupEstimate = document.getElementById("pickupEstimate");
    const orderMessage = document.getElementById("orderMessage");
    const paymentForm = document.getElementById("paymentForm");

    // Determines the credit card type based on the starting digits
    function detectCardType(cardNumber) {
        const number = cardNumber.replace(/\D/g, "");

        if (/^4/.test(number)) return "Visa";
        if (/^(5[1-5]|2[2-7])/.test(number)) return "Mastercard";
        if (/^3[47]/.test(number)) return "American Express";
        if (/^6(?:011|5)/.test(number)) return "Discover";

        return "Unknown";
    }

    // Calculates estimated pickup time based on total number of cart items
    function calculatePickupTime() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        let totalItems = 0;

        // Add up all item quantities in the cart
        cart.forEach(function (item) {
            totalItems += item.quantity || 1;
        });

        let prepMinutes;

        // Assign preparation time based on order size
        if (totalItems <= 3) {
            prepMinutes = 15;
        } else if (totalItems <= 6) {
            prepMinutes = 25;
        } else if (totalItems <= 10) {
            prepMinutes = 35;
        } else {
            prepMinutes = 50;
        }

        // Add prep time to the current time
        const pickupTime = new Date();
        pickupTime.setMinutes(pickupTime.getMinutes() + prepMinutes);

        // Return both the wait time and formatted pickup time
        return {
            prepMinutes: prepMinutes,
            pickupTime: pickupTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        };
    }

    // Performs client-side payment validation
    // Server-side validation should still be used in index.js
    function validatePaymentInfo() {
        const cardNumber = cardNumberInput.value.replace(/\D/g, "");
        const expiration = document.getElementById("expiration").value.trim();
        const cvv = document.getElementById("cvv").value.trim();
        const cardType = detectCardType(cardNumber);

        // Reject unknown card types
        if (cardType === "Unknown") {
            return "Enter a valid Visa, Mastercard, American Express, or Discover card.";
        }

        // American Express cards use 15 digits
        if (cardType === "American Express" && cardNumber.length !== 15) {
            return "American Express cards must have 15 digits.";
        }

        // Most other supported cards use 16 digits
        if (cardType !== "American Express" && cardNumber.length !== 16) {
            return "Card number must have 16 digits.";
        }

        // Expiration must match MM/YY format
        if (!/^\d{2}\/\d{2}$/.test(expiration)) {
            return "Expiration date must be in MM/YY format.";
        }

        // Split expiration date into month and year
        const parts = expiration.split("/");
        const month = parseInt(parts[0]);
        const year = parseInt("20" + parts[1]);

        // Validate expiration month
        if (month < 1 || month > 12) {
            return "Expiration month must be between 01 and 12.";
        }

        // Check whether the card is expired
        const today = new Date();
        const expirationDate = new Date(year, month);

        if (expirationDate <= today) {
            return "Credit card has expired.";
        }

        // CVV must be exactly 3 digits in this frontend validation
        if (!/^\d{3}$/.test(cvv)) {
            return "CVV must be exactly 3 digits.";
        }

        // Empty string means no validation error
        return "";
    }

    // Calculate and display pickup estimate when the page loads
    const estimate = calculatePickupTime();

    pickupEstimate.textContent =
        "Estimated Pickup Time: " +
        estimate.pickupTime +
        " (" +
        estimate.prepMinutes +
        " minutes)";

    // Automatically formats expiration input from 1230 into 12/30
    document.getElementById("expiration").addEventListener("input", function(event) {
        let value = event.target.value.replace(/\D/g, "").substring(0, 4);

        if (value.length > 2) {
            value = value.substring(0, 2) + "/" + value.substring(2);
        }

        event.target.value = value;
    });
});
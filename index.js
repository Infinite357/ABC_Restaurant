// Import Node.js built-in modules
// http lets us create the web server
// fs lets us read files such as HTML, JS, images, and JSON
const http = require("http");
const fs = require("fs");

// Server will run locally on port 3000
const port = 3000;

// Create the HTTP server
const server = http.createServer();

// Import Nodemailer so the server can send receipt emails
const nodemailer = require("nodemailer");

// Load environment variables from .env
// This is used for private information like email username/password
require("dotenv").config();


// Main request handler for all incoming browser requests
server.on("request", function(req, res) {
    console.log("Request for " + req.url);

    // Home page route
    // Serves the main restaurant dashboard page
    if (req.url === "/") {
        fs.readFile("./html/main.html", function(err, data) {
            if (err) {
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.end("Server error.");
                return;
            }

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
        });
    }

        // Protein category pages
        // If the URL is /chicken, /pork, /beef, or /seafood,
    // serve the matching HTML page from the html folder
    else if (["chicken", "pork", "beef", "seafood"].includes(req.url.substring(1))) {
        const protein = req.url.substring(1);

        fs.readFile(`./html/${protein}.html`, function(err, data) {
            if (err) {
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.end("Server error");
                return;
            }

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
        });
    }

    // Serves the payment checkout JavaScript file
    else if (req.url === "/js/paymentCheckout.js") {
        fs.readFile("./js/paymentCheckout.js", function(err, data) {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("JavaScript file not found.");
                return;
            }

            res.writeHead(200, {"Content-Type": "application/javascript"});
            res.end(data);
        });
    }

        // Payment page route
    // Reads payment.html and inserts the payment summary placeholder
    else if (req.url === "/payment") {
        fs.readFile("./html/payment.html", "utf8", function(err, data) {
            if (err) {
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.end("Server error.");
                return;
            }

            // Creates placeholder subtotal, tax, and total elements
            // The browser later fills these using localStorage cart data
            const updatedHTML = calculatePayment();

            // Replace placeholder comment in payment.html
            const updatedPage = data.replace("<!-- PAYMENT_SUMMARY -->", updatedHTML);

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(updatedPage);
        });
    }

        // Individual credit card image routes
    // These are used by the payment page to display the detected card type
    else if (req.url === "/images/visa.png") {
        fs.readFile("./images/visa.png", function(err, data) {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("Visa image not found.");
                return;
            }

            res.writeHead(200, {"Content-Type": "image/png"});
            res.end(data);
        });
    }

    else if (req.url === "/images/mastercard.png") {
        fs.readFile("./images/mastercard.png", function(err, data) {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("Mastercard image not found.");
                return;
            }

            res.writeHead(200, {"Content-Type": "image/png"});
            res.end(data);
        });
    }

    else if (req.url === "/images/amex.png") {
        fs.readFile("./images/amex.png", function(err, data) {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("American Express image not found.");
                return;
            }

            res.writeHead(200, {"Content-Type": "image/png"});
            res.end(data);
        });
    }

    else if (req.url === "/images/discover.png") {
        fs.readFile("./images/discover.png", function(err, data) {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("Discover image not found.");
                return;
            }

            res.writeHead(200, {"Content-Type": "image/png"});
            res.end(data);
        });
    }

        // Payment validation route
    // This receives the submitted payment form using POST
    else if (req.url === "/validate-payment" && req.method === "POST") {
        let body = "";

        // Collect chunks of POST form data
        req.on("data", function(chunk) {
            body += chunk;
        });

        // Once all form data is received, process it
        req.on("end", function() {
            const formData = new URLSearchParams(body);

            // Cart data is sent from localStorage through a hidden form input
            const cartData = formData.get("cartData");
            const cart = JSON.parse(cartData || "[]");

            // Read payment form fields
            const cardNumber = formData.get("cardNumber");
            const expiration = formData.get("expiration");
            const cvv = formData.get("cvv");
            const email = formData.get("email");

            // Validate payment information on the server
            const paymentResult =
                validatePayment(cardNumber, expiration, cvv, email);

            // If payment is accepted, send the email receipt
            if (paymentResult === "Payment accepted.") {
                sendReceiptEmail(email, cart, function(err) {
                    if (err) {
                        res.writeHead(500, {"Content-Type": "text/html"});
                        res.end("<h1>Payment accepted, but receipt email failed.</h1>");
                        return;
                    }

                    // Redirect to success page after email sends
                    res.writeHead(302, {
                        "Location": "/success"
                    });
                    res.end();
                });
            }

            // If validation fails, show an error page
            else {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(`
                <h1>Payment Failed</h1>
                <p>${paymentResult}</p>
                <p><a href="/cart">Try Again</a></p>
            `);
            }
        });
    }

        // Success page route
    // Shown after successful payment and receipt email
    else if (req.url === "/success") {
        fs.readFile("./html/success.html", function(err, data) {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("Success page not found.");
                return;
            }

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
        });
    }

        // Cart JavaScript route
    // Serves the file that displays/removes/clears cart items
    else if (req.url === "/js/cart.js") {
        fs.readFile("./js/cart.js", function(err, data) {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("Cart JS not found.");
                return;
            }

            res.writeHead(200, {"Content-Type": "application/javascript"});
            res.end(data);
        });
    }

        // Cart page route
    // Displays the user's current cart from localStorage
    else if (req.url === "/cart") {
        fs.readFile("./html/cart.html", function(err, data) {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("Cart page not found.");
                return;
            }

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
        });
    }

    // Banner image route
    else if (req.url === "/images/banner.png") {
        fs.readFile("./images/banner.png", function(err, data) {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("Image not found.");
                return;
            }

            res.writeHead(200, {"Content-Type": "image/png"});
            res.end(data);
        });
    }

        // Menu JSON route
    // The frontend fetches this file to dynamically display menu items
    else if (req.url === "/menu.json") {
        fs.readFile("./menu.json", "utf8", function(err, data) {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("Menu not found.");
                return;
            }

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(data);
        });
    }

        // Search route
    // Reads the search term from the query string and serves search.html
    else if (req.url.startsWith("/search")) {
        const urlParts = req.url.split("?");
        const queryString = urlParts[1] || "";
        const params = new URLSearchParams(queryString);
        const searchTerm = params.get("item") || "";

        fs.readFile("./html/search.html", "utf8", function(err, data) {
            if (err) {
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.end("Server error.");
                return;
            }

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
        });
    }

        // Generic image route
    // Handles any image inside the images folder without needing a separate route for each one
    else if (req.url.startsWith("/images/")) {
        const filePath = "." + req.url;

        // Determine file extension so the correct content type can be returned
        const extension = req.url.substring(req.url.lastIndexOf(".") + 1).toLowerCase();

        let contentType = "application/octet-stream";

        if (extension === "jpg" || extension === "jpeg") contentType = "image/jpeg";
        else if (extension === "png") contentType = "image/png";
        else if (extension === "webp") contentType = "image/webp";
        else if (extension === "gif") contentType = "image/gif";

        fs.readFile(filePath, function(err, data) {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("Image not found.");
                return;
            }

            res.writeHead(200, {"Content-Type": contentType});
            res.end(data);
        });
    }

    // Fallback route for unknown pages
    else {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("Page not found.");
    }
});


// Creates placeholder payment summary elements
// The actual values are filled in by browser JavaScript using the cart from localStorage
function calculatePayment() {
    return `
        <p id="paymentSubtotal">Subtotal: $0.00</p>
        <p id="paymentTax">Tax: $0.00</p>
        <p><strong id="paymentTotal">Total: $0.00</strong></p>
    `;
}


// Validates payment information submitted by the user
// Returns a success or failure message
function validatePayment(cardNumber, expiration, cvv, email) {
    // Remove spaces from the card number before validation
    cardNumber = cardNumber.replaceAll(" ", "");

    // Card number must be 15 or 16 digits
    if (cardNumber.length !== 16 && cardNumber.length !== 15) {
        return "Payment declined: card number must be 15 or 16 digits.";
    }

    // Card number must contain only numbers
    if (isNaN(cardNumber)) {
        return "Payment declined: card number must contain only numbers.";
    }

    // Expiration must be in MM/YY format
    if (expiration.length !== 5 || expiration.charAt(2) !== "/") {
        return "Payment declined: expiration must be in MM/YY format.";
    }

    // Extract month and year from expiration date
    let month = Number(expiration.substring(0, 2));
    let year = Number(expiration.substring(3, 5));

    // Validate month
    if (month < 1 || month > 12) {
        return "Payment declined: invalid expiration month.";
    }

    // Simple expiration year check
    if (year < 26) {
        return "Payment declined: card is expired.";
    }

    // CVV must be 3 or 4 digits
    if (cvv.length !== 3 && cvv.length !== 4) {
        return "Payment declined: CVV must be 3 or 4 digits.";
    }

    // CVV must contain only numbers
    if (isNaN(cvv)) {
        return "Payment declined: CVV must contain only numbers.";
    }

    // Basic email validation
    if (!email || !email.includes("@") || !email.includes(".")) {
        return "Payment declined: invalid email address.";
    }

    return "Payment accepted.";
}


// Configure Nodemailer transporter
// Uses Gmail credentials stored in the .env file
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// Sends the receipt email after successful payment validation
function sendReceiptEmail(email, cart, callback) {
    let subtotal = 0;

    // Calculate subtotal from cart item prices and quantities
    for (let i = 0; i < cart.length; i++) {
        subtotal += cart[i].price * cart[i].quantity;
    }

    // Calculate tax and final total
    const tax = subtotal * 0.08875;
    const total = subtotal + tax;

    // Generate a random receipt number
    const receiptID = Math.floor(Math.random() * 10000000);

    // Build the HTML rows for each ordered item
    let itemRows = "";

    for (let i = 0; i < cart.length; i++) {
        itemRows += `
        <tr>
            <td>${cart[i].name}</td>
            <td align="center">${cart[i].quantity}</td>
            <td align="right">$${cart[i].price.toFixed(2)}</td>
            <td align="right">$${(cart[i].price * cart[i].quantity).toFixed(2)}</td>
        </tr>
    `;
    }

    // Email message options
    const mailOptions = {
        from: {
            name: "Restaurant Payment System",
            address: process.env.EMAIL_USER
        },
        to: email,
        subject: "ABC Restaurant Receipt",

        // Plain text fallback email body
        text:
            "Thank you for your order.\n\n" +
            "Your payment was processed successfully.\n" +
            "Total: $" + total.toFixed(2),

        // HTML receipt email body
        html: `
            <div style="max-width:600px; margin:auto; font-family:Arial,sans-serif; border:1px solid #ddd; border-radius:10px; overflow:hidden;">

                <div style="background:#2563eb; color:white; padding:20px; text-align:center;">
                    <h1>ABC Restaurant</h1>
                </div>

                <div style="padding:20px;">
                    <p>Valued Customer,</p>

                    <p>
                        Thank you for dining with us.
                        Your payment has been successfully processed.
                    </p>

                    <hr>

                    <h3>Order Items</h3>

                    <table width="100%">
                        <tr>
                            <th align="left">Item</th>
                            <th>Qty</th>
                            <th align="right">Price</th>
                            <th align="right">Total</th>
                        </tr>

                        ${itemRows}
                    </table>

                    <hr>

                    <h3>Order Summary</h3>

                    <table width="100%">
                        <tr>
                            <td>Subtotal</td>
                            <td align="right">$${subtotal.toFixed(2)}</td>
                        </tr>

                        <tr>
                            <td>Tax</td>
                            <td align="right">$${tax.toFixed(2)}</td>
                        </tr>

                        <tr>
                            <td><strong>Total</strong></td>
                            <td align="right">
                                <strong>$${total.toFixed(2)}</strong>
                            </td>
                        </tr>
                    </table>

                    <hr>

                    <p>Receipt Number: #${receiptID}</p>
                    <p>Date: ${new Date().toLocaleString()}</p>
                    <p>Customer Email: ${email}</p>
                </div>
            </div>
        `
    };

    // Send the receipt email
    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log("Email failed:", err.message);
            callback(err);
            return;
        }

        console.log("Email sent:", info.messageId);
        callback(null);
    });
}


// Start the server
server.listen(port, function() {
    console.log("Server running at http://localhost:" + port);
});
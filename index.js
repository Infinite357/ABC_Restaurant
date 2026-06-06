const http = require("http");
const fs = require("fs");
const port = 3000;

const server = http.createServer();

let tempVariable = 42.50;

server.on("request", function(req, res) {
    console.log("Request for " + req.url);

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

    else if (req.url === "/checkout") {
        fs.readFile("./html/checkout.html", function(err, data) {
            if (err) {
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.end("Server error.");
                return;
            }

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
        });
    }

    else if (req.url === "/payment") {
        fs.readFile("./html/payment.html", "utf8", function(err, data) {
            if (err) {
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.end("Server error.");
                return;
            }

            const updatedHTML = calculatePayment();

            const updatedPage = data.replace("<!-- PAYMENT_SUMMARY -->", updatedHTML);

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(updatedPage);
        });
    }

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

    else if (req.url === "/images/chicken-with-broccoli-11.png") {
        fs.readFile("./images/chicken-with-broccoli-11.png", function(err, data) {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("Image not found.");
                return;
            }

            res.writeHead(200, {"Content-Type": "image/png"});
            res.end(data);
        });
    }

    else if (req.url.startsWith("/validate-payment")) {
        const urlObj = new URL(req.url, "http://localhost:3000");

        const cardNumber = urlObj.searchParams.get("cardNumber");
        const expiration = urlObj.searchParams.get("expiration");
        const cvv = urlObj.searchParams.get("cvv");

        paymentResult = validatePayment(cardNumber, expiration, cvv);

        res.writeHead(302, {
            "Location": "/Success",
        });
        res.end();
    }

    else if (req.url === "/cart") {
        fs.readFile("./html/cart.html", function(err, data) {
            if (err) {
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.end("Server error.");
                return;
            }

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
        });
    }

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

    else {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("Page not found.");
    }
});

function calculatePayment() {
    let taxRate = 0.08875
    let tax = tempVariable * taxRate;
    let total = tax + tempVariable;

    return `
        <p>Subtotal: $${tempVariable.toFixed(2)}</p>
        <p>Tax: $${tax.toFixed(2)}</p>
        <p><strong>Total: $${total.toFixed(2)}</strong></p>
    `;
}

function validatePayment(cardNumber, expiration, cvv) {
    cardNumber = cardNumber.replaceAll(" ", "");

    if (cardNumber.length !== 16 || cardNumber.length !== 15) {
        return "Payment declined: card number must be 15 or 16 digits.";
    }

    if (isNaN(cardNumber)) {
        return "Payment declined: card number must contain only numbers.";
    }

    if (expiration.length !== 5 || expiration.charAt(2) !== "/") {
        return "Payment declined: expiration must be in MM/YY format.";
    }

    let month = Number(expiration.substring(0, 2));
    let year = Number(expiration.substring(3, 5));

    if (month < 1 || month > 12) {
        return "Payment declined: invalid expiration month.";
    }

    if (year < 26) {
        return "Payment declined: card is expired.";
    }

    if (cvv.length !== 3) {
        return "Payment declined: CVV must be 3 digits.";
    }

    if (isNaN(cvv)) {
        return "Payment declined: CVV must contain only numbers.";
    }

    return "Payment accepted.";
}

server.listen(port, function() {
    console.log("Server running at http://localhost:" + port);
});
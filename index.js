const http = require("http");
const fs = require("fs");
const port = 3000;

const server = http.createServer();
const nodemailer = require('nodemailer');
require('dotenv').config();
console.log(process.env.DATABASE_URL);

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

    else if (req.url === "/validate-payment" && req.method === "POST") {
        let body = "";

        req.on("data", function(chunk) {
            body += chunk;
        });

        req.on("end", function() {
            const formData = new URLSearchParams(body);

            const cardNumber = formData.get("cardNumber");
            const expiration = formData.get("expiration");
            const cvv = formData.get("cvv");
            const email = formData.get("email");

            const paymentResult =
                validatePayment(cardNumber, expiration, cvv, email);

            if (paymentResult === "Payment accepted.") {
                sendReceiptEmail(email, tempVariable, function(err) {
                    if (err) {
                        res.writeHead(500, {"Content-Type": "text/html"});
                        res.end("<h1>Payment accepted, but receipt email failed.</h1>");
                        return;
                    }

                    res.writeHead(302, {
                        "Location": "/success"
                    });
                    res.end();
                });
            }
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

    else if (req.url === "/success") {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(`
        <h1>Payment Successful</h1>
        <p>Your receipt has been emailed.</p>
        <p><a href="/">Back to Home</a></p>
    `);
    }

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

    else if (req.url.startsWith("/images/")) {
        const filePath = "." + req.url;
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

function validatePayment(cardNumber, expiration, cvv, email) {
    cardNumber = cardNumber.replaceAll(" ", "");

    if (cardNumber.length !== 16 && cardNumber.length !== 15) {
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

    if (cvv.length !== 3 && cvv.length !== 4) {
        return "Payment declined: CVV must be 3 or 4 digits.";
    }

    if (isNaN(cvv)) {
        return "Payment declined: CVV must contain only numbers.";
    }

    if (!email || !email.includes("@") || !email.includes(".")) {
        return "Payment declined: invalid email address.";
    }

    return "Payment accepted.";
}

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

function sendReceiptEmail(email, tempVariable, callback) {
    const totalNumber = Number(tempVariable);
    const receiptID = Math.floor(Math.random() * 10000000);
    const mailOptions = {
        from: {
            name: "Restaurant Payment System",
            address: process.env.EMAIL_USER
        },
        to: email,
        subject: "Your Restaurant Receipt",
        text:
            "Thank you for your order.\n\n" +
            "Your payment was processed successfully.\n" +
            "Total: $" + totalNumber.toFixed(2),
        html: `
            <div style="
    max-width:600px;
    margin:auto;
    font-family:Arial,sans-serif;
    border:1px solid #ddd;
    border-radius:10px;
    overflow:hidden;
">

    <div style="
        background:#2563eb;
        color:white;
        padding:20px;
        text-align:center;
    ">
        <h1>Restaurant Receipt</h1>
    </div>

    <div style="padding:20px;">

        <p>Hello,</p>

        <p>
            Thank you for dining with us.
            Your payment has been successfully processed.
        </p>

        <hr>

        <h3>Order Summary</h3>

        <table width="100%">
            <tr>
                <td>Subtotal</td>
                <td align="right">$24.99</td>
            </tr>

            <tr>
                <td>Tax</td>
                <td align="right">$2.22</td>
            </tr>

            <tr>
                <td><strong>Total</strong></td>
                <td align="right">
                    <strong>$27.21</strong>
                </td>
            </tr>
        </table>

        <hr>

        <p>
            Receipt Number:
            #${receiptID}
        </p>

        <p>
            Date:
            ${new Date().toLocaleString()}
        </p>

        <p>
            Customer Email:
            ${email}
        </p>

    </div>

    <div style="
        background:#f5f5f5;
        padding:15px;
        text-align:center;
        color:#666;
        font-size:12px;
    ">
        This is an automated receipt generated by
        Restaurant Payment System.
    </div>

</div>
        `
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log("Email failed:", err.message);
            callback(err);
            return;
        }

        console.log("Email sent:", info.messageId);
        console.log(email);
        callback(null);
    });
}

server.listen(port, function() {
    console.log("Server running at http://localhost:" + port);
});
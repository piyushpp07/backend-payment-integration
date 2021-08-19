const cors = require("cors");
const express = require("express");
const stripe = require("stripe")("sk_test_51JObFKSAm54TGSWjFYtH6uivWmQClLYDdXu51tCxOAn2eSNITrZWre6AjEUbQQ7kYh8dnJiq0mF0dSOOnpgK1WS900vfYdpnqV");
const { v4: uuidv4 } = require('uuid');
// uuidv4();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Add your Stripe Secret Key to the .require('stripe') statement!");
});

app.post("/checkout", async (req, res) => {
    console.log("Request:", req.body);

    let error;
    let status;
    try {
        const { product, token, amount } = req.body;

        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });

        const idempotencyKey = uuidv4();
        const charge = await stripe.charges.create(
            {
                amount: amount * 100,
                currency: "inr",
                customer: customer.id,
                receipt_email: token.email,
                description: `Purchased the ${product.name}`,
                // shipping: {
                //   name: token.card.name,
                //   address: {
                //     line1: token.card.address_line1,
                //     line2: token.card.address_line2,
                //     city: token.card.address_city,
                //     country: token.card.address_country,
                //     postal_code: token.card.address_zip
                //   }
                // }
            },
            {
                idempotencyKey
            }
        );
        console.log("Charge:", { charge });
        status = "success";
    } catch (error) {
        console.error("Error:", error);
        status = "failure";
    }

    res.json({ error, status });
});

app.listen(process.env.PORT || 5000)
console.log("Server Running")


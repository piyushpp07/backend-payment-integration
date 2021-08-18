const cors = require("cors");
const express = require("express");
const stripe = require("stripe")("sk_test_51JObFKSAm54TGSWjFYtH6uivWmQClLYDdXu51tCxOAn2eSNITrZWre6AjEUbQQ7kYh8dnJiq0mF0dSOOnpgK1WS900vfYdpnqV");
const uuid = require("uuid/v4");

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
        const { product, token } = req.body;

        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });

        const idempotency_key = uuid();
        const charge = await stripe.charges.create(
            {
                amount: product.price * 100,


            },
            {
                idempotency_key
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

app.listen(8080);

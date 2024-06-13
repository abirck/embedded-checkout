import express, { type Request } from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import * as path from "path";
import httpContext from "express-http-context";
import axios from "axios";

// Trying to keep the info about the customer objects below true but do to customer_update having to
// set things change. I should probably take in a customer ID from the frontend and add it to my debug panel
// customer based in South Carolina (no tax): cus_OpvtuwflO7Q0ae
// customer based in Washington (tax): cus_PDFSYCl9xNfGw0
const CUSTOMER = "cus_QHtzoVJ9fS2A8v";
const PRICE = "price_1PQb6QDJyQiVNnrXzepf8AZc";
const CONTINENTAL_SHIPPING = "shr_1PRLZYDJyQiVNnrXfXDY9xAL";
const AK_HI_SHIPPING = "shr_1PRLa3DJyQiVNnrX8Pe4rNRt";
const EXPEDITED_SHIPPING = "shr_1PRLaTDJyQiVNnrX3v8GnU6p";

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SK, {
  apiVersion: "2022-11-15",
});

// Initialize express app
const app = express();
app.use(httpContext.middleware);
app.use(bodyParser.json());
app.use(
  express.static(path.join(__dirname, "../public"), {
    etag: true, // Just being explicit about the default.
    lastModified: true, // Just being explicit about the default.
    setHeaders: (res, path) => {
      if (process.env.NODE_ENV === "development") {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

app.use((req, res, next) => {
  const requestId = crypto.randomBytes(4).toString("hex");
  httpContext.set("requestId", requestId);
  next();
});

app.post("/checkout", async (req: Request<{}>, res) => {
  const requestId = httpContext.get("requestId");

  // duplicate the customer object to avoid modifying the original since we're forced to set
  // customer_update.shipping to "auto" in order to get the automatic tax calculation
  console.log(
    `${requestId}:${new Date().toISOString()}: starting customer duplication from merchant server`
  );
  const cust = await stripe.customers.retrieve(CUSTOMER);
  const { name, email, address, shipping } = cust;
  const newCust = await stripe.customers.create({
    name,
    email,
    address,
    shipping,
  });
  console.log(
    `${requestId}:${new Date().toISOString()}: finished customer duplication from merchant server`
  );

  console.log(
    `${requestId}:${new Date().toISOString()}: starting stripe.checkout.sessions.create() from merchant server`
  );
  const session = await stripe.checkout.sessions.create({
    customer: newCust.id,
    shipping_options: [
      {
        shipping_rate: CONTINENTAL_SHIPPING,
      },
      {
        shipping_rate: EXPEDITED_SHIPPING,
      },
    ],
    line_items: [
      {
        price: PRICE,
        quantity: 1,
      },
    ],
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
    ui_mode: "embedded",
    redirect_on_completion: "never",
  });
  console.log(
    `${requestId}:${new Date().toISOString()}: finished stripe.checkout.sessions.create() from merchant server`
  );

  res.json({ clientSecret: session.client_secret, sessionId: session.id });
});

const requestCheckoutSession = async (
  requestId: string,
  paymentPageUrl: string
) => {
  console.log(
    `${requestId}:${new Date().toISOString()}: starting GET /v1/payment_pages/cs_test_... from merchant server`
  );
  const result = await axios.get(paymentPageUrl, {
    params: {
      key: process.env.STRIPE_PK || "",
    },
  });
  console.log(
    `${requestId}:${new Date().toISOString()}: finished GET /v1/payment_pages/cs_test_... from merchant server (prove we got a successful response: id=${
      result.data.id
    })`
  );
  return result.data;
};

app.post(
  "/setShipping",
  async (
    req: Request<{
      sessionId: string;
      address: any;
    }>,
    res
  ) => {
    try {
      const requestId = httpContext.get("requestId");
      const { sessionId, address } = req.body;
      const paymentPageUrl = `https://api.stripe.com/v1/payment_pages/${sessionId}`;
      const checkoutSessionUrl = `https://api.stripe.com/v1/checkout/sessions/${sessionId}`;

      console.log(
        `${requestId}:${new Date().toISOString()}: starting POST /v1/checkout/sessions/${sessionId} from merchant server`
      );

      const shippingRate =
        address.state === "AK" || address.state === "HI"
          ? AK_HI_SHIPPING
          : CONTINENTAL_SHIPPING;
      const params = new URLSearchParams();
      params.append("shipping_options[0][shipping_rate]", shippingRate);
      params.append("shipping_options[1][shipping_rate]", EXPEDITED_SHIPPING);
      const cs = await axios.post(checkoutSessionUrl, params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Stripe-Version":
            "2022-11-15;checkout_session_shipping_options_update_beta=v1",
        },
        auth: {
          username: process.env.STRIPE_SK || "",
          password: "",
        },
      });
      console.log(
        `${requestId}:${new Date().toISOString()}: finished POST /v1/checkout/sessions/${sessionId} from merchant server`
      );

      // request the payment page because the frontend can't construct enough session state from the checkout session
      const ppage = await requestCheckoutSession(requestId, paymentPageUrl);
      res.json({ ppage });
    } catch (err) {
      console.log(`setAddress error: ${err}`);
      res.status(400);
    }
  }
);

const startServer = async () => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, async () => {
    // other start-up stuff we don't want to do in tests
  });
};

// don't actually bind to a port in tests
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;

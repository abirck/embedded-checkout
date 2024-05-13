import React from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PK = "pk_test_FdYoaC1weOBHn0jv0KvgbHQZ";

const stripe = loadStripe(STRIPE_PK, {
  betas: ["custom_checkout_beta_2", "custom_checkout_internal_dev_beta"],
});

const CheckoutForm = ({ clientSecret, setSessionComplete }: { clientSecret: string, setSessionComplete: () => void }) => {
  const options = {
    fetchClientSecret: async () => {
      return clientSecret;
    },
    onComplete: setSessionComplete
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripe}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

export default CheckoutForm;

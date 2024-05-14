import React from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';

const STRIPE_PK = "pk_test_51Oqo7oGIhO2YPQ6AUDiiSa80ewWonP8maazR1Gr2ucC2SZOtAWFesJuUM1h6aSlB9b1d5QmaQrNyOvWmOkzix1lJ00yZroyHFf";

const stripe = loadStripe(STRIPE_PK, {
  betas: [],
});

const CheckoutForm = ({ clientSecret, setSessionComplete }: { clientSecret: string, setSessionComplete: () => void }) => {
  const options = {
    fetchClientSecret: async () => {
      return clientSecret;
    },
    onShippingAddressChange: () => {window.alert("Embedded callback: Shipping address changed")},
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

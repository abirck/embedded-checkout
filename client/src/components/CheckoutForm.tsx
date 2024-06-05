import React from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import { setShipping } from "../helpers/serverHelper";
import { Address } from "../types/address";

const STRIPE_PK =
  "pk_test_51Oqo7oGIhO2YPQ6AUDiiSa80ewWonP8maazR1Gr2ucC2SZOtAWFesJuUM1h6aSlB9b1d5QmaQrNyOvWmOkzix1lJ00yZroyHFf";

const stripe = loadStripe(STRIPE_PK, {
  betas: ['embedded_checkout_byol_beta_1'],
});

const CheckoutForm = ({
  clientSecret,
  setSessionComplete,
}: {
  clientSecret: string;
  setSessionComplete: () => void;
}) => {
  const onShippingDetailsChange = async ({
    shippingDetails,
    checkoutSessionId,
  }: {
    shippingDetails: Address;
    checkoutSessionId: string;
  }) => {
    await setShipping({ sessionId: checkoutSessionId, address: shippingDetails });
    return({ type: 'accept'})
  }; 

  const options = {
    fetchClientSecret: async () => {
      return clientSecret;
    },
    onShippingDetailsChange: onShippingDetailsChange,
    onComplete: setSessionComplete,
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripe} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

export default CheckoutForm;

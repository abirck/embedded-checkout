import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import CheckoutForm from "./CheckoutForm";
import { fetchCheckout } from "../helpers/serverHelper";

const CheckoutPage: React.FC<{
  className?: string;
  setSessionComplete: () => void;
}> = ({ className, setSessionComplete }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const getNewCheckoutSession = async () => {
    setIsFetching(true);
    try {
      const { clientSecret } = await fetchCheckout();
      setClientSecret(clientSecret);
    } finally {
      setIsFetching(false);
    }
  };

  React.useEffect(() => {
    getNewCheckoutSession();
  }, []);

  if (isFetching || !clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner className="content-center" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="pb-12 space-y-12">
        <div className="col-span-full">
          <CheckoutForm
            clientSecret={clientSecret}
            setSessionComplete={setSessionComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

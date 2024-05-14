import React, { useState } from "react";
import CheckoutPage from "./components/CheckoutPage";
import SuccessPage from "./components/SuccessPage";

const App: React.FC = () => {
  const [sessionComplete, setSessionComplete] = useState<boolean>(false);

  return (
    <div className="mx-auto max-w-xs sm:max-w-xl lg:max-w-3xl py-12 sm:py-16 lg:py-24">
      {sessionComplete ? (
        <SuccessPage />
      ) : (
        <CheckoutPage setSessionComplete={() => setSessionComplete(true)} />
      )}
    </div>
  );
};

export default App;

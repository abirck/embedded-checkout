import { type Address } from "../types/address";

export const fetchCheckout = async (): Promise<{
  clientSecret: string;
  session: any;
}> => {
  const startTime = performance.now();
  console.info(`${new Date().toISOString()}: starting POST /checkout`);
  console.time("POST /checkout");
  const res = await fetch(`/checkout`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify({}),
  });
  const endTime = performance.now();
  const elapsedTime = endTime - startTime;
  console.info(
    `${new Date().toISOString()}: finished POST /checkout (${elapsedTime.toFixed(
      3
    )} ms)`
  );

  if (res.status === 200) {
    const json = await res.json();
    const { clientSecret, session } = json;
    if (clientSecret) {
      return { clientSecret, session };
    } else {
      console.error(
        `Unexpected response  from /checkout: ${JSON.stringify(json)}`
      );
    }
  }

  throw new Error(`Unexpected status from /checkout: ${status}`);
};

export const setShipping = async ({
  sessionId,
  address,
}: {
  sessionId: string;
  address: Address;
}): Promise<{ ppage: any }> => {
  const startTime = performance.now();
  console.info(`${new Date().toISOString()}: starting POST /setAddress`);
  const res = await fetch(`/setShipping`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify({ sessionId, address }),
  });
  const endTime = performance.now();
  const elapsedTime = endTime - startTime;
  console.info(
    `${new Date().toISOString()}: finished POST /setShipping (${elapsedTime.toFixed(
      3
    )} ms)`
  );

  if (res.status === 200) {
    return await res.json();
  } else {
    throw new Error(`/setAddress return status: ${res.status}`);
  }
};

// taking the address as a param here is necessary because session doesn't contain in-progress shipping
// address so we just megre in the address we sent to the server
export const parsePaymentPageAndMergeAddress = (
  address: Address,
  ppage: any
) => {
  const { total } = ppage.line_item_group;
  const lineItems = ppage.line_item_group.line_items.map(
    (item: any): LineItem => {
      return {
        name: item.name,
        amountSubtotal: item.subtotal,
        taxAmounts: item.tax_amounts.map((tax: any): TaxAmount => {
          return {
            amount: tax.amount,
            displayName: tax.tax_rate.display_name,
            inclusive: tax.inclusive,
          };
        }),
      };
    }
  );
  const { shipping_rate } = ppage.line_item_group;
  const shippingRate = shipping_rate
    ? {
        displayName: shipping_rate.display_name,
        amount: shipping_rate.amount,
      }
    : null;
  return {
    sessionId: ppage.session_id,
    shippingAddress: address,
    lineItems,
    shippingRate,
    total,
  };
};

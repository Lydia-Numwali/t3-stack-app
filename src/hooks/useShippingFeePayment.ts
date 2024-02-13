import { useCookies } from "react-cookie";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useUpdateShippingPaymentStatus = () => {
  const [cookies] = useCookies(["jwt"]);
  const token = cookies.jwt as string;
  const headersList = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };

  const updateShippingPaymentApi = (data) => {
    const reqOptions = {
      url: "https://rac-backend.onrender.com/api/sfmRequests/paystack-payment-for-shipment",
      method: "PUT",
      headers: headersList,
      data: {
        orderId: data.orderId,
        refId: data.refId,
      },
    };

    return axios.request(reqOptions);
  };

  const updatePaymentStatus = useMutation({
    mutationFn: updateShippingPaymentApi,
  });

  return { updatePaymentStatus };
};

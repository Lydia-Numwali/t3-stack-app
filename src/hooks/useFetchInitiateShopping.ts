import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCookies } from "react-cookie";

const useFetchInitiateShoppingRequest = (productId: string, token: string) => {
  const headersList = {
   
    Authorization: "Bearer " + token,
  };
  console.log(token)
  const reqOptions = {
    url: `https://rac-backend.onrender.com/api/sfmOrders/initiate-shipping/${productId}`,
    method: "POST",
    headers: headersList,
  };

  const initiateShopping = async () => {
    try {
      const response = await axios.request(reqOptions);
      return response.data;
    } catch (error) {
      console.log(error)
      throw new Error("Failed to initiate shopping: " + error.message);
    }
  };

  initiateShopping();
};

export default useFetchInitiateShoppingRequest;

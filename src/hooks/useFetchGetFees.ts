
import axios from "axios";


const useFetchGetFeesRequest = (productId: string, token: string) => {
  const headersList = {
   
    Authorization: "Bearer " + token,
  };
  console.log(token)
  const reqOptions = {
    url: `https://rac-backend.onrender.com/apisfmRequests/mine/request-fees/${productId}`,
    method: "GET",
    headers: headersList,
  };

  const getFees = async () => {
    try {
      const response = await axios.request(reqOptions);
      return response.data;
    } catch (error) {
      console.log(error)
      throw new Error("Failed to initiate shopping: " + error.message);
    }
  };

  getFees();
};

export default useFetchGetFeesRequest;

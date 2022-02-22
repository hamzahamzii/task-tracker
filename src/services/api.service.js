const axios = require("axios").default;

//BASE URL For backend
const baseUrl = baseURL.API_URL;
import { baseURL } from "@/assets/js/urls";

const ApiService = {
  post: (endpoint, token, body) => {
    if (!token) {
      return axios.post(`${baseUrl}${endpoint}`, body);
    }
    let customAxios = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return customAxios.post(`${baseUrl}${endpoint}`, body);
  },
};

export default ApiService;

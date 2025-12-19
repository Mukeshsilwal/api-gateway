import axios from "axios";
const singUp="http://localhost:8089";
const axiosInstance = axios.create({
  baseURL: singUp,
});

export default axiosInstance;

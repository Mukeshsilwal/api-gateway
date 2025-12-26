import { toast } from "react-toastify";
import axiosInstance from "..";

export const loginByData = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/login", data);
    if (response.data) {
      return response.data;
    }
    toast.error(response.data.message);
    return null;
  } catch (error) {
    toast.error(`${error}`);
  }
};


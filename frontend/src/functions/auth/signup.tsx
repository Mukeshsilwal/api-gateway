import { toast } from "react-toastify";
import axiosInstance from "..";

export const signupByData = async (data) => {
  try {
    console.log(data);
    
    const response = await axiosInstance.post("/auth/create-user", data);
    if (response.data) {
      console.log(response.data);
      return response.data;
    }
    toast.error(response.data.message);
    return null;
  } catch (error) {
    toast.error(`${error}`);
  }
};

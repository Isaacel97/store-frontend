import axios from "axios";
import { API_URL } from "../utils/constants";

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const getSales = async () => {
  const res = await axios.get(`${API_URL}/sales`, { headers: headers() });
  return res.data;
};

export const createSale = async (data) => {
  const res = await axios.post(`${API_URL}/sales`, data, { headers: headers() });
  return res.data;
};

export const revertSale = async (data) => {
  const res = await axios.post(`${API_URL}/sales/revert`, data, { headers: headers() });
  return res.data;
};

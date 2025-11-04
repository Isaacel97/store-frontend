import axios from "axios";
import { API_URL } from "../utils/constants";

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const getProducts = async () => {
  console.log("Token:", localStorage.getItem("token"));
  console.log("Headers:", headers());
  const res = await axios.get(`${API_URL}/products`, { headers: headers() });
  return res.data;
};

export const createProduct = async (data) => {
  const res = await axios.post(`${API_URL}/products`, data, { headers: headers() });
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await axios.put(`${API_URL}/products/${id}`, data, { headers: headers() });
  return res.data;
};


export const getInventory = async () => {
  const res = await axios.get(`${API_URL}/inventory`, { headers: headers() });
  return res.data;
};

export const getInventoryByProduct = async (productId) => {
  const res = await axios.get(`${API_URL}/inventory/${productId}`, { headers: headers() });
  return res.data;
};

export const adjustStock = async (id, quantity_change, reason, user_id) => {
  const res = await axios.post(`${API_URL}/products/${id}/stock`, { quantity_change, reason, user_id }, { headers: headers() });
  return res.data;
};

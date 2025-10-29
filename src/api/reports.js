import axios from "axios";
import { API_URL } from "../utils/constants";

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const getDailySales = async (from, to) => {
  const res = await axios.get(`${API_URL}/reports/sales/daily?from=${from}&to=${to}`, { headers: headers() });
  return res.data;
};

export const getLowStock = async () => {
  const res = await axios.get(`${API_URL}/reports/stock/low`, { headers: headers() });
  return res.data;
};

export const getSalesBySeller = async (from, to) => {
  const res = await axios.get(`${API_URL}/reports/sales/sellers?from=${from}&to=${to}`, { headers: headers() });
  return res.data;
};

export const getInventoryMovements = async (limit = 50, offset = 0) => {
  const res = await axios.get(`${API_URL}/reports/inventory/movements?limit=${limit}&offset=${offset}`, { headers: headers() });
  return res.data;
};

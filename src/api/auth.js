import axios from "axios";
import { API_URL } from "../utils/constants";

export const register = async (data) => {
  const res = await axios.post(`${API_URL}/auth/register`, data);
  return res.data;
};

export const login = async (data) => {
  const res = await axios.post(`${API_URL}/auth/login`, data);
  return res.data;
};

